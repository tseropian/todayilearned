/* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue, no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({ region: 'eu-west-1' });

const TABLE_NAME = 'til-wikipedia-metadata';
const CSV_FILE = path.join(__dirname, 'wikipedia-links.csv');
const OUTPUT_FILE = path.join(__dirname, 'wikipedia-links-enriched.json');
const TOPIC_CATEGORIES_FILE = path.join(__dirname, 'topic-categories.json');

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';
const BATCH_SIZE = 50;
const REQUEST_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function normalisedKey(lang, title) {
  return `${lang}::${title.toLowerCase()}`;
}

function parseAndNormaliseCsv(csvContent) {
  const lines = csvContent.trim().split('\n').slice(1);
  const mergedMap = new Map();

  for (const line of lines) {
    const match = line.match(/^"([^"]*)",(\d+)$/);
    if (!match) continue;

    const rawUrl = match[1];
    const occurrences = parseInt(match[2], 10);

    let urlObj;
    try { urlObj = new URL(rawUrl); } catch (e) { continue; }

    const { hostname } = urlObj;
    if (!hostname.includes('wikipedia.org')) continue;

    const { pathname } = urlObj;
    if (!pathname.startsWith('/wiki/')) continue;
    if (pathname.includes('Special:') || pathname.includes('Sp%C3%A9cial:')) continue;
    if (pathname === '/wiki/Main_Page' || pathname === '/wiki/') continue;

    // Normalise: strip mobile subdomain, extract lang
    const lang = hostname
      .replace(/^en\.m\./, 'en.')
      .replace(/^fr\.m\./, 'fr.')
      .replace(/^([a-z]{2})\.wikipedia\.org$/, '$1');

    let title = decodeURIComponent(pathname.replace('/wiki/', '')).replace(/_/g, ' ');
    title = title.split('#')[0].trim();
    if (!title) continue;

    const key = normalisedKey(lang, title);
    if (mergedMap.has(key)) {
      mergedMap.get(key).occurrences += occurrences;
    } else {
      mergedMap.set(key, {
        url: rawUrl, title, lang, occurrences,
      });
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) => b.occurrences - a.occurrences);
}

async function getFromCache(titles) {
  const cached = {};
  const keys = titles.map((t) => ({ pageTitle: { S: t } }));
  const batchSize = 100;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const result = await dynamodb.batchGet({
      RequestItems: { [TABLE_NAME]: { Keys: batch.map((k) => ({ pageTitle: k.pageTitle.S })) } },
    }).promise();
    for (const item of (result.Responses[TABLE_NAME] || [])) {
      cached[item.pageTitle] = item;
    }
  }
  return cached;
}

async function saveToCache(items) {
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }
  for (const batch of batches) {
    await dynamodb.batchWrite({
      RequestItems: {
        [TABLE_NAME]: batch.map((item) => ({
          PutRequest: { Item: item },
        })),
      },
    }).promise();
  }
}

async function fetchWikipediaCategories(titles) {
  const results = {};
  const encodedTitles = titles.map(encodeURIComponent).join('|');
  const url = `${WIKIPEDIA_API_BASE}?action=query&prop=categories&cllimit=max&format=json&titles=${encodedTitles}&origin=*`;

  const data = await httpsGet(url);
  const pages = (data.query || {}).pages || {};

  for (const page of Object.values(pages)) {
    const { title } = page;
    const categories = (page.categories || []).map((c) => c.title.replace(/^Category:/, ''));
    results[title] = categories;
  }
  return results;
}

function classifyTopic(categories, topicMap) {
  for (const [topic, keywords] of Object.entries(topicMap)) {
    for (const category of categories) {
      const catLower = category.toLowerCase();
      for (const kw of keywords) {
        if (catLower.includes(kw.toLowerCase())) {
          return topic;
        }
      }
    }
  }
  return 'Other';
}

async function main() {
  const topicMap = JSON.parse(fs.readFileSync(TOPIC_CATEGORIES_FILE, 'utf8'));
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const entries = parseAndNormaliseCsv(csvContent);

  console.log(`Parsed ${entries.length} distinct pages from CSV.`);

  const enriched = [];
  const uncached = [];

  // Check DynamoDB cache for all English titles
  const enTitles = entries.filter((e) => e.lang === 'en').map((e) => e.title);
  console.log(`Checking cache for ${enTitles.length} English titles...`);

  let cached = {};
  try {
    cached = await getFromCache(enTitles);
    console.log(`Cache hits: ${Object.keys(cached).length}`);
  } catch (err) {
    console.warn('DynamoDB cache unavailable, fetching all from Wikipedia API:', err.message);
  }

  for (const entry of entries) {
    if (entry.lang !== 'en') {
      enriched.push({ ...entry, categories: [], topic: 'Other' });
      continue;
    }

    if (cached[entry.title]) {
      const hit = cached[entry.title];
      const categories = hit.categories || [];
      enriched.push({ ...entry, categories, topic: classifyTopic(categories, topicMap) });
    } else {
      uncached.push(entry);
    }
  }

  console.log(`Fetching ${uncached.length} pages from Wikipedia API...`);
  const toCache = [];

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    const titles = batch.map((e) => e.title);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uncached.length / BATCH_SIZE)}: ${titles[0]}...`);

    let categoryResults = {};
    try {
      categoryResults = await fetchWikipediaCategories(titles);
    } catch (err) {
      console.warn('  Wikipedia API error:', err.message);
    }

    for (const entry of batch) {
      const categories = categoryResults[entry.title] || [];
      const topic = classifyTopic(categories, topicMap);
      enriched.push({ ...entry, categories, topic });
      toCache.push({
        pageTitle: entry.title,
        lang: entry.lang,
        categories,
        fetchedAt: new Date().toISOString(),
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  if (toCache.length > 0) {
    try {
      await saveToCache(toCache);
      console.log(`Cached ${toCache.length} entries to DynamoDB.`);
    } catch (err) {
      console.warn('Could not save to DynamoDB cache:', err.message);
    }
  }

  enriched.sort((a, b) => b.occurrences - a.occurrences);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enriched, null, 2));
  console.log(`Wrote ${enriched.length} enriched entries to ${OUTPUT_FILE}`);
}

main().catch((err) => { console.error(err); process.exit(1); });

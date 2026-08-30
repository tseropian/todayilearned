/* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue, no-console */
// Stage 2: enrich normalised entries with Wikipedia categories and a topic,
// using the DynamoDB metadata table as a cache. Extracted from
// tools/fetch-wikipedia-metadata.js.
const https = require('https');
const { BatchGetCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

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

async function getFromCache(dynamodb, tableName, titles) {
  const cached = {};
  const batchSize = 100;
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const result = await dynamodb.send(new BatchGetCommand({
      RequestItems: { [tableName]: { Keys: batch.map((t) => ({ pageTitle: t })) } },
    }));
    for (const item of (result.Responses[tableName] || [])) {
      cached[item.pageTitle] = item;
    }
  }
  return cached;
}

async function saveToCache(dynamodb, tableName, items) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await dynamodb.send(new BatchWriteCommand({
      RequestItems: {
        [tableName]: batch.map((item) => ({ PutRequest: { Item: item } })),
      },
    }));
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
        if (catLower.includes(kw.toLowerCase())) return topic;
      }
    }
  }
  return 'Other';
}

// entries: [{ url, title, lang, occurrences }] from normaliseEntries().
async function enrichEntries(entries, { dynamodb, cacheTable, topicMap }) {
  const enriched = [];
  const uncached = [];

  const enTitles = entries.filter((e) => e.lang === 'en').map((e) => e.title);
  console.log(`Checking cache for ${enTitles.length} English titles...`);

  let cached = {};
  try {
    cached = await getFromCache(dynamodb, cacheTable, enTitles);
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
      const categories = cached[entry.title].categories || [];
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

    let categoryResults = {};
    try {
      categoryResults = await fetchWikipediaCategories(titles);
    } catch (err) {
      console.warn('  Wikipedia API error:', err.message);
    }

    for (const entry of batch) {
      const categories = categoryResults[entry.title] || [];
      enriched.push({ ...entry, categories, topic: classifyTopic(categories, topicMap) });
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
      await saveToCache(dynamodb, cacheTable, toCache);
      console.log(`Cached ${toCache.length} entries to DynamoDB.`);
    } catch (err) {
      console.warn('Could not save to DynamoDB cache:', err.message);
    }
  }

  enriched.sort((a, b) => b.occurrences - a.occurrences);
  return enriched;
}

module.exports = { enrichEntries };

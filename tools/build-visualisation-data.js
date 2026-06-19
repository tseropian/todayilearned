/* eslint-disable no-restricted-syntax, no-continue, no-console */
const fs = require('fs');
const path = require('path');

const ENRICHED_FILE = path.join(__dirname, 'wikipedia-links-enriched.json');
const CSV_FILE = path.join(__dirname, 'wikipedia-links.csv');
const TOPIC_CATEGORIES_FILE = path.join(__dirname, 'topic-categories.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'website', 'public', 'data');

const TOP_PAGES_LIMIT = 30;

const TOPIC_COLORS = {
  Music: '#6366f1',
  'TV & Film': '#f59e0b',
  Sport: '#10b981',
  Literature: '#3b82f6',
  Geography: '#84cc16',
  History: '#ef4444',
  Science: '#06b6d4',
  Politics: '#8b5cf6',
  Technology: '#f97316',
  Other: '#9ca3af',
};

function classifyByTitle(title, topicMap) {
  const t = title.toLowerCase();

  // Disambiguation suffixes in parentheses give reliable signals
  const disambigPatterns = [
    [/\((band|group|duo|singer|rapper|musician|dj|album|ep|song|soundtrack|discography)\)/i, 'Music'],
    [/\((tv series|television|series|miniseries|film|movie|documentary|animated|sitcom|drama)\)/i, 'TV & Film'],
    [/\((footballer|basketball player|baseball player|tennis player|ice hockey|rugby|cricketer|boxer|golfer|athlete|sport)\)/i, 'Sport'],
    [/\((novelist|author|writer|poet|playwright|philosopher)\)/i, 'Literature'],
    [/\((politician|president|prime minister|senator|mayor|governor|diplomat)\)/i, 'Politics'],
    [/\((city|town|village|borough|district|county|island|mountain|lake|river|region)\)/i, 'Geography'],
  ];

  for (const [re, topic] of disambigPatterns) {
    if (re.test(title)) return topic;
  }

  const titleKeywords = {
    Music: [
      'discography', 'album', 'ep (', 'soundtrack', ' band', 'rock band',
      'metal band', 'music group', 'hip-hop', 'hip hop', 'rapper', 'dj ',
      'music festival', 'record label', 'tour (music', 'punk', 'jazz',
    ],
    'TV & Film': [
      'tv series', 'television series', 'television show', '(film)', '(movie)',
      'american series', 'british series', 'french film', 'cinema', 'documentary',
      'motion picture', 'season (', 'miniseries', 'sitcom',
    ],
    Sport: [
      'nba ', 'nba)', 'nfl ', 'fifa ', 'fiba ', 'uefa ',
      'world cup', 'basketball', 'football', 'soccer', 'baseball',
      ' nhl', 'hockey', 'tennis', 'rugby', 'cricket', 'golf', 'olympics',
      'championship', ' draft', 'playoffs', 'sporting', 'stadium',
      'sports season', ' cup (', 'grand prix', 'racing', 'athletics',
    ],
    Literature: [
      'novelist', 'author', 'writer', 'poet', 'philosophy', 'philosopher',
      '(novel)', '(book)', 'literary award', '(play)', 'pulitzer',
    ],
    Geography: [
      ' city,', ' city)', ', london', ', paris', ', new york',
      ' island', ' mountain', ' lake', ' river', ' county',
      'municipality', 'borough', ', england', ', france', ', canada',
      ', australia', 'neighbourhood',
    ],
    History: [
      'world war', ' revolution', 'civil war', ' empire', ' dynasty',
      'medieval', 'ancient', 'colonial', ' battle of', 'battle of ',
      'independence', 'holocaust', 'genocide',
    ],
    Science: [
      'biology', 'physics', 'chemistry', 'mathematics', 'astronomy',
      'medicine', 'engineering', 'neuroscience', 'ecology',
    ],
    Politics: [
      'politician', 'president of', 'prime minister', 'parliament',
      ' election', 'government of', 'political party', ' congress',
    ],
    Technology: [
      'software', 'programming language', 'artificial intelligence',
      'video game', 'operating system', 'social network', 'app (', 'game studio',
    ],
  };

  for (const [topic, keywords] of Object.entries(titleKeywords)) {
    for (const kw of keywords) {
      if (t.includes(kw.toLowerCase())) return topic;
    }
  }

  if (topicMap) {
    for (const [topic, keywords] of Object.entries(topicMap)) {
      for (const kw of keywords) {
        if (t.includes(kw.toLowerCase())) return topic;
      }
    }
  }

  return 'Other';
}

function normalisedEntriesFromCsv(csvContent, topicMap) {
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

    const lang = hostname
      .replace(/^en\.m\./, 'en.')
      .replace(/^fr\.m\./, 'fr.')
      .replace(/^([a-z]{2})\.wikipedia\.org$/, '$1');

    let title = decodeURIComponent(pathname.replace('/wiki/', '')).replace(/_/g, ' ');
    title = title.split('#')[0].trim();
    if (!title) continue;

    const key = `${lang}::${title.toLowerCase()}`;
    if (mergedMap.has(key)) {
      mergedMap.get(key).occurrences += occurrences;
    } else {
      mergedMap.set(key, {
        url: rawUrl,
        title,
        lang,
        occurrences,
        categories: [],
        topic: classifyByTitle(title, topicMap),
      });
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) => b.occurrences - a.occurrences);
}

function buildTopicsData(entries) {
  const topicMap = {};
  for (const entry of entries) {
    const { topic, occurrences } = entry;
    if (!topicMap[topic]) {
      topicMap[topic] = {
        topic, color: TOPIC_COLORS[topic] || TOPIC_COLORS.Other, totalOccurrences: 0, pageCount: 0,
      };
    }
    topicMap[topic].totalOccurrences += occurrences;
    topicMap[topic].pageCount += 1;
  }
  return Object.values(topicMap).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

function buildTopPagesData(entries) {
  return entries.slice(0, TOP_PAGES_LIMIT).map((e) => ({
    title: e.title,
    url: e.url,
    lang: e.lang,
    occurrences: e.occurrences,
    topic: e.topic,
    color: TOPIC_COLORS[e.topic] || TOPIC_COLORS.Other,
  }));
}

function main() {
  let topicMap = null;
  if (fs.existsSync(TOPIC_CATEGORIES_FILE)) {
    topicMap = JSON.parse(fs.readFileSync(TOPIC_CATEGORIES_FILE, 'utf8'));
  }

  let entries;
  if (fs.existsSync(ENRICHED_FILE)) {
    console.log('Using enriched data from', ENRICHED_FILE);
    entries = JSON.parse(fs.readFileSync(ENRICHED_FILE, 'utf8'));
  } else {
    console.log('No enriched file found; falling back to CSV classification by title.');
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    entries = normalisedEntriesFromCsv(csvContent, topicMap);
  }

  console.log(`Processing ${entries.length} entries...`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const topicsData = buildTopicsData(entries);
  const topicsFile = path.join(OUTPUT_DIR, 'wikipedia-topics.json');
  fs.writeFileSync(topicsFile, JSON.stringify(topicsData, null, 2));
  console.log(`Wrote ${topicsData.length} topics to ${topicsFile}`);

  const topPagesData = buildTopPagesData(entries);
  const topPagesFile = path.join(OUTPUT_DIR, 'wikipedia-top-pages.json');
  fs.writeFileSync(topPagesFile, JSON.stringify(topPagesData, null, 2));
  console.log(`Wrote ${topPagesData.length} top pages to ${topPagesFile}`);

  console.log('\nTopic summary:');
  for (const t of topicsData) {
    console.log(`  ${t.topic.padEnd(12)} ${t.totalOccurrences} occurrences, ${t.pageCount} pages`);
  }
}

main();

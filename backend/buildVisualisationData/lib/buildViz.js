/* eslint-disable no-restricted-syntax */
// Stage 3: aggregate enriched entries into the JSON payloads the website
// visualisation page consumes. Extracted from tools/build-visualisation-data.js.

const TOP_PAGES_LIMIT = 30;

const NETWORK_MIN_OCCURRENCES = 2;
const NETWORK_MAX_CATEGORY_CLUSTER_SIZE = 40;
const NETWORK_TOP_CATEGORIES_LIMIT = 5;

// Two-Ink Riso topic scale: a blue -> coral ramp through the purple overprint,
// with a neutral char/dim for "Other". Matches the site palette tokens.
const TOPIC_COLORS = {
  Music: '#2f4eea',
  'TV & Film': '#373ab1',
  Sport: '#4b3293',
  Literature: '#723c9b',
  Geography: '#99448e',
  History: '#be4b7a',
  Science: '#d95067',
  Politics: '#ee5557',
  Technology: '#ff5b4a',
  Other: '#6b6862',
};

// Wikipedia maintenance/meta categories and generic demographic buckets that
// don't signal genuine topical similarity between pages.
const GENERIC_CATEGORY_PATTERNS = [
  /^living people$/i,
  /^\d{4}s?\s+(births|deaths)$/i,
  /^\d{4}\s+(establishments|disestablishments)\b/i,
  /^articles? (with|needing|lacking|using|containing)/i,
  /^all (articles|wikipedia articles)/i,
  /^pages using/i,
  /^short description/i,
  /^use (mdy|dmy|british|american) /i,
  /^cs1\b/i,
  /^webarchive template/i,
  /^commons category/i,
  /^wikipedia articles (with|needing)/i,
  /identifiers$/i,
  /^featured articles$/i,
  /^good articles$/i,
  /^wikidata/i,
  /^biography with signature$/i,
];

function isGenericCategory(category) {
  return GENERIC_CATEGORY_PATTERNS.some((pattern) => pattern.test(category));
}

function buildTopics(entries) {
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

function buildTopPages(entries) {
  return entries.slice(0, TOP_PAGES_LIMIT).map((e) => ({
    title: e.title,
    url: e.url,
    lang: e.lang,
    occurrences: e.occurrences,
    topic: e.topic,
    color: TOPIC_COLORS[e.topic] || TOPIC_COLORS.Other,
  }));
}

// Nested map avoids ever concatenating two titles into a single string key,
// which is unsafe since titles themselves contain spaces/punctuation.
function addEdgeWeight(edgeWeights, keyA, keyB) {
  const [a, b] = keyA < keyB ? [keyA, keyB] : [keyB, keyA];
  if (!edgeWeights.has(a)) edgeWeights.set(a, new Map());
  const inner = edgeWeights.get(a);
  inner.set(b, (inner.get(b) || 0) + 1);
}

function buildNetwork(entries) {
  const nodeEntries = entries.filter((e) => e.occurrences >= NETWORK_MIN_OCCURRENCES);

  // The same title can exist as separate pages in different languages, so key
  // graph nodes on lang+title rather than the display title alone.
  const nodeKey = (e) => `${e.lang}::${e.title}`;

  const categoryToKeys = new Map();
  for (const entry of nodeEntries) {
    for (const category of (entry.categories || [])) {
      if (isGenericCategory(category)) continue;
      if (!categoryToKeys.has(category)) categoryToKeys.set(category, []);
      categoryToKeys.get(category).push(nodeKey(entry));
    }
  }

  const edgeWeights = new Map();
  for (const keys of categoryToKeys.values()) {
    if (keys.length < 2 || keys.length > NETWORK_MAX_CATEGORY_CLUSTER_SIZE) continue;
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        addEdgeWeight(edgeWeights, keys[i], keys[j]);
      }
    }
  }

  const edges = [];
  for (const [source, targets] of edgeWeights.entries()) {
    for (const [target, weight] of targets.entries()) {
      edges.push({ source, target, weight });
    }
  }

  const nodes = nodeEntries.map((e) => ({
    id: nodeKey(e),
    label: e.title,
    url: e.url,
    topic: e.topic,
    color: TOPIC_COLORS[e.topic] || TOPIC_COLORS.Other,
    occurrences: e.occurrences,
    topCategories: (e.categories || [])
      .filter((c) => !isGenericCategory(c))
      .slice(0, NETWORK_TOP_CATEGORIES_LIMIT),
  }));

  return { nodes, edges };
}

module.exports = {
  buildTopics, buildTopPages, buildNetwork, TOPIC_COLORS,
};

/* eslint-disable no-restricted-syntax, no-await-in-loop */
// Stage 1: scan the live links table and count Wikipedia URLs.
// Extracted from tools/export-wikipedia-links-csv.js, but returns an in-memory
// Map instead of writing a CSV so the Lambda can pipe it straight to stage 2.
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

async function scanLinkCounts(dynamodb, tableName) {
  const counts = new Map();
  let lastEvaluatedKey;

  do {
    const result = await dynamodb.send(new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    for (const item of result.Items) {
      if (item.url && item.url.includes('wikipedia.org')) {
        counts.set(item.url, (counts.get(item.url) || 0) + 1);
      }
    }

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return counts;
}

// Serialise a Map<url, occurrences> to the same CSV shape as
// tools/export-wikipedia-links-csv.js (header + rows sorted by occurrences).
function countsToCsv(counts) {
  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url, occurrences]) => `"${url.replace(/"/g, '""')}",${occurrences}`);
  return ['url,occurrences', ...rows].join('\n');
}

module.exports = { scanLinkCounts, countsToCsv };

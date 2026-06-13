/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({ region: 'eu-west-1' });

const TABLE_NAME = 'til-links-appsync';
const OUTPUT_FILE = path.join(__dirname, 'wikipedia-links.csv');

async function scanAllItems() {
  const items = [];
  let lastEvaluatedKey;

  do {
    const params = {
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    // eslint-disable-next-line no-await-in-loop
    const result = await dynamodb.scan(params).promise();
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

function countWikipediaLinks(items) {
  const counts = new Map();

  for (const item of items) {
    if (item.url && item.url.includes('wikipedia.org')) {
      counts.set(item.url, (counts.get(item.url) || 0) + 1);
    }
  }

  return counts;
}

function writeCsv(counts) {
  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url, occurrences]) => `"${url.replace(/"/g, '""')}",${occurrences}`);

  const csv = ['url,occurrences', ...rows].join('\n');
  fs.writeFileSync(OUTPUT_FILE, csv);
}

(async () => {
  const items = await scanAllItems();
  const counts = countWikipediaLinks(items);
  writeCsv(counts);
  console.log(`Wrote ${counts.size} unique Wikipedia links to ${OUTPUT_FILE}`);
})();

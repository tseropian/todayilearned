/* eslint-disable no-console */
// Scheduled pipeline that rebuilds the Wikipedia visualisation data and
// publishes it to S3, where the website fetches it at runtime.
//
//   Stage 1  scan til-links-live            -> Map<url, occurrences>
//   Stage 2  enrich via Wikipedia + cache   -> [{ ..., categories, topic }]
//   Stage 3  aggregate                       -> topics + top-pages + network
//   Publish  PutObject the CSV + JSON files to S3 under DATA_PREFIX.
//            The CSV's LastModified is what the serve endpoint reports as the
//            data's createdAt.
'use strict';

const { DynamoDB, S3 } = require('aws-sdk');

const { scanLinkCounts, countsToCsv } = require('./lib/exportLinks');
const { normaliseEntries } = require('./lib/normalise');
const { enrichEntries } = require('./lib/enrich');
const { buildTopics, buildTopPages, buildNetwork } = require('./lib/buildViz');
const topicMap = require('./topic-categories.json');

const REGION = process.env.AWS_REGION || 'eu-west-1';
const LINKS_TABLE = process.env.LINKS_TABLE || 'til-links-live';
const METADATA_TABLE = process.env.METADATA_TABLE || 'til-wikipedia-metadata';
const DATA_BUCKET = process.env.DATA_BUCKET || 'todayilearned-prod';
const DATA_PREFIX = process.env.DATA_PREFIX || 'data';

const dynamodb = new DynamoDB.DocumentClient({ region: REGION });
const s3 = new S3({ region: REGION });

async function put(key, body, contentType) {
  await s3.putObject({
    Bucket: DATA_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=300',
  }).promise();
  console.log(`Uploaded s3://${DATA_BUCKET}/${key}`);
}

module.exports.build = async () => {
  console.log('Building visualisation data...');

  const counts = await scanLinkCounts(dynamodb, LINKS_TABLE);
  console.log(`Scanned ${counts.size} unique Wikipedia links.`);

  // Publish the raw CSV first; its LastModified is the data's createdAt.
  await put(`${DATA_PREFIX}/wikipedia-links.csv`, countsToCsv(counts), 'text/csv');

  const entries = normaliseEntries(counts);
  console.log(`Normalised to ${entries.length} distinct pages.`);

  const enriched = await enrichEntries(entries, {
    dynamodb, cacheTable: METADATA_TABLE, topicMap,
  });

  const topics = buildTopics(enriched);
  const topPages = buildTopPages(enriched);
  const network = buildNetwork(enriched);

  await put(`${DATA_PREFIX}/wikipedia-topics.json`, JSON.stringify(topics), 'application/json');
  await put(`${DATA_PREFIX}/wikipedia-top-pages.json`, JSON.stringify(topPages), 'application/json');
  await put(`${DATA_PREFIX}/wikipedia-network.json`, JSON.stringify(network), 'application/json');

  console.log(`Done: ${topics.length} topics, ${topPages.length} top pages, `
    + `${network.nodes.length} nodes / ${network.edges.length} edges.`);
  return {
    topics: topics.length,
    topPages: topPages.length,
    nodes: network.nodes.length,
    edges: network.edges.length,
    pages: enriched.length,
  };
};

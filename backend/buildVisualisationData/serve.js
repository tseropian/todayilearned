/* eslint-disable no-console */
// HTTP endpoint that serves the visualisation data. Reads the JSON files the
// build stage published to S3 and returns them as a single payload, together
// with `createdAt` — the LastModified of the source CSV, i.e. when the data
// was last generated.
'use strict';

const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION || 'eu-west-1';
const DATA_BUCKET = process.env.DATA_BUCKET || 'todayilearned-prod';
const DATA_PREFIX = process.env.DATA_PREFIX || 'data';

const s3 = new S3Client({ region: REGION });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300',
};

async function getJson(key) {
  const obj = await s3.send(new GetObjectCommand({ Bucket: DATA_BUCKET, Key: key }));
  return JSON.parse(await obj.Body.transformToString('utf8'));
}

module.exports.serve = async () => {
  try {
    const csvKey = `${DATA_PREFIX}/wikipedia-links.csv`;
    const [topics, topPages, network, csvHead] = await Promise.all([
      getJson(`${DATA_PREFIX}/wikipedia-topics.json`),
      getJson(`${DATA_PREFIX}/wikipedia-top-pages.json`),
      getJson(`${DATA_PREFIX}/wikipedia-network.json`),
      s3.send(new HeadObjectCommand({ Bucket: DATA_BUCKET, Key: csvKey })).catch(() => null),
    ]);

    const createdAt = csvHead && csvHead.LastModified
      ? new Date(csvHead.LastModified).toISOString()
      : null;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        createdAt, topics, topPages, network,
      }),
    };
  } catch (err) {
    console.error('Failed to serve visualisation data:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to load visualisation data' }),
    };
  }
};

'use strict';
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({ region: 'eu-west-1' });

const descriptors = ['L', 'M', 'N', 'S'];

const flatten = (o) => {

  // flattens single property objects that have descriptors  
  for (let d of descriptors) {
    if (o.hasOwnProperty(d)) {
      return o[d];
    }
  }

  Object.keys(o).forEach((k) => {

    for (let d of descriptors) {
      if (o[k].hasOwnProperty(d)) {
        o[k] = o[k][d];
      }
    }
    if (Array.isArray(o[k])) {
      o[k] = o[k].map(e => flatten(e))
    } else if (typeof o[k] === 'object') {
      o[k] = flatten(o[k])
    }
  });

  return o;
}

async function getLinksByDate(postDate) {
  const uniqueResults = [];
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    KeyConditionExpression: 'postDate = :postDate',
    ExpressionAttributeValues: {
      ':postDate': { S: postDate },
    },
  };
  let results = await dynamodb.query(params).promise().then((res) => res.Items);

  results = flatten(results);

  results.map(r => {  
    if (
      uniqueResults.filter(f => f.url === r.url).length === 0
      && 
      r.url.substr(- 4, 4) !== '.jpg'
      && 
      !r.url.includes('w/index.php')
    ) {
      uniqueResults.push(r)
    }
  });
  return uniqueResults;
}

module.exports.getLinks = async (event) => {

  const dates = event.pathParameters.date.split(',');
  const result = [];
  for (let d of dates) {
    const resultSingledate = await getLinksByDate(d);
    result.push(resultSingledate)
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify({
      result
    }),
  };
};

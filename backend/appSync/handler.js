'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.graphql = async (event) => {
  
  console.log('Received event {}', JSON.stringify(event, 3));
  console.log('Got an Invoke Request.');
  console.log(event);
  switch (event.field) {
    case 'getLinksByDate': {
      return getLinksByDate(event.argument.date);
    }

    default: {
      return `Unknown field, unable to resolve ${event.field}`, null;
    }
  }
};

async function getLinksByDate(date) {
  console.log('ladate', date)
  const params = {
    gt: {
      date: date
    },
    TableName:'appsync-intro-image-table'
    };
  
  return dynamo.get(params).promise().then(result => result.Items);
}
'use strict'
const { format } = require('date-fns')

const { v4: uuidv4 } = require('uuid')
const { DynamoDB } = require('aws-sdk')
const AWS = require('aws-sdk')
AWS.config.update({
  region: 'eu-west-1'
})
const dynamoDb = new DynamoDB.DocumentClient()

module.exports.addLink = (event, context, callback) => {
  const data = JSON.parse(event.body)
  let timestamp
  if (data.date) {
    timestamp = data.date
  } else {
    timestamp = new Date().getTime()
  }

  const postDate = format(new Date(timestamp), 'yyyy-MM-dd')
  const { url, source } = data

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      linkId: uuidv4(),
      postDate,
      url,
      source,
      date: timestamp
    }
  }

  dynamoDb.put(params, (error, result) => {
    if (error) {
      console.error(error)
      callback(new Error('Couldn\'t create link.'))
      return
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(params.Item)
    }
    callback(null, response)
  })
}

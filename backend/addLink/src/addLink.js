'use strict'

const { v4: uuidv4 } = require('uuid')
const { DynamoDB } = require('aws-sdk')
const AWS = require('aws-sdk')
AWS.config.update({
  region: 'us-east-1'
})
const dynamoDb = new DynamoDB.DocumentClient()

module.exports.addLink = (event, context, callback) => {
  const data = JSON.parse(event.body)
  console.log(data)
  let timestamp
  if (data.body.date) {
    timestamp = data.body.date
  } else {
    timestamp = new Date().getTime()
  }
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuidv4(),
      url: data.body.url,
      source: data.body.source,
      date: timestamp
    }
  }

  dynamoDb.put(params, (error, result) => {
    if (error) {
      console.error(error)
      callback(new Error('Couldn\'t create the todo item.'))
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

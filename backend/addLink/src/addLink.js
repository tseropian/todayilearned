'use strict'

const { v4: uuidv4 } = require('uuid')
const { DynamoDB } = require('aws-sdk')

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.addLink = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuidv4(),
      url: data.url,
      source: data.source,
      date: timestamp
    }
  }

  // write the todo to the database
  dynamoDb.put(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(new Error('Couldn\'t create the todo item.'))
      return
    }

    // create a response
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

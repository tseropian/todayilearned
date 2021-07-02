/* eslint-disable no-restricted-syntax */
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({ region: 'us-east-1' });
async function getLinksByDate(date) {
  const startDate = Date.parse(`${date} 00:00:00 GMT`);
  const endDate = Date.parse(`${date} 23:59:59 GMT`);
  console.log(startDate);
  console.log(endDate);
  const params = {
    TableName: 'todayilearn-appsync',
    IndexName: 'id-date-index',
    KeyConditionExpression: '#date_link BETWEEN :startDate AND :endDate',
    ExpressionAttributeValues: {
      ':startDate': { N: startDate },
      ':endDate': { N: endDate },
    },
    ExpressionAttributeNames: { '#date_link': 'date' },
  };

  dynamodb.query(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      // data.Items.sort((a, b) => parseFloat(a.Created.N) - parseFloat(b.Created.N));
      // More code here
      console.log(data);
    }
  });

  const results = await dynamodb.query(params).promise();
  return results.Items;
}

getLinksByDate('2021-06-27').then((res) => {
  console.log('Resultat2');
  console.log(res);
});

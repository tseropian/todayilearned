/* eslint-disable no-restricted-syntax */
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({ region: 'us-east-1' });
async function deleteWithThrowIfNotExists() {
  const params = {
    TableName: 'todayilearn-appsync',

  };
  let emptyItems;
  dynamodb.scan(params, (err, result) => {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      emptyItems = result.Items.filter((i) => !i.url);

      for (const item of emptyItems) {
        const paramsDel = {
          Key: {
            id: item.id,
          },
          TableName: 'todayilearn-appsync',

        };
        dynamodb.delete(paramsDel, (err2) => {
          if (err2) console.log(err, err.stack); // an error occurred
        });
      }
    }
  });
}

(async () => {
  await deleteWithThrowIfNotExists();
})();

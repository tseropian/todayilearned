/* eslint-disable no-restricted-syntax */
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({ region: 'eu-west-1' });
async function deleteWithThrowIfNotExists() {
  const params = {
    TableName: 'til-links-appsync',

  };
  let emptyItems;
  dynamodb.scan(params, (err, result) => {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      emptyItems = result.Items.filter((i) => !i.url);
      // console.log(emptyItems);
      for (const item of emptyItems) {
        console.log(item.linkId);
        const paramsDel = {
          Key: {
            linkId: item.linkId,
          },
          TableName: 'til-links-appsync',

        };

        console.log(paramsDel);
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

/* eslint-disable no-restricted-syntax */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }));
async function deleteWithThrowIfNotExists() {
  const params = {
    TableName: 'til-links-appsync',

  };
  let result;
  try {
    result = await dynamodb.send(new ScanCommand(params));
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    return;
  }

  const emptyItems = result.Items.filter((i) => !i.url);
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
    try {
      // eslint-disable-next-line no-await-in-loop
      await dynamodb.send(new DeleteCommand(paramsDel));
    } catch (err2) {
      console.log(err2, err2.stack); // an error occurred
    }
  }
}

(async () => {
  await deleteWithThrowIfNotExists();
})();

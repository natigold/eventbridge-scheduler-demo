const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { DeleteMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.AWS_REGION;

console.log("TABLE_NAME", TABLE_NAME);
console.log("REGION", REGION);
const sqsClient = new SQSClient({ region: REGION });
let ddbClient;
let docClient;

exports.handler = async(event) => {
  // process SQS batch messages in a loop
  for (let i = 0; i < event.Records.length; i++) {
    let record = event.Records[i];
    let body = JSON.parse(record.body);
    console.log(body);

    // process the message
    let data = await deleteUserByUserId(body.userId);

    if (data) {      
      // await deleteMessage(record['eventSourceARN'], record['receiptHandle']);
    }  
  }
};

/**
 * Delete user by userId from DynamoDB
 * @param {string} userId 
 * @returns {json} data
 */ 
const deleteUserByUserId = async (userId) => {
  // Set the parameters of the item to be deleted, by primary key userId
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userId
    },
  };

  if (!ddbClient) {
    ddbClient = new DynamoDBClient({ region: REGION });
    docClient = DynamoDBDocumentClient.from(ddbClient);
  }

  try {
    const data = await docClient.send(new DeleteCommand(params));
    console.log("Success, item deleted", data);
    return data;
  } catch (err) {
    console.log("Error", err);
    return;
  }
}

/* Delete a record from SQS queue
 * @param {string} queueArn
 * @param {string} receiptHandle
 */
const deleteMessage = async (queueArn, receiptHandle) => {
  const qRegion = queueArn.split(':')[3];
  const qAcctId = queueArn.split(':')[4];
  const qName = queueArn.split(':')[5];

  const queueUrl = `https://${qRegion}.queue.amazonaws.com/${qAcctId}/${qName}`;
  const command = new DeleteMessageCommand(QueueUrl=queueUrl, ReceiptHandle=receiptHandle);
  console.log(command);

  try {
    const data = await sqsClient.send(command);
    console.log("Message deleted");
    return data;
  } catch (err) {
    console.log("Error", err);
    return;
  }
}


const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

let ddbClient;
const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.AWS_REGION;
const GSI = process.env.GSI;

exports.handler = async(event) => {

  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  // Make sure we got the input we expected 
  if (event && event.timezone) {
    // Build a list of users to send the email to
    let targetUsers = await getUsersByTimezone(event['timezone']);

    if (targetUsers) {
      console.log(targetUsers);
      // send them as AWSome email !
    }
  } else {
    console.log("Function triggered with no timezone");
  }

  return {};
};

/**
 * Get all users from the database that match the timezone
 * @param {string} timezone - The timezone to filter by
 * @returns {Promise<QueryCommandOutput>}
 */ 
const getUsersByTimezone = async (timezone) => {
  let targetUsers;

  let params = {
    TableName: TABLE_NAME, // name of the table you want to read from 
    IndexName: GSI, // name of the GSI you want to use for reading 
    KeyConditionExpression: '#timezone = :pkeyval', // expression defining the partition key value for GSI 
    ExpressionAttributeNames: { 
      "#timezone": "timezone" 
    },
    ExpressionAttributeValues: { // values for expression attributes (partition key value) 
      ':pkeyval': {S: timezone} // value of the partition key you want to read from  
    }
  };

  if (!ddbClient) {
    ddbClient = new DynamoDBClient({ region: REGION });
  }

  const command = new QueryCommand(params);

  try {
    let response = await ddbClient.send(command);
    targetUsers = response.Items;
  } catch (err) {
    console.log("Error", err); 
  }

  return targetUsers;
}
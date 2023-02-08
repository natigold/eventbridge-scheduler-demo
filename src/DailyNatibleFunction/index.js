const AWS = require('aws-sdk');

let ddb = new AWS.DynamoDB();
const TABLE_NAME = process.env.TABLE_NAME;
const GSI = process.env.GSI;

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  if (event && event.timezone) {
    await getUsersByTimezone(event['timezone']);
    // send them as AWSome email !
  } else {
    console.log("Function triggered with no timezone");
  }

  return {};
};

const getUsersByTimezone = async (timezone) => {
  let params = {
    TableName: TABLE_NAME, // name of the table you want to read from 
    IndexName: GSI, // name of the GSI you want to use for reading 
    KeyConditionExpression: 'GSI_PARTITION_KEY = :pkeyval', // expression defining the partition key value for GSI 
    ExpressionAttributeValues: { // values for expression attributes (partition key value) 
      ':pkeyval': {S: timezone} // value of the partition key you want to read from  
    }  
  };

  if (!ddb) {
    ddb = new AWS.DynamoDB();
  }

  console.log("Going to query DDB", params);
  
  ddb.query(params, function(err, data) { // query DynamoDB table using GSI and partition key value specified in params 
    if (err) { // an error occurred
      console.log("Error", err);
    } else { // successful response
      console.log("Success");
      console.log("Data:", data);
    }   
  });  
}
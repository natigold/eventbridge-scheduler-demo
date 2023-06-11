const { SchedulerClient, CreateScheduleCommand } = require("@aws-sdk/client-scheduler");
const crypto = require('crypto');

SQS_ROLE_ARN = process.env.SQS_ROLE_ARN;
SQS_ARN = process.env.SQS_ARN;

const client = new SchedulerClient();

exports.handler = async(event) => {
  if (event && event.body) {
    console.log(event.body);
    let payload = JSON.parse(event.body);
    
    await createUnsubscriptionEvent(payload.userId);

    return {
      statusCode: 200,
      body: JSON.stringify(`{\"userId\": \"${payload.userId}\"}`)
    };
  } else {
    console.log("No userId in event body");

    return {
      statusCode: 400
    };
  }
};

const createUnsubscriptionEvent = async (userId) => {
  const scheduleName = crypto.randomUUID();
  const targetPayload = {
    "userId": userId
  };

  const target = {
    RoleArn: SQS_ROLE_ARN,
    Arn: SQS_ARN,
    Input: JSON.stringify(targetPayload),
  };
  
  const schedulerInput = {
    Name: "onetime-"+scheduleName,
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    Target: target,
    ScheduleExpression: 'at(2023-03-01T00:00:00)',
  };
  
  const command = new CreateScheduleCommand(schedulerInput);

  // async/await.
  try {
    const data = await client.send(command);
    console.log(`Succeeded creating schedule for ${userId}`);
  } catch (error) {
    // error handling.
    console.log("Error processing schedule", error);
  } finally {
  }
}
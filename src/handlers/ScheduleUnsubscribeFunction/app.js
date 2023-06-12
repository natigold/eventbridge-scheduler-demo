const { SchedulerClient, CreateScheduleCommand } = require("@aws-sdk/client-scheduler");
const crypto = require('crypto');

SQS_ROLE_ARN = process.env.SQS_ROLE_ARN;
SQS_ARN = process.env.SQS_ARN;

const client = new SchedulerClient();

exports.handler = async(event) => {
  if (event && event.body) {
    let payload = JSON.parse(event.body);

    const todayDate = new Date();
    const schedule = await createUnsubscriptionEvent(payload.userId, todayDate);

    if (schedule) {
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            statusCode: 200,
            message: "Success",
            userId: payload.userId
          }
        )
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          "error": "Error creating schedule",
          "code": "500"
        })
      };
    }
  } else {
    console.error("No userId in event body");

    return {
      statusCode: 400,
      body: JSON.stringify({
        "error": "No userId in event body",
        "code": "400"
      })
    }
  }
};

/* 
 * Create a one time event to unsubscribe a user from the newsletter, at the end of the current month.
 * 
 * @param {string} userId - The user's id.
 */
const createUnsubscriptionEvent = async (userId, date) => {

  let response;
  let nextMonthDate;

  // calculate the beginning of the next month
  if (date.getMonth() == 11) {
    nextMonthDate = new Date(date.getFullYear() + 1, 0, 1);
  } else {
    nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  // format date as YYYY-MM-DDTHH:MM:SS
  const endOfMonthTimestamp = nextMonthDate.toISOString().split("T")[0] + "T00:00:00";
 
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
    ScheduleExpressionTimezone: "UTC",
    ScheduleExpression: `at(${endOfMonthTimestamp})`,
  };
  
  const command = new CreateScheduleCommand(schedulerInput);

  try {
    response = await client.send(command);
    console.log(`Succeeded creating schedule for ${userId}`);
  } catch (error) {
    console.log("Error processing schedule", error);
  }

  return response;
}
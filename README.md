# eventbridge-scheduler-demo

This project contains a source code of the **Natible** application that demonstrates the use of
EventBridge Scheduler to schedule both recurring and one-time schedules, defined by various 
methods.

It includes the following files\folders:

- `src/handlers` - Lambda functions' source code.
- `events` - Invocation events that you can use to invoke the function.
- `template.yaml` - A template that defines the application's AWS resources.

The `template.yaml` defines all the required AWS resources, as well as several cron-based schedules that will be invoked on a daily basis per timezone, and target the `DailyNatibleFunction` Lambda function.

The source code includes the following Lambda functions:

- `DailyNatibleFunction` - Receives the event's timezone from the schedule, and retrieves all the users from a 
DynamoDB table that have the same timezone configured.
- `ScheduleUnsubscribeFunction` - Called by API Gateway to schedule a one-time event programatically for the end of the current month to unsubscribe the user then. Schedule will target an SQS queue that persists all unsubscribe requests.
- `UnsubscribeFunction` - Invoked by the SQS queue, and deletes unsubscribed users from the DynamoDB table.

## Deploy the application

1. AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
2. Node.js - [Install Node.js 16](https://nodejs.org/en/), including the npm package management tool.

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
* **AWS Region**: The AWS region you want to deploy your app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

## Cleanup

To delete the **Natible** application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete
```

## Resources

For an introduction to the AWS SAM specification, the AWS SAM CLI, and serverless application concepts, see the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

Amazon EventBridge Scheduler [User Guide](https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html).
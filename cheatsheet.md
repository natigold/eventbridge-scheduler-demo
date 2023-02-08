https://docs.aws.amazon.com/scheduler/latest/UserGuide/getting-started.html

{
    "arn": "<aws.scheduler.schedule-arn>",
    "time": "<aws.scheduler.scheduled-time>",
    "id": "<aws.scheduler.execution-id>",
    "attempt-number": "<aws.scheduler.attempt-number>"
}

curl --request POST https://<api-dist>.execute-api.eu-west-1.amazonaws.com/Prod/userId/ --data "{\"userId\": \"natigold@amazon.com\"}"
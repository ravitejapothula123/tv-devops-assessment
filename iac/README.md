# Infrastructure

This CDKTF stack provisions the AWS infrastructure required to run the application on ECS Fargate.

## Prerequisites

- AWS credentials with permissions to create ECR, ECS and networking resources
- Node.js and npm

## Deploy

```
npm install
echo AWS_REGION=us-east-1 > .env
npm run deploy
```

Variables can be overridden using environment variables or `cdktf.json`.

## Destroy

```
npm run destroy
```

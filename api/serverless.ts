import type {AWS} from '@serverless/typescript'

import {connectToWebsocket} from '@functions/connectToWebsocket'
import {hello} from '@functions/hello'

const serverlessConfiguration: AWS = {
  service: 'api',
  frameworkVersion: '2',
  // This version is the new one and it's needed for the crap below.
  variablesResolutionMode: '20210326',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    iam: {
      role: '${ssm:/services/api/LAMBDA_ROLE_ARN}',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    deploymentBucket: {
      name: '${ssm:/services/api/SERVERLESS_DEPLOYMENT_BUCKET}',
      serverSideEncryption: 'AES256',
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
    vpc: {
      // Types here don't account for variable lookup in the resultant cloudformation template.
      securityGroupIds:
        '${ssm:/services/api/LAMBDA_SECURITY_GROUPS}' as unknown as string[],

      subnetIds: '${ssm:/services/api/LAMBDA_SUBNETS}' as unknown as string[],
    },
    websocketsApiRouteSelectionExpression: '$request.body.type',
  },
  functions: {connectToWebsocket, hello},
}

module.exports = serverlessConfiguration

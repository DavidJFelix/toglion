import type {AWS} from '@serverless/typescript'

import {connectToWebsocket} from '@functions/connectToWebsocket'
import {disconnectFromWebsocket} from '@functions/disconnectFromWebsocket'
import {clientPing, clientPong} from '@functions/graphql-subscriptions/pingPong'
import {connectionInit} from '@functions/graphql-subscriptions/connectionInit'
import {defaultWebsocket} from '@functions/graphql-subscriptions/defaultWebsocket'
import {subscribe} from '@functions/graphql-subscriptions/subscribe'
import {onGlobalTableChange} from '@functions/onGlobalTableChange/'

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
      GLOBAL_DYNAMODB_TABLE: '${ssm:/services/api/GLOBAL_DYNAMODB_TABLE}',
      REGIONAL_DYNAMODB_TABLE: '${ssm:/services/api/REGIONAL_DYNAMODB_TABLE}',
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
  functions: {
    connectToWebsocket,
    defaultWebsocket,
    disconnectFromWebsocket,
    clientPing,
    clientPong,
    connectionInit,
    subscribe,
    onGlobalTableChange,
  },
  resources: {
    Resources: {
      CustomDomainMapping: {
        Type: 'AWS::ApiGatewayV2::ApiMapping',
        Properties: {
          DomainName: '${ssm:/services/api/WEBSOCKET_DOMAIN_NAME}',
          ApiId: {
            Ref: 'WebsocketsApi',
          },
          Stage: '${opt:stage}',
        },
      },
    },
  },
}

module.exports = serverlessConfiguration

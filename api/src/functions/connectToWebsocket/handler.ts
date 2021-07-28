import 'source-map-support/register'

import {APIGatewayProxyHandler} from 'aws-lambda'
import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {insert} from '@lib/dynamodb/insert'
import {getConfig} from '@lib/config'

// FIXME: add logging and event validation, remove response that does nothing
export const connectToWebsocket: APIGatewayProxyHandler = async (event) => {
  const config = getConfig()
  const client = new DynamoDB({})

  await insert({
    client,
    tableName: config.regionalDynamoDBTableName,
    key: {id: event.requestContext.connectionId, type: 'wsConnection'},
    value: {},
    options: {timeToLiveInSeconds: 3600},
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      type: 'on_connect_success',
      payload: {
        data: {
          message: 'connected',
          connectionId: event.requestContext.connectionId,
          region: config.awsRegion,
        },
      },
    }),
  }
}

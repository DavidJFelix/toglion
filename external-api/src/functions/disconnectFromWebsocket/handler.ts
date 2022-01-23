import 'source-map-support/register'

import {APIGatewayProxyHandler} from 'aws-lambda'
import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {softDelete} from '@lib/dynamodb/softDelete'
import {getConfig} from '@lib/config'

// FIXME: add logging and event validation, remove response that does nothing
export const disconnectFromWebsocket: APIGatewayProxyHandler = async (
  event,
) => {
  const client = new DynamoDB({})
  const config = getConfig()

  await softDelete({
    client,
    tableName: config.regionalDynamoDBTableName,
    key: {id: event.requestContext.connectionId, type: 'wsConnection'},
    options: {timeToLiveInSeconds: 300},
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      type: 'on_disconnect_success',
      payload: {
        data: {
          message: 'disconnected',
          connectionId: event.requestContext.connectionId,
          region: config.awsRegion,
        },
      },
    }),
  }
}

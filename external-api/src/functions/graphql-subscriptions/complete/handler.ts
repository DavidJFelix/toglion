import 'source-map-support/register'

import {APIGatewayProxyHandler} from 'aws-lambda'
import {getConfig} from '@lib/config'
import {
  ApiGatewayManagementApiClient,
  DeleteConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {softDelete} from '@lib/dynamodb/softDelete'

// FIXME: add middleware for logging and event validation; accept serverside event
export const complete: APIGatewayProxyHandler = async (event) => {
  const config = getConfig()
  const dbClient = new DynamoDB({})
  const apiGatewayClient = new ApiGatewayManagementApiClient({})

  const deleteConnection = new DeleteConnectionCommand({
    ConnectionId: event.requestContext.connectionId,
  })
  const mgmtPromise = apiGatewayClient.send(deleteConnection)
  const dbPromise = softDelete({
    client: dbClient,
    tableName: config.regionalDynamoDBTableName,
    key: {id: event.requestContext.connectionId, type: 'wsConnection'},
    options: {timeToLiveInSeconds: 300},
  })

  // FIXME: actually handle errors here
  await Promise.allSettled([mgmtPromise, dbPromise])

  return {
    statusCode: 4400,
    body: JSON.stringify({
      type: 'default_response',
      payload: {
        data: {
          message: `invalid message; $default Handler; reconnect and try sending a different payload like '{"type": "connection_init"} or {"type": "ping"}. Read more here: https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md'`,
          connectionId: event.requestContext.connectionId,
          region: config.awsRegion,
        },
      },
    }),
  }
}

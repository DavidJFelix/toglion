import 'source-map-support/register'

import {APIGatewayProxyHandler} from 'aws-lambda'
import {getConfig} from '@lib/config'
// FIXME: add middleware for logging and event validation
export const defaultWebsocket: APIGatewayProxyHandler = async (event) => {
  const config = getConfig()

  // FIXME: make this response via management api; drop connection; update db
  return {
    statusCode: 200,
    body: JSON.stringify({
      type: 'default_response',
      payload: {
        data: {
          message: `invalid message; $default Handler; try sending a different payload like '{"type": "connection_init"} or {"type": "ping"}. Read more here: https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md'`,
          connectionId: event.requestContext.connectionId,
          region: config.awsRegion,
        },
      },
    }),
  }
}

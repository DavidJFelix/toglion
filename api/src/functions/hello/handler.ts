import 'source-map-support/register'

import type {ValidatedEventAPIGatewayProxyEvent} from '@lib/apiGateway'
import {formatJSONResponse} from '@lib/apiGateway'
import {middyfy} from '@lib/lambda'

import schema from './schema'

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event,
) => {
  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  })
}

export const main = middyfy(hello)

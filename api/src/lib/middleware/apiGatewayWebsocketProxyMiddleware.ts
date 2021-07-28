import type {Handler} from '@faaskit/core'
import type {AWSLambdaContext} from '@faaskit/adapter-aws-lambda'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'

export interface APIGatewayProxyContext {
  APIGatewayWebsocketProxy: APIGatewayProxyEvent
}

export function APIGatewayWebsocketProxyMiddleware<
  TNextEvent = unknown,
  TContext extends AWSLambdaContext = AWSLambdaContext,
  TNextResult = unknown,
>(
  next: Handler<TNextEvent, TContext & APIGatewayProxyContext, TNextResult>,
): Handler<APIGatewayProxyEvent, TContext, APIGatewayProxyResult> {
  return async (event, context) => {
    try {
      const result = await next(JSON.parse(event.body) as TNextEvent, {
        ...context,
        APIGatewayWebsocketProxy: event,
      })
      return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(result),
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          error,
        }),
      }
    }
  }
}

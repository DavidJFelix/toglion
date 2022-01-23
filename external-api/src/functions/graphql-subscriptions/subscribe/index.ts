import {handlerPath} from '@lib/handlerResolver'
import {FunctionDefinition} from '@lib/serverless'

export const subscribe: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.subscribe`,
  events: [
    {
      websocket: {
        route: 'subscribe',
        routeResponseSelectionExpression: '$default',
      },
    },
  ],
}

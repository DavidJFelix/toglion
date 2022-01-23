import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const connectToWebsocket: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.connectToWebsocket`,
  events: [
    {
      websocket: {
        route: '$connect',
      },
    },
  ],
}

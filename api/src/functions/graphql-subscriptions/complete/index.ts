import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const complete: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.complete`,
  events: [
    {
      websocket: {
        route: 'complete',
      },
    },
  ],
}

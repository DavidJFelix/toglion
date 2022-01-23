import {handlerPath} from '@lib/handlerResolver'
import {FunctionDefinition} from '@lib/serverless'

export const onGlobalTableChange: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.onGlobalTableChange`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: '${ssm:/services/api/GLOBAL_DYNAMODB_STREAM_ARN}',
      },
    },
  ],
}

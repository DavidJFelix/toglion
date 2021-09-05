import 'source-map-support/register'

import {parseKey} from '@lib/dynamodb/utils'
import {logger} from '@lib/logging'
import {ApiGatewayManagementApi} from '@aws-sdk/client-apigatewaymanagementapi'
import {DynamoDBStreamHandler} from 'aws-lambda'
import {listV0FlagSubscriptions} from '@lib/db/v0FlagSubscription'
import {v0Flag} from '@lib/db/types'
import {TextEncoder} from 'util'

export const onGlobalTableChange: DynamoDBStreamHandler = async (event) => {
  logger.info(event)
  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      const keyString = record.dynamodb!.NewImage!.PartitionKey!.S!
      const key = parseKey(keyString)
      if (key.type === v0Flag) {
        logger.info(record)
        const subscribers = await listV0FlagSubscriptions({key: key.id})
        let promises: Promise<any>[] = []
        for (const subscriber of subscribers) {
          const connectionId = subscriber.sortKey!.id
          const executeClient = new ApiGatewayManagementApi({
            endpoint: subscriber.value.endpoint,
          })
          promises = [
            ...promises,
            executeClient.postToConnection({
              ConnectionId: connectionId,
              Data: new TextEncoder().encode(
                JSON.stringify({
                  id: key.id,
                  type: 'next',
                  payload: {
                    data: {
                      v0Flag: JSON.parse(
                        record.dynamodb!.NewImage!.RawValue!.S!,
                      ).value,
                    },
                  },
                }),
              ),
            }),
          ]
        }
        const responses = await Promise.allSettled(promises)
        logger.info(responses)
      }
    }
  }
}

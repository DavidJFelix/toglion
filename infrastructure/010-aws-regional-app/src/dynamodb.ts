import * as aws from '@pulumi/aws'
import {config} from './config'
import {localProvider} from './providers'
import {kmsKey} from './stack-references'

export const connectionsTable = new aws.dynamodb.Table(
  'connections',
  {
    attributes: [
      {name: 'id', type: 'S'},
      {name: 'host', type: 'S'},
    ],
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [
      // Connections by host
      {
        hashKey: 'host',
        rangeKey: 'id',
        name: 'host-connections',
        projectionType: 'ALL',
      },
    ],
    hashKey: 'id',
    rangeKey: 'host',
    ...(!config.isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: kmsKey!.arn,
          },
        }
      : {}),
    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },
    tags: {...config.tags},
  },
  {...(config.isLocal ? {provider: localProvider} : {})},
)

export const subscriptionsTable = new aws.dynamodb.Table(
  'subscriptions',
  {
    attributes: [
      {name: 'subscriptionKey', type: 'S'},
      {name: 'connectionId', type: 'S'},
    ],
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [
      // Subscriptions by connection
      {
        hashKey: 'connectionId',
        rangeKey: 'subscriptionKey',
        name: 'connection-subscriptions',
        projectionType: 'ALL',
      },
    ],
    hashKey: 'subscriptionKey',
    rangeKey: 'connectionId',
    ...(!config.isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: kmsKey!.arn,
          },
        }
      : {}),
    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },
    tags: {...config.tags},
  },
  {...(config.isLocal ? {provider: localProvider} : {})},
)

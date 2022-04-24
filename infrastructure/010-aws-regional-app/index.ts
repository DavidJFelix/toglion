import {Config, Output, StackReference} from '@pulumi/pulumi'
import {dynamodb, kms, Provider} from '@pulumi/aws'

// Manage configuration
interface ConfigData {
  globalBaseStackName: string
  isLocal?: boolean
  regionalBaseStackName?: string
  tags: Record<string, string>
}

const config = new Config()
const {isLocal, regionalBaseStackName, tags} =
  config.requireObject<ConfigData>('data')

const localProvider = new Provider('local-provider', {
  skipCredentialsValidation: true,
  skipRequestingAccountId: true,
  endpoints: [
    {
      dynamodb: 'http://localhost:4566',
    },
    {
      iam: 'http://localhost:4566',
    },
  ],
})

const regionalBaseStack = regionalBaseStackName
  ? new StackReference(regionalBaseStackName)
  : undefined
const kmsKey = !isLocal
  ? (regionalBaseStack!.getOutput('lambdaDeploymentKey') as Output<kms.Key>)
  : undefined

export const connectionsTable = new dynamodb.Table(
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
    ...(!isLocal
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
    tags: {...tags},
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

export const subscriptionsTable = new dynamodb.Table(
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
    ...(!isLocal
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
    tags: {...tags},
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

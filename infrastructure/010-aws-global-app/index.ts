import {Config, Output, StackReference} from '@pulumi/pulumi'
import {dynamodb, getRegionOutput, kms} from '@pulumi/aws'

const awsRegion = getRegionOutput().apply(({name}) => name)

// Manage configuration
interface ConfigData {
  regionStackNames: Record<string, string>
  tags: Record<string, string>
}

const config = new Config()
const {regionStackNames, tags} = config.requireObject<ConfigData>('data')

// Get cross-stack outputs
const stacks = Object.fromEntries(
  Object.entries(regionStackNames).map(([regionName, stackName]) => [
    regionName,
    new StackReference(stackName),
  ]),
)
const kmsKeys = Object.fromEntries(
  Object.entries(stacks).map(([regionName, stack]) => [
    regionName,
    stack.getOutput('lambdaDeploymentKey') as Output<kms.Key>,
  ]),
)

export const apiKeysTable = new dynamodb.Table('api-keys', {
  attributes: [
    {name: 'groupId', type: 'S'},
    {name: 'name', type: 'S'},
    {name: 'id', type: 'S'},
    {name: 'userId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    // Belongs To
    {
      hashKey: 'groupId',
      rangeKey: 'id',
      name: 'owner-group',
      projectionType: 'ALL',
    },
    // Query Key
    {hashKey: 'name', name: 'name', projectionType: 'ALL'},
    // Belongs To
    {
      hashKey: 'userId',
      rangeKey: 'id',
      name: 'owner-user',
      projectionType: 'ALL',
    },
  ],
  hashKey: 'id',
  serverSideEncryption: {
    enabled: true,
    kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
  },
  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
  replicas: awsRegion.apply((awsRegion) =>
    Object.entries(kmsKeys)
      .filter(([region]) => region !== awsRegion)
      .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
  ),
  streamEnabled: true,
  streamViewType: 'NEW_AND_OLD_IMAGES',
  tags: {...tags},
})

export const authAccountsTable = new dynamodb.Table('auth-accounts', {
  attributes: [
    {name: 'id', type: 'S'},
    {name: 'userId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    // Belongs to
    {
      hashKey: 'userId',
      name: 'linked-user',
      projectionType: 'ALL',
      rangeKey: 'id',
    },
  ],
  hashKey: 'id',
  serverSideEncryption: {
    enabled: true,
    kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
  },
  replicas: awsRegion.apply((awsRegion) =>
    Object.entries(kmsKeys)
      .filter(([region]) => region !== awsRegion)
      .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
  ),
  streamEnabled: true,
  streamViewType: 'NEW_AND_OLD_IMAGES',
  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
  tags: {...tags},
})

export const emailVerificationTokenTable = new dynamodb.Table(
  'email-verification-tokens',
  {
    attributes: [{name: 'id', type: 'S'}],
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [],
    hashKey: 'id',
    serverSideEncryption: {
      enabled: true,
      kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
    },
    replicas: awsRegion.apply((awsRegion) =>
      Object.entries(kmsKeys)
        .filter(([region]) => region !== awsRegion)
        .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
    ),
    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },
    tags: {...tags},
  },
)

export const organizationsTable = new dynamodb.Table('organizations', {
  attributes: [
    {name: 'name', type: 'S'},
    {name: 'id', type: 'S'},
    {name: 'ownerUserId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    // Query Key
    {hashKey: 'name', name: 'name', projectionType: 'ALL'},
    // Belongs to
    {
      hashKey: 'ownerUserId',
      rangeKey: 'id',
      name: 'owner-user',
      projectionType: 'ALL',
    },
  ],
  hashKey: 'id',
  serverSideEncryption: {
    enabled: true,
    kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
  },
  replicas: awsRegion.apply((awsRegion) =>
    Object.entries(kmsKeys)
      .filter(([region]) => region !== awsRegion)
      .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
  ),
  streamEnabled: true,
  streamViewType: 'NEW_AND_OLD_IMAGES',
  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
  tags: {...tags},
})

export const sessionsTable = new dynamodb.Table('sessions', {
  attributes: [
    {name: 'id', type: 'S'},
    {name: 'userId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    // Belongs To
    {
      hashKey: 'userId',
      rangeKey: 'id',
      name: 'user',
      projectionType: 'ALL',
    },
  ],
  hashKey: 'id',
  serverSideEncryption: {
    enabled: true,
    kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
  },
  replicas: awsRegion.apply((awsRegion) =>
    Object.entries(kmsKeys)
      .filter(([region]) => region !== awsRegion)
      .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
  ),
  streamEnabled: true,
  streamViewType: 'NEW_AND_OLD_IMAGES',
  tags: {...tags},
  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
})

export const usersTable = new dynamodb.Table('users', {
  attributes: [
    {name: 'alias', type: 'S'},
    {name: 'email', type: 'S'},
    {name: 'id', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  globalSecondaryIndexes: [
    // Query Key
    {hashKey: 'alias', name: 'alias', projectionType: 'ALL'},
    // Query Key
    {hashKey: 'email', name: 'email', projectionType: 'ALL'},
  ],
  hashKey: 'id',
  serverSideEncryption: {
    enabled: true,
    kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
  },
  replicas: awsRegion.apply((awsRegion) =>
    Object.entries(kmsKeys)
      .filter(([region]) => region !== awsRegion)
      .map(([regionName, kmsKey]) => ({kmsKeyArn: kmsKey.arn, regionName})),
  ),
  streamEnabled: true,
  streamViewType: 'NEW_AND_OLD_IMAGES',
  tags: {...tags},
  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
})

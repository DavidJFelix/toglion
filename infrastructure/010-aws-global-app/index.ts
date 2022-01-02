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

const apiKeysTable = new dynamodb.Table('api-keys', {
  attributes: [
    {name: 'groupId', type: 'S'},
    {name: 'name', type: 'S'},
    {name: 'pk', type: 'S'},
    {name: 'sk', type: 'S'},
    {name: 'userId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  hashKey: 'pk',
  rangeKey: 'sk',
  globalSecondaryIndexes: [
    {
      hashKey: 'groupId',
      rangeKey: 'pk',
      name: 'owner-group',
      projectionType: 'ALL',
    },
    {hashKey: 'name', name: 'name', projectionType: 'ALL'},
    {
      hashKey: 'userId',
      rangeKey: 'pk',
      name: 'owner-user',
      projectionType: 'ALL',
    },
  ],
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

const organizationsTable = new dynamodb.Table('organizations', {
  attributes: [
    {name: 'name', type: 'S'},
    {name: 'pk', type: 'S'},
    {name: 'sk', type: 'S'},
    {name: 'ownerUserId', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  hashKey: 'pk',
  rangeKey: 'sk',
  globalSecondaryIndexes: [
    {hashKey: 'name', name: 'name', projectionType: 'ALL'},
    {
      hashKey: 'ownerUserId',
      rangeKey: 'pk',
      name: 'owner',
      projectionType: 'ALL',
    },
  ],
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

const usersTable = new dynamodb.Table('users', {
  attributes: [
    {name: 'alias', type: 'S'},
    {name: 'groupId', type: 'S'},
    {name: 'pk', type: 'S'},
    {name: 'sk', type: 'S'},
  ],
  billingMode: 'PAY_PER_REQUEST',
  hashKey: 'pk',
  rangeKey: 'sk',
  globalSecondaryIndexes: [
    {hashKey: 'alias', name: 'alias', projectionType: 'ALL'},
    {hashKey: 'groupId', rangeKey: 'pk', name: 'groups', projectionType: 'ALL'},
  ],
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

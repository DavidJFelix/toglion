import {Config, getStack, Output, StackReference} from '@pulumi/pulumi'
import {dynamodb, getRegionOutput, iam, kms, Provider} from '@pulumi/aws'
import {PolicyStatement} from '@pulumi/aws/iam'

// Manage configuration
interface ConfigData {
  isLocal?: boolean
  regionalBaseStackNames?: Record<string, string>
  tags: Record<string, string>
}

const config = new Config()
const {isLocal, regionalBaseStackNames, tags} =
  config.requireObject<ConfigData>('data')

// Get cross-stack outputs
const regionalBaseStacks = Object.fromEntries(
  Object.entries(regionalBaseStackNames ?? {}).map(
    ([regionName, stackName]) => [regionName, new StackReference(stackName)],
  ),
)
const kmsKeys = Object.fromEntries(
  Object.entries(regionalBaseStacks).map(([regionName, stack]) => [
    regionName,
    stack.getOutput('lambdaDeploymentKey') as Output<kms.Key>,
  ]),
)

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

const awsRegion = getRegionOutput(
  {},
  {...(isLocal ? {provider: localProvider} : {})},
).apply(({name}) => name)

export const apiKeysTable = new dynamodb.Table(
  'api-keys',
  {
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
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
        }
      : {}),
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },

    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    tags: {...tags},
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

export const authAccountsTable = new dynamodb.Table(
  'auth-accounts',
  {
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
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
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

export const emailVerificationTokenTable = new dynamodb.Table(
  'email-verification-tokens',
  {
    attributes: [{name: 'id', type: 'S'}],
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [],
    hashKey: 'id',
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
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

export const flagsTable = new dynamodb.Table(
  'flags',
  {
    attributes: [
      {name: 'name', type: 'S'},
      {name: 'id', type: 'S'},
      {name: 'organizationId', type: 'S'},
    ],
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [
      // Query Key
      {
        hashKey: 'organizationId',
        rangeKey: 'name',
        name: 'name-by-organization',
        projectionType: 'ALL',
      },
      // Belongs To
      {
        hashKey: 'organizationId',
        rangeKey: 'id',
        name: 'organization',
        projectionType: 'ALL',
      },
    ],
    hashKey: 'id',
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
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

export const organizationsTable = new dynamodb.Table(
  'organizations',
  {
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
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
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

export const sessionsTable = new dynamodb.Table(
  'sessions',
  {
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
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
        }
      : {}),
    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    tags: {...tags},
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

export const usersTable = new dynamodb.Table(
  'users',
  {
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
    ...(!isLocal
      ? {
          serverSideEncryption: {
            enabled: true,
            kmsKeyArn: awsRegion.apply((awsRegion) => kmsKeys[awsRegion].arn),
          },
          replicas: awsRegion.apply((awsRegion) =>
            Object.entries(kmsKeys)
              .filter(([region]) => region !== awsRegion)
              .map(([regionName, kmsKey]) => ({
                kmsKeyArn: kmsKey.arn,
                regionName,
              })),
          ),
        }
      : {}),
    streamEnabled: true,
    streamViewType: 'NEW_AND_OLD_IMAGES',
    tags: {...tags},
    ttl: {
      enabled: true,
      attributeName: 'ttl',
    },
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

export const dynamodbPolicy = new iam.Policy(
  'dynamodb',
  {
    description:
      'A policy which allows read/write access to the dynamodb tables created for the application.',
    namePrefix: `dynamodb-${getStack()}`,
    policy: {
      Statement: [
        {
          Action: [
            'dynamodb:BatchGetItem',
            'dynamodb:BatchWriteItem',
            'dynamodb:ConditionCheckItem',
            'dynamodb:PutItem',
            'dynamodb:DeleteItem',
            'dynamodb:PartiQLUpdate',
            'dynamodb:Scan',
            'dynamodb:Query',
            'dynamodb:UpdateItem',
            'dynamodb:PartiQLSelect',
            'dynamodb:PartiQLInsert',
            'dynamodb:GetItem',
            'dynamodb:PartiQLDelete',
          ],
          Effect: 'Allow',
          Resource: [
            apiKeysTable.arn,
            apiKeysTable.arn.apply((arn) => `${arn}/index/name`),
            apiKeysTable.arn.apply((arn) => `${arn}/index/owner-group`),
            apiKeysTable.arn.apply((arn) => `${arn}/index/owner-user`),
            authAccountsTable.arn,
            authAccountsTable.arn.apply((arn) => `${arn}/index/linked-user`),
            emailVerificationTokenTable.arn,
            organizationsTable.arn,
            organizationsTable.arn.apply((arn) => `${arn}/index/name`),
            organizationsTable.arn.apply((arn) => `${arn}/index/owner-user`),
            sessionsTable.arn,
            sessionsTable.arn.apply((arn) => `${arn}/index/user`),
            usersTable.arn,
            usersTable.arn.apply((arn) => `${arn}/index/alias`),
            usersTable.arn.apply((arn) => `${arn}/index/email`),
          ],
        },
        ...(!isLocal
          ? ([
              {
                Action: [
                  'kms:Encrypt',
                  'kms:Decrypt',
                  'kms:ReEncrypt*',
                  'kms:GenerateDataKey*',
                  'kms:DescribeKey',
                  'kms:CreateGrant',
                ],
                Effect: 'Allow',
                Resource: [
                  ...Object.entries(kmsKeys).map(
                    ([_region, kmsKey]) => kmsKey.arn,
                  ),
                ],
              },
            ] as PolicyStatement[])
          : []),
      ],
      Version: '2012-10-17',
    },
    tags: {...tags},
  },
  {...(isLocal ? {provider: localProvider} : {})},
)

export const vercelIamUser = !isLocal
  ? new iam.User('vercel', {
      name: `vercel-${getStack()}`,
      tags: {...tags},
    })
  : null

export const vercelIamPolicyAttachment = !isLocal
  ? new iam.UserPolicyAttachment('vercel', {
      policyArn: dynamodbPolicy.arn,
      user: vercelIamUser!.name,
    })
  : null

export const vercelAccessKey = !isLocal
  ? new iam.AccessKey('vercel', {
      user: vercelIamUser!.name,
      pgpKey: 'keybase:davidjfelix',
    })
  : null

import {getProject, getStack} from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import {config} from './config'
import {lambdaDeploymentKey} from './kms'

export const s3AccessLogBucket = new aws.s3.Bucket('access-log', {
  acl: 'log-delivery-write',
  bucketPrefix: 'access-log',
  serverSideEncryptionConfiguration: {
    rule: {
      // (2021-12-11) Log delivery buckets cannot be KMS encrypted
      // The service account which does log delivery rotates and can't be granted
      // kms permissions
      applyServerSideEncryptionByDefault: {
        sseAlgorithm: 'AES256',
      },
    },
  },
  tags: {...config.tags},
})

export const lambdaDeploymentBucket = new aws.s3.Bucket('lambda-deployment', {
  acl: 'private',
  bucketPrefix: 'lambda-deployment',
  loggings: [
    {
      targetBucket: s3AccessLogBucket.id,
      targetPrefix: `aws/s3/${getProject()}/${getStack()}/lambda-deployment/`,
    },
  ],
  serverSideEncryptionConfiguration: {
    rule: {
      applyServerSideEncryptionByDefault: {
        kmsMasterKeyId: lambdaDeploymentKey.keyId,
        sseAlgorithm: 'aws:kms',
      },
    },
  },
  tags: {...config.tags},
  // Versioning makes this bucket easier operationally to see historic deployments
  versioning: {
    enabled: true,
  },
})

import {Config, getProject, getStack} from '@pulumi/pulumi'
import {kms, s3} from '@pulumi/aws'

interface AWSBaseData {
  tags: Record<string, string>
}

const config = new Config()
const {tags} = config.requireObject<AWSBaseData>('data')

// We'll use this key for lambda deployment including source encryption
// as well as env variable encryption
export const lambdaDeploymentKey = new kms.Key('lambda-deployment', {
  description: 'A kms key for AWS Access Logs',
  enableKeyRotation: true,
  tags: {...tags},
})

export const lambdaDeploymentKeyAlias = new kms.Alias('lambda-deployment', {
  namePrefix: 'alias/lambda-deployment',
  targetKeyId: lambdaDeploymentKey.keyId,
})

export const s3AccessLogBucket = new s3.Bucket('access-log', {
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
  tags: {...tags},
})

export const lambdaDeploymentBucket = new s3.Bucket('lambda-deployment', {
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
  tags: {...tags},
  // Versioning makes this bucket easier operationally to see historic deployments
  versioning: {
    enabled: true,
  },
})

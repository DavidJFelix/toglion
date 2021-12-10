import {Config} from '@pulumi/pulumi'
import {iam, kms, route53, s3} from '@pulumi/aws'

interface AWSBaseData {
  tags: Record<string, string>
}

const config = new Config()
const {tags} = config.requireObject<AWSBaseData>('data')

export const rootLoggingKey = new kms.Key('root-logging', {
  description: 'A kms key for AWS Access Logs',
  enableKeyRotation: true,
  tags: {},
})

export const rootLoggingKeyAlias = new kms.Alias('root-logging', {
  namePrefix: 'alias/root-logging',
  targetKeyId: rootLoggingKey.keyId,
})

export const s3AccessLogBucket = new s3.Bucket('access-log', {
  acl: 'log-delivery-write',
  bucketPrefix: 'access-log',
  serverSideEncryptionConfiguration: {
    rule: {
      applyServerSideEncryptionByDefault: {
        sseAlgorithm: 'aws:kms',
        kmsMasterKeyId: rootLoggingKey.keyId,
      },
    },
  },
  tags: {},
})

export const lambdaDeploymentBucket = new s3.Bucket('lambda-deployment', {
  serverSideEncryptionConfiguration: {
    rule: {
      applyServerSideEncryptionByDefault: {
        sseAlgorithm: 'AES256',
      },
    },
  },
})

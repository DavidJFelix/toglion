import {getProject, getStack} from '@pulumi/pulumi'
import {acm, kms, route53, s3} from '@pulumi/aws'

import {config} from './config'
import {route53MainZone} from './stack-references'

// We'll use this key for lambda deployment including source encryption
// as well as env variable encryption
export const lambdaDeploymentKey = new kms.Key('lambda-deployment', {
  description: 'A kms key for AWS Access Logs',
  enableKeyRotation: true,
  tags: {...config.tags},
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
  tags: {...config.tags},
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
  tags: {...config.tags},
  // Versioning makes this bucket easier operationally to see historic deployments
  versioning: {
    enabled: true,
  },
})

// ACM certificate
export const acmMainCertificate = new acm.Certificate('main', {
  domainName: route53MainZone.name,
  options: {
    certificateTransparencyLoggingPreference: 'ENABLED',
  },
  subjectAlternativeNames: [route53MainZone.apply(({name}) => `*.${name}`)],
  tags: {...config.tags},
  validationMethod: 'DNS',
})

export const route53ValidationRecords =
  acmMainCertificate.domainValidationOptions.apply((dvos) =>
    dvos.map(
      (dvo) =>
        new route53.Record(
          `main-${dvo.domainName}-${dvo.resourceRecordName}`,
          {
            allowOverwrite: true,
            name: dvo.resourceRecordName,
            records: [dvo.resourceRecordValue],
            ttl: 60,
            type: dvo.resourceRecordType,
            zoneId: route53MainZone.id,
          },
          {deleteBeforeReplace: true},
        ),
    ),
  )

export const acmMainValidation = new acm.CertificateValidation('main', {
  certificateArn: acmMainCertificate.arn,
  validationRecordFqdns: route53ValidationRecords.apply((records) =>
    records.map(({fqdn}) => fqdn),
  ),
})

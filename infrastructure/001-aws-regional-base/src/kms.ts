import * as aws from '@pulumi/aws'

import {config} from './config'

// We'll use this key for lambda deployment including source encryption
// as well as env variable encryption
export const lambdaDeploymentKey = new aws.kms.Key('lambda-deployment', {
  description: 'A kms key for AWS Access Logs',
  enableKeyRotation: true,
  tags: {...config.tags},
})

export const lambdaDeploymentKeyAlias = new aws.kms.Alias('lambda-deployment', {
  namePrefix: 'alias/lambda-deployment',
  targetKeyId: lambdaDeploymentKey.keyId,
})

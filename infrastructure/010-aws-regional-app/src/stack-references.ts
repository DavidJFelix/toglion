import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import {config} from './config'

export const regionalBaseStack = config.regionalBaseStackName
  ? new pulumi.StackReference(config.regionalBaseStackName)
  : undefined
export const kmsKey = !config.isLocal
  ? (regionalBaseStack!.getOutput(
      'lambdaDeploymentKey',
    ) as pulumi.Output<aws.kms.Key>)
  : undefined

import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'

import {config} from './config'

export const regionalBaseStack = config.regionalBaseStackName
  ? new pulumi.StackReference(config.regionalBaseStackName)
  : undefined
export const kmsKey = !config.isLocal
  ? (regionalBaseStack!.getOutput(
      'lambdaDeploymentKey',
    ) as pulumi.Output<aws.kms.Key>)
  : undefined

export const regionalBaseVpc = !config.isLocal
  ? (regionalBaseStack!.getOutput('mainVpc') as pulumi.Output<awsx.ec2.Vpc>)
  : undefined

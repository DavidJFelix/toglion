import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import {config} from './config'

// Get cross-stack outputs
export const globalBaseStack = new pulumi.StackReference(
  config.globalBaseStackName,
)
export const route53MainZone = globalBaseStack.getOutput(
  'route53MainZone',
) as pulumi.Output<aws.route53.Zone>

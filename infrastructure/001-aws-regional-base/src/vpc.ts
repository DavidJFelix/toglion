import * as awsx from '@pulumi/awsx'
import * as aws from '@pulumi/aws'
import {config} from './config'

const azs = aws.getAvailabilityZonesOutput({state: 'available'})

export const mainVpc = azs.apply(
  (azs) =>
    new awsx.ec2.Vpc('main', {
      subnetSpecs: [
        {
          cidrMask: 22,
          name: 'public',
          type: awsx.ec2.SubnetType.Public,
        },
      ],
      numberOfAvailabilityZones: azs.zoneIds.length,
      natGateways: {strategy: awsx.ec2.NatGatewayStrategy.None},
      tags: {...config.tags},
    }),
)

import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import {regionalBaseVpc} from './stack-references'

export const eventGatewayRepository = new awsx.ecr.Repository('event-gateway')

// export const eventGatewayLoadBalancer = new aws.alb.LoadBalancer(
//   'event-gateway',
//   {
//     subnets: regionalBaseVpc
//       ?.apply((vpc) => vpc.subnets)
//       .apply((subnets) => subnets.map((subnet) => subnet.id)),
//   },
// )

export const eventGatewayCluster = new aws.ecs.Cluster('event-gateway')

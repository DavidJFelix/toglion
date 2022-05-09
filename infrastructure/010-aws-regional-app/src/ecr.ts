import * as awsx from '@pulumi/awsx'

export const eventGatewayRepository = new awsx.ecr.Repository('event-gateway')

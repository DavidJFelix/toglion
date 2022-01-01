import {
  Config,
  getProject,
  getStack,
  Output,
  StackReference,
} from '@pulumi/pulumi'
import {acm, apigatewayv2, route53} from '@pulumi/aws'

// Manage configuration
interface ConfigData {
  globalBaseStackName: string
  regionalBaseStackName: string
  tags: Record<string, string>
}

const config = new Config()
const {globalBaseStackName, regionalBaseStackName, tags} =
  config.requireObject<ConfigData>('data')

// Get cross-stack outputs
const globalBaseStack = new StackReference(globalBaseStackName)
const route53MainZone = globalBaseStack.getOutput(
  'route53MainZone',
) as Output<route53.Zone>

const regionalBaseStack = new StackReference(regionalBaseStackName)
const acmMainCertificate = regionalBaseStack.getOutput(
  'acmMainCertificate',
) as Output<acm.Certificate>

export const wsApiDomainName = new apigatewayv2.DomainName('websocket', {
  domainName: route53MainZone.apply(({name}) => `wsapi.${name}`),
  domainNameConfiguration: {
    certificateArn: acmMainCertificate.arn,
    endpointType: 'REGIONAL',
    securityPolicy: 'TLS_1_2',
  },
})

export const restApiDomainName = new apigatewayv2.DomainName('rest', {
  domainName: route53MainZone.apply(({name}) => `api.${name}`),
  domainNameConfiguration: {
    certificateArn: acmMainCertificate.arn,
    endpointType: 'REGIONAL',
    securityPolicy: 'TLS_1_2',
  },
})

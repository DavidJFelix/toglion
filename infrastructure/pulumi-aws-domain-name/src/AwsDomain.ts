import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Inputs,
  ProviderResource,
} from '@pulumi/pulumi'
import {acm, Provider, Region, route53} from '@pulumi/aws'
import {input} from '@pulumi/aws/types'

const commonTags = {
  IacType: 'Pulumi',
  IsPulumi: 'True',
  PulumiModule: 'AwsDomain',
}

export interface AwsDomainInputs extends Inputs {
  domainName: Input<string>
  regions: Region[]
  tags?: Input<Record<string, Input<string>>>
}

export class AwsDomain extends ComponentResource {
  readonly zone: route53.Zone
  readonly validationRecords: Partial<Record<Region, route53.Record[]>>
  readonly certificates: Partial<Record<Region, acm.Certificate>>
  readonly validations: Partial<Record<Region, acm.CertificateValidation>>

  constructor(
    name: string,
    args: AwsDomainInputs,
    opts?: ComponentResourceOptions,
  ) {
    super('toglion:components:AwsDomain', name, args, opts)

    const {domainName, regions, tags} = args

    this.zone = new route53.Zone(`${domainName}-main`, {
      name: domainName,
      tags: {...commonTags, ...tags},
    })

    this.certificates = {}
    this.validationRecords = {}
    this.validations = {}

    regions.forEach((region) => {
      const provider = new Provider(`provider=${region}`, {region})
      const certificate = new acm.Certificate(
        `${domainName}-main-${region}`,
        {
          domainName,
          options: {
            certificateTransparencyLoggingPreference: 'ENABLED',
          },
          subjectAlternativeNames: [`*.${domainName}`],
          tags: {...commonTags, ...tags},
          validationMethod: 'DNS',
        },
        {provider},
      )
      this.certificates[region] = certificate
      const validationRecords = certificate.domainValidationOptions.get().map(
        ({resourceRecordName, resourceRecordType, resourceRecordValue}) =>
          new route53.Record(`${domainName}-main-${region}`, {
            allowOverwrite: true,
            name: resourceRecordName,
            records: [resourceRecordValue],
            ttl: 60,
            type: resourceRecordType,
            zoneId: this.zone.id,
          }),
      )
      this.validationRecords[region] = validationRecords

      const validation = new acm.CertificateValidation(
        `${domainName}-main-${region}`,
        {
          certificateArn: certificate.arn,
          validationRecordFqdns: validationRecords.map(({fqdn}) => fqdn),
        },
      )
      this.validations[region] = validation
    })
  }
}

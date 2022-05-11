import * as aws from '@pulumi/aws'

import {config} from './config'
import {route53MainZone} from './stack-references'

// ACM certificate
export const acmMainCertificate = new aws.acm.Certificate('main', {
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
        new aws.route53.Record(
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

export const acmMainValidation = new aws.acm.CertificateValidation('main', {
  certificateArn: acmMainCertificate.arn,
  validationRecordFqdns: route53ValidationRecords.apply((records) =>
    records.map(({fqdn}) => fqdn),
  ),
})

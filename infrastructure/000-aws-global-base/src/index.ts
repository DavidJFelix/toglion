import {Config} from '@pulumi/pulumi'
import {iam, route53} from '@pulumi/aws'

interface AWSBaseData {
  domainName: string
  tags: Record<string, string>
}

const config = new Config()
const {domainName, tags} = config.requireObject<AWSBaseData>('data')

///////////////////
// Automation Group
export const iamAutomationGroup = new iam.Group('automation-cicd', {
  name: 'automation-cicd',
  path: '/automation/cicd/',
})

const iamAutomationCICDAdministrator = new iam.GroupPolicyAttachment(
  'automation-cicd-administrator',
  {
    group: iamAutomationGroup.name,
    policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
  },
)

///////////////////
// Pulumi User
export const iamPulumiUser = new iam.User('pulumi', {
  name: 'pulumi',
  path: '/automation/cicd/pulumi/',
  tags: {
    ...tags,
    Name: 'Pulumi Automation User',
    Description: 'User used by Pulumi for CICD of infrastructure',
  },
})

export const iamPulumiKey = new iam.AccessKey('pulumi', {
  user: iamPulumiUser.name,
  pgpKey: 'keybase:davidjfelix',
})

const iamPulumiGroupMembership = new iam.UserGroupMembership('pulumi', {
  user: iamPulumiUser.name,
  groups: [iamAutomationGroup.name],
})

/////////////////
// GitHub User
export const iamGithubUser = new iam.User('github', {
  name: 'github',
  path: '/automation/cicd/github/',
  tags: {
    ...tags,
    Name: 'Github Automation User',
    Description: 'User used by Github Actions for CICD of the application',
  },
})

export const iamGithubKey = new iam.AccessKey('github', {
  user: iamGithubUser.name,
  pgpKey: 'keybase:davidjfelix',
})

const iamGithubGroupMembership = new iam.UserGroupMembership('github', {
  user: iamGithubUser.name,
  groups: [iamAutomationGroup.name],
})

// Domain Name
export const route53MainZone = new route53.Zone('main', {
  name: domainName,
  comment: 'Zone used by Toglion to host the application',
  tags: {
    ...tags,
    Name: 'Main Domain Name Zone',
    Description: 'Zone used by Toglion to host the application',
  },
})

//Vercel Settings
export const route53WwwCnameRecord = new route53.Record('www-cname-main', {
  allowOverwrite: true,
  name: 'www',
  records: ['cname.vercel-dns.com'],
  ttl: 300,
  type: 'CNAME',
  zoneId: route53MainZone.id,
})

export const route53BareRecord = new route53.Record('bare-main', {
  allowOverwrite: true,
  name: '',
  records: ['76.76.21.21'],
  ttl: 300,
  type: 'A',
  zoneId: route53MainZone.id,
})

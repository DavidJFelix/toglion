import {iam} from '@pulumi/aws'

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
})

export const iamGithubKey = new iam.AccessKey('github', {
  user: iamGithubUser.name,
  pgpKey: 'keybase:davidjfelix',
})

const iamGithubGroupMembership = new iam.UserGroupMembership('github', {
  user: iamGithubUser.name,
  groups: [iamAutomationGroup.name],
})

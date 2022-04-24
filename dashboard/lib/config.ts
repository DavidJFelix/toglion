export const config = {
  aws: {
    accessKeyId:
      process.env.TG_AWS_ACCESS_KEY_ID! || process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey:
      process.env.TG_AWS_SECRET_ACCESS_KEY! ||
      process.env.AWS_SECRET_ACCESS_KEY!,
    endpoint: '',
  },
  hostname: process.env.HOSTNAME!,
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
  },
  dynamodb: {
    accounts: process.env.DYNAMODB_ACCOUNTS_TABLE!,
    users: process.env.DYNAMODB_USERS_TABLE!,
    sessions: process.env.DYNAMODB_SESSIONS_TABLE!,
    flags: process.env.DYNAMODB_FLAGS_TABLE!,
    emailVerificationTokens:
      process.env.DYNAMODB_EMAIL_VERIFICATION_TOKENS_TABLE!,
    organizations: process.env.DYNAMODB_ORGANIZATIONS_TABLE!,
  },
}

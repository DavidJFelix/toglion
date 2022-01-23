export const config = {
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
    accounts: 'auth-accounts-4ca9dc8',
    users: 'users-1a8d390',
    sessions: 'sessions-1113ebd',
    emailVerificationTokens: 'email-verification-tokens-51d6229',
  },
}

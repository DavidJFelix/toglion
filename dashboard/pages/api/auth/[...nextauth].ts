import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

import {config} from 'lib/config'
import {adapter} from 'lib/next-auth/dynamodb-adapter'

export default NextAuth({
  debug: true,
  adapter,
  pages: {
    signIn: '/auth/sign-in',
  },
  providers: [
    GitHubProvider({
      clientId: config.github.clientId,
      clientSecret: config.github.clientSecret,
    }),
    GoogleProvider({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    }),
  ],
  secret: config.auth.secret,
  session: {
    strategy: 'database',
  },
})

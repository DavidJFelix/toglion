import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import NextAuth, {Account} from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import {Adapter, AdapterSession, AdapterUser} from 'next-auth/adapters'
import {ulid} from 'ulid'

import {config} from 'lib/config'

const tableConfig = {
  accounts: 'auth-accounts-4ca9dc8',
  users: 'users-1a8d390',
}

const ddbClient = new DynamoDB({})
const docDbClient = DynamoDBDocument.from(ddbClient)

interface UserRecord extends Record<string, unknown> {
  id: string
  emailVerified: string | undefined | null
}

const adapter: Adapter = {
  async createUser(user) {
    const newUser: AdapterUser = {
      id: ulid(),
      emailVerified: null,
      ...user,
    }
    console.log(`createUser: ${JSON.stringify(user)}`)
    return newUser
  },
  async getUser(id: string) {
    console.log(`getUser: ${id}`)
    throw new Error('Function not implemented.')
  },
  async getUserByEmail(email: string) {
    console.log(`getUserByEmail: ${JSON.stringify(email)}`)
    const userResponse = await docDbClient.query({
      TableName: tableConfig.users,
      ExpressionAttributeNames: {
        '#e': 'email',
      },
      ExpressionAttributeValues: {
        ':e': email,
      },
      IndexName: 'email',
      KeyConditionExpression: '#e = :e',
    })

    if (!userResponse.Items?.length) {
      return null
    }

    const {id, emailVerified, ...rest} = userResponse.Items[0] as UserRecord
    return {
      id,
      emailVerified: emailVerified ? Date.parse(emailVerified) : null,
      ...rest,
    } as AdapterUser
  },
  async getUserByAccount({
    provider,
    providerAccountId,
  }: Pick<Account, 'provider' | 'providerAccountId'>) {
    console.log(`getUserByAccount: ${JSON.stringify(providerAccountId)}`)
    const accountResponse = await docDbClient.get({
      TableName: tableConfig.accounts,
      Key: {
        id: `${provider}/${providerAccountId}`,
      },
    })
    if (!accountResponse.Item) {
      return null
    }

    const userResponse = await docDbClient.get({
      TableName: tableConfig.users,
      Key: {
        id: accountResponse.Item.userId,
      },
    })

    if (!userResponse.Item) {
      // FIXME: maybe throw here?
      return null
    }

    const {id, emailVerified, ...rest} = userResponse.Item as UserRecord
    return {
      id,
      emailVerified: emailVerified ? Date.parse(emailVerified) : null,
      ...rest,
    } as AdapterUser
  },
  async updateUser(user: Partial<AdapterUser>) {
    throw new Error('Function not implemented.')
  },
  async linkAccount(account: Account) {
    console.log(`linkAccount: ${JSON.stringify(account)}`)
    throw new Error('Function not implemented.')
  },
  async createSession(session: {
    sessionToken: string
    userId: string
    expires: Date
  }) {
    console.log(`createSession: ${JSON.stringify(session)}`)
    throw new Error('Function not implemented.')
  },
  async getSessionAndUser(sessionToken: string) {
    throw new Error('Function not implemented.')
  },
  async updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
  ) {
    throw new Error('Function not implemented.')
  },
  async deleteSession(sessionToken: string) {
    throw new Error('Function not implemented.')
  },
}

export default NextAuth({
  adapter,
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

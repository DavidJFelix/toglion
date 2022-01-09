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
  sessions: 'sessions-1113ebd',
}

const ddbClient = new DynamoDB({})
const docDbClient = DynamoDBDocument.from(ddbClient)

interface UserRecord extends Record<string, unknown> {
  id: string
  emailVerified: string | undefined | null
}

const adapter: Adapter = {
  async createUser(user) {
    console.log(`createUser: ${JSON.stringify(user)}`)
    const now = new Date()
    const newUser: AdapterUser = {
      id: ulid(),
      emailVerified: null,
      ...user,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
    await docDbClient.transactWrite({
      TransactItems: [
        {
          Put: {
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: newUser,
            TableName: tableConfig.users,
          },
        },
        {
          Put: {
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id: `unique/email/${user.email}`,
              userId: newUser.id,
            },
            TableName: tableConfig.users,
          },
        },
      ],
    })
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
    await docDbClient.transactWrite({
      TransactItems: [
        {
          Put: {
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id: `${account.provider}/${account.providerAccountId}`,
              ...account,
            },
            TableName: tableConfig.accounts,
          },
        },
        {
          Put: {
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id: `unique/providerUser/provider/${account.provider}:user/${account.userId}`,
            },
            TableName: tableConfig.accounts,
          },
        },
      ],
    })
    return account
  },
  async createSession(session: {
    sessionToken: string
    userId: string
    expires: Date
  }) {
    console.log(`createSession: ${JSON.stringify(session)}`)
    const ttl =
      Math.round(session.expires.getTime() / 1000) +
      session.expires.getTimezoneOffset() * 60
    await docDbClient.put({
      ConditionExpression: 'attribute_not_exists(#i)',
      ExpressionAttributeNames: {
        '#i': 'id',
      },
      Item: {
        id: session.sessionToken,
        userId: session.userId,
        expiresAt: session.expires.toISOString(),
        ttl,
      },
      TableName: tableConfig.sessions,
    })
    return {
      id: session.sessionToken,
      ...session,
    }
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

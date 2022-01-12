import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import NextAuth, {Account} from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from 'next-auth/adapters'
import {ulid} from 'ulid'

import {config} from 'lib/config'

const tableConfig = {
  accounts: 'auth-accounts-4ca9dc8',
  users: 'users-1a8d390',
  sessions: 'sessions-1113ebd',
  emailVerificationTokens: 'email-verification-tokens-51d6229',
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
    const userResponse = await docDbClient.get({
      Key: {
        id,
      },
      TableName: tableConfig.users,
    })

    if (!userResponse.Item || userResponse.Item.isDeleted) {
      return null
    }

    const {emailVerified, ...rest} = userResponse.Item as UserRecord

    return {
      emailVerified: emailVerified ? new Date(emailVerified) : null,
      ...rest,
      id,
    } as AdapterUser
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
      emailVerified: emailVerified ? new Date(emailVerified) : null,
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
    if (!accountResponse.Item || accountResponse.Item.isDeleted) {
      return null
    }

    const userResponse = await docDbClient.get({
      TableName: tableConfig.users,
      Key: {
        id: accountResponse.Item.userId,
      },
    })

    if (!userResponse.Item || userResponse.Item.isDeleted) {
      // FIXME: maybe throw here?
      return null
    }

    const {id, emailVerified, ...rest} = userResponse.Item as UserRecord
    return {
      id,
      emailVerified: emailVerified ? new Date(emailVerified) : null,
      ...rest,
    } as AdapterUser
  },
  async updateUser(user: Partial<AdapterUser>) {
    console.log(`updateUser: ${JSON.stringify(user)}`)
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
    console.log(`getSessionAndUser: ${sessionToken}`)

    const sessionResponse = await docDbClient.get({
      Key: {
        id: sessionToken,
      },
      TableName: tableConfig.sessions,
    })
    const now = new Date()
    const ttlNow =
      Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60

    if (
      !sessionResponse.Item ||
      sessionResponse.Item.isDeleted ||
      sessionResponse.Item.ttl <= ttlNow
    ) {
      return null
    }

    const userResponse = await docDbClient.get({
      Key: {
        id: sessionResponse.Item?.userId,
      },
      TableName: tableConfig.users,
    })

    if (!userResponse.Item || userResponse.Item.isDeleted) {
      return null
    }

    const {expiresAt, ttl: _ttl, ...session} = sessionResponse.Item
    const {emailVerified, ...rest} = userResponse.Item as UserRecord

    return {
      session: {
        ...session,
        expires: new Date(expiresAt),
      } as AdapterSession,
      user: {
        emailVerified: emailVerified ? new Date(emailVerified) : null,
        ...rest,
      } as AdapterUser,
    }
  },
  async updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
  ) {
    console.log(`updateSession: ${JSON.stringify(session)}`)
    if (!session.expires) {
      // We only support updating the TTL
      return null
    }

    const ttl =
      Math.round(session.expires.getTime() / 1000) +
      session.expires.getTimezoneOffset() * 60
    await docDbClient.update({
      Key: {
        id: session.sessionToken,
      },
      ConditionExpression: 'attribute_exists(#i)',
      ExpressionAttributeNames: {
        '#e': 'expiresAt',
        '#i': 'id',
        '#t': 'ttl',
      },
      ExpressionAttributeValues: {
        ':e': session.expires.toISOString(),
        ':t': ttl,
      },
      ReturnValues: 'ALL_NEW',
      TableName: tableConfig.sessions,
      UpdateExpression: 'SET #e = :e, #t, :t',
    })

    return {
      id: session.sessionToken,
      ...session,
    } as AdapterSession
  },
  async deleteSession(sessionToken: string) {
    console.log(`deleteSession: ${sessionToken}`)
    const sessionResponse = await docDbClient.delete({
      ConditionExpression: 'attribute_exists(#i)',
      ExpressionAttributeNames: {
        '#i': 'id',
      },
      Key: {
        id: sessionToken,
      },
      ReturnValues: 'ALL_OLD',
      TableName: tableConfig.sessions,
    })

    if (!sessionResponse.Attributes) {
      return null
    }

    return {
      id: sessionToken,
      sessionToken,
      expires: new Date(sessionResponse.Attributes.expiresAt),
      userId: sessionResponse.Attributes.userId,
    } as AdapterSession
  },
  async createVerificationToken(verificationToken: VerificationToken) {
    console.log(`createVerificationToken: ${JSON.stringify(verificationToken)}`)
    const ttl =
      Math.round(verificationToken.expires.getTime() / 1000) +
      verificationToken.expires.getTimezoneOffset() * 60
    await docDbClient.put({
      ExpressionAttributeNames: {
        '#i': 'id',
        '#t': 'ttl',
      },
      ConditionExpression: 'attribute_not_exists(#i)',
      Item: {
        id: verificationToken.identifier,
        expiresAt: verificationToken.expires.toISOString(),
        token: verificationToken.token,
        ttl,
      },
      TableName: tableConfig.emailVerificationTokens,
    })

    return verificationToken
  },
  async useVerificationToken({
    identifier,
    token,
  }: Pick<VerificationToken, 'identifier' | 'token'>) {
    console.log(`useVerificationToken: ${JSON.stringify({identifier, token})}`)
    const now = new Date()
    const ttlNow =
      Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60

    const verificationTokenResponse = await docDbClient.delete({
      ConditionExpression: 'attribute_exists(#i) AND #ttl > :ttl AND #t = :t',
      ExpressionAttributeNames: {
        '#i': 'id',
        '#t': 'token',
        '#ttl': 'ttl',
      },
      ExpressionAttributeValues: {
        ':t': token,
        ':ttl': ttlNow,
      },
      Key: {
        id: identifier,
      },
      ReturnValues: 'ALL_OLD',
      TableName: tableConfig.emailVerificationTokens,
    })

    if (!verificationTokenResponse.Attributes) {
      return null
    }

    return {
      identifier,
      token,
      expires: new Date(verificationTokenResponse.Attributes.expiresAt),
    }
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

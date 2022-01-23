import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {Account} from 'next-auth'

import {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from 'next-auth/adapters'
import {ulid} from 'ulid'

import {config} from 'lib/config'

const ddbClient = new DynamoDB({
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
})
const docDbClient = DynamoDBDocument.from(ddbClient)

interface UserRecord extends Record<string, unknown> {
  id: string
  emailVerified?: string
}

export async function createUser(
  user: Omit<AdapterUser, 'id'>,
): Promise<AdapterUser> {
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
          TableName: config.dynamodb.users,
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
          TableName: config.dynamodb.users,
        },
      },
    ],
  })
  return newUser
}

export async function getUser(id: string) {
  console.log(`getUser: ${id}`)
  const userResponse = await docDbClient.get({
    Key: {
      id,
    },
    TableName: config.dynamodb.users,
  })

  if (!userResponse.Item || userResponse.Item.isDeleted) {
    console.log(`getUser Failed: ${id}`)
    return null
  }

  const {emailVerified, ...rest} = userResponse.Item as UserRecord

  return {
    emailVerified: emailVerified ? new Date(emailVerified) : null,
    ...rest,
    id,
  } as AdapterUser
}

export async function getUserByEmail(email: string) {
  console.log(`getUserByEmail: ${JSON.stringify(email)}`)
  const userResponse = await docDbClient.query({
    TableName: config.dynamodb.users,
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
    console.log(`getUserByEmail Failed: ${JSON.stringify(email)}`)
    return null
  }

  const {id, emailVerified, ...rest} = userResponse.Items[0] as UserRecord
  return {
    id,
    emailVerified: emailVerified ? new Date(emailVerified) : null,
    ...rest,
  } as AdapterUser
}

export async function getUserByAccount({
  provider,
  providerAccountId,
}: Pick<Account, 'provider' | 'providerAccountId'>) {
  console.log(
    `getUserByAccount: ${JSON.stringify({provider, providerAccountId})}`,
  )
  const accountResponse = await docDbClient.get({
    TableName: config.dynamodb.accounts,
    Key: {
      id: `${provider}/${providerAccountId}`,
    },
  })
  if (!accountResponse.Item || accountResponse.Item.isDeleted) {
    console.log(
      `getUserByAccount Failed, no account found: ${JSON.stringify({
        provider,
        providerAccountId,
      })}`,
    )
    return null
  }

  const userResponse = await docDbClient.get({
    TableName: config.dynamodb.users,
    Key: {
      id: accountResponse.Item.userId,
    },
  })

  if (!userResponse.Item || userResponse.Item.isDeleted) {
    console.log(
      `getUserByAccount Failed, no user found: ${JSON.stringify({
        provider,
        providerAccountId,
      })}`,
    )
    // FIXME: maybe throw here?
    return null
  }

  const {id, emailVerified, ...rest} = userResponse.Item as UserRecord
  return {
    id,
    emailVerified: emailVerified ? new Date(emailVerified) : null,
    ...rest,
  } as AdapterUser
}

export async function updateUser(user: Partial<AdapterUser>) {
  console.log(`updateUser: ${JSON.stringify(user)}`)
  if (!user.id && Object.entries(user).length < 2) {
    throw Error('User Not Found')
  }

  const updateResponse = await docDbClient.update({
    ConditionExpression: 'attribute_exists(#i)',
    ExpressionAttributeNames: {
      '#i': 'id',
      ...(user.email ? {'#e': 'email'} : {}),
      ...(user.image ? {'#im': 'image'} : {}),
      ...(user.name ? {'#n': 'name'} : {}),
    },
    ExpressionAttributeValues: {
      ...(user.email ? {'#e': 'email'} : {}),
      ...(user.image ? {'#im': 'image'} : {}),
      ...(user.name ? {'#n': 'name'} : {}),
    },
    Key: {
      id: user.id,
    },
    ReturnValues: 'ALL_NEW',
    TableName: config.dynamodb.users,
    UpdateExpression: `SET ${[
      ...(user.email ? ['#e = :e'] : []),
      ...(user.image ? ['#im = :im'] : []),
      ...(user.name ? ['#n = :n'] : []),
    ].join(', ')}`,
  })
  return updateResponse.Attributes as AdapterUser
}

export async function linkAccount(account: Account) {
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
          TableName: config.dynamodb.accounts,
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
          TableName: config.dynamodb.accounts,
        },
      },
    ],
  })
  return account
}

export async function createSession(session: {
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
    TableName: config.dynamodb.sessions,
  })
  return {
    id: session.sessionToken,
    ...session,
  }
}

export async function getSessionAndUser(sessionToken: string) {
  console.log(`getSessionAndUser: ${sessionToken}`)

  const sessionResponse = await docDbClient.get({
    Key: {
      id: sessionToken,
    },
    TableName: config.dynamodb.sessions,
  })
  const now = new Date()
  const ttlNow = Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60

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
    TableName: config.dynamodb.users,
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
}

export async function updateSession(
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
    TableName: config.dynamodb.sessions,
    UpdateExpression: 'SET #e = :e, #t, :t',
  })

  return {
    id: session.sessionToken,
    ...session,
  } as AdapterSession
}

export async function deleteSession(sessionToken: string) {
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
    TableName: config.dynamodb.sessions,
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
}

export async function createVerificationToken(
  verificationToken: VerificationToken,
) {
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
    TableName: config.dynamodb.emailVerificationTokens,
  })

  return verificationToken
}

export async function useVerificationToken({
  identifier,
  token,
}: Pick<VerificationToken, 'identifier' | 'token'>) {
  console.log(`useVerificationToken: ${JSON.stringify({identifier, token})}`)
  const now = new Date()
  const ttlNow = Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60

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
    TableName: config.dynamodb.emailVerificationTokens,
  })

  return {
    identifier,
    token,
    expires: new Date(),
  }
}

export const adapter: Adapter = {
  createUser,
  getUser,
  getUserByEmail,
  getUserByAccount,
  getSessionAndUser,
  linkAccount,
  updateUser,
  createSession,
  deleteSession,
  updateSession,
  createVerificationToken,
  useVerificationToken,
}

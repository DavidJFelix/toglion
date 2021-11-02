import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {getConfig} from '@lib/config'
import {githubUser, googleUser, user} from '@lib/db/types'
import {transactWrite} from '@lib/dynamodb/transactWrite'
import {nanoid} from 'nanoid'

export interface CreateUserFromGithubUserParams {
  githubUserId: string
  email: string
}
export async function createUserFromGithubUser({
  githubUserId,
  email,
}: CreateUserFromGithubUserParams) {
  const {globalDynamoDBTableName} = getConfig()

  const client = new DynamoDB({})
  const userId = nanoid()

  await transactWrite({
    client,
    inserts: [
      {
        key: {type: user, id: userId},
        tableName: globalDynamoDBTableName,
        value: {
          email,
          githubUserId,
        },
      },
      {
        key: {type: githubUser, id: githubUserId},
        sortKey: {type: user, id: userId},
        tableName: globalDynamoDBTableName,
        value: {},
      },
    ],
  })
}

export interface CreateUserFromGoogleUserParams {
  googleUserId: string
  email: string
}
export async function createUserFromGoogleUser({
  googleUserId,
  email,
}: CreateUserFromGoogleUserParams) {
  const {globalDynamoDBTableName} = getConfig()

  const client = new DynamoDB({})
  const userId = nanoid()

  await transactWrite({
    client,
    inserts: [
      {
        key: {type: user, id: userId},
        tableName: globalDynamoDBTableName,
        value: {
          email,
          googleUserId,
        },
      },
      {
        key: {type: googleUser, id: googleUserId},
        sortKey: {type: user, id: userId},
        tableName: globalDynamoDBTableName,
        value: {},
      },
    ],
  })
}

import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {NextApiRequest, NextApiResponse} from 'next'

// TODO: extract and use a common type
export interface Organization {
  id: string
  name: string
  ownerUserId: string
}

// TODO: extract this and use a common error
export interface MyPoorlyNamedError {}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({})
  }
  const session = await getSessionFromCookie(req)

  const {organizationId} = req.query
  // Extract

  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const result = await docDbClient.get({
    TableName: config.dynamodb.organizations,
    Key: {
      id: organizationId,
    },
  })

  const organization = result.Item

  if (!organization) {
    return res.status(404).json({})
  }
  // Extract

  // TODO: don't let non member, non owners read. 404.

  // TODO: actually serialize
  return res.status(200).json(organization)
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

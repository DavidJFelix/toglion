import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {NextApiRequest, NextApiResponse} from 'next'
import {ulid} from 'ulid'

export interface Organization {
  id: string
  name: string
  ownerUserId: string
}

export interface MyPoorlyNamedError {}

// Post or Get (list)
export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Organization | MyPoorlyNamedError>,
) {
  if (req.method === 'POST') {
    // Create new
    const newOrg = await parseNewOrganization(req)

    // Extract
    const id = ulid()
    const ddbClient = new DynamoDB({
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    })
    const docDbClient = DynamoDBDocument.from(ddbClient)
    await docDbClient.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: config.dynamodb.organizations,
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id,
              ...newOrg,
            },
          },
        },
        {
          Put: {
            TableName: config.dynamodb.organizations,
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id: `unique/name/${newOrg.name}`,
            },
          },
        },
      ],
    })

    // Extract

    return res.status(201).json({id, ...newOrg})
  } else if (req.method === 'GET') {
    // list
    const session = await getSessionFromCookie(req)

    // Extract

    const ddbClient = new DynamoDB({
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    })
    const docDbClient = DynamoDBDocument.from(ddbClient)
    const result = await docDbClient.query({
      TableName: config.dynamodb.organizations,
      IndexName: 'owner-user',
      KeyConditionExpression: '#o = :o',
      ExpressionAttributeNames: {'#o': 'ownerUserId'},
      ExpressionAttributeValues: {':o': session.user.id},
    })

    const organizations = result.Items
    // Extract

    return res.status(200).json({organizations})
  } else {
    return res.status(405).json({
      error: {description: 'Method Not Allowed -- PLACEHOLDER'},
    })
  }
}

async function parseNewOrganization(
  req: NextApiRequest,
): Promise<Omit<Organization, 'id'>> {
  const session = await getSessionFromCookie(req)
  console.log(session)
  const maybeNewOrg = JSON.parse(req.body)
  // FIXME: do org name validations? no symbols? length?
  if (!maybeNewOrg?.name) {
    // FIXME
    throw 'FAILURE'
  }
  return {name: `${maybeNewOrg.name}`, ownerUserId: session.user.id}
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

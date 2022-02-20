import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {NextApiRequest, NextApiResponse} from 'next'
import {createOrganization, listOrganizations} from 'services/organizations'
import {Organization} from 'types'

// TODO: extract this and use a common error
export interface MyPoorlyNamedError {}

// Post or Get (list)
export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Organization | MyPoorlyNamedError>,
) {
  if (req.method === 'POST') {
    const newOrg = await parseNewOrganization(req)
    const createdOrg = await createOrganization(newOrg)
    return res.status(201).json(createdOrg)
  } else if (req.method === 'GET') {
    const session = await getSessionFromCookie(req)
    const organizations = await listOrganizations({
      requestingUserId: session.user.id,
    })
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

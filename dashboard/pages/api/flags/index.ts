import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {NextApiRequest, NextApiResponse} from 'next'
import {createFlag} from 'services/flags'
import {Flag} from 'types'

// TODO: extract this and use a common error
export interface MyPoorlyNamedError {}

export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Flag | MyPoorlyNamedError>,
) {
  if (req.method === 'POST') {
    const session = await getSessionFromCookie(req)
    const newFlag = await parseNewFlag(req)
    const createdFlag = await createFlag({
      newFlag,
      requestingUserId: session.user.id,
    })
    return res.status(201).json(createdFlag)
  } else {
    return res.status(405).json({
      error: {description: 'Method Not Allowed -- PLACEHOLDER'},
    })
  }
}

async function parseNewFlag(req: NextApiRequest): Promise<Omit<Flag, 'id'>> {
  const maybeNewFlag = JSON.parse(req.body)
  // FIXME: do org name validations? no symbols? length?
  if (
    !maybeNewFlag?.name ||
    !maybeNewFlag?.organizationId ||
    !maybeNewFlag?.value
  ) {
    // FIXME
    throw 'FAILURE'
  }
  return {
    name: `${maybeNewFlag.name}`,
    organizationId: `${maybeNewFlag.organizationId}`,
    value: maybeNewFlag.value,
  }
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

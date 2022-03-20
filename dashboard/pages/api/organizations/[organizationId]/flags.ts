import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {flagService} from 'server'
import {NextApiRequest, NextApiResponse} from 'next'
import {Flag} from 'types'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'

// TODO: extract this and use a common error
export interface MyPoorlyNamedError {}

// TODO: extract
export interface FlagListResponse {
  flags: Flag[]
}

export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Flag | FlagListResponse | MyPoorlyNamedError>,
) {
  if (req.method === 'GET') {
    const session = await getSessionFromCookie(req)
    const flags = await flagService.list({
      context: {
        organizationId: req.query.organizationId as string,
        requestingUserId: session.user.id,
      },
    })
    // FIXME: handle failure on listFlags
    return res.status(200).json({flags})
  } else {
    return res.status(405).json({
      error: {description: 'Method Not Allowed -- PLACEHOLDER'},
    })
  }
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

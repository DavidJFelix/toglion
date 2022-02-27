import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {getQueryFirst} from 'lib/next/utils'
import {NextApiRequest, NextApiResponse} from 'next'
import {getFlag} from 'services/flags'

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getSessionFromCookie(req)

    const flagId = getQueryFirst(req.query, 'flagId')! // TODO: handle odd case this doesn't exist
    try {
      const organization = await getFlag({
        flagId,
        requestingUserId: session.user.id,
      })
      return res.status(200).json(organization)
    } catch {
      return res.status(404).json({})
    }
  } else {
    // FIXME: standardize
    return res.status(405).json({})
  }
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

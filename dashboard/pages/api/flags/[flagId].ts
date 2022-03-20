import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {loginRequiredMiddleware} from 'lib/next-auth/middleware'
import {getQueryFirst} from 'lib/next/utils'
import {NextApiRequest, NextApiResponse} from 'next'
import {flagService} from 'server'
import {Flag, UpdatedFlag} from 'types'

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionFromCookie(req)

  const flagId = getQueryFirst(req.query, 'flagId')! // TODO: handle odd case this doesn't exist
  if (req.method === 'GET') {
    try {
      const flag = await flagService.get({
        id: flagId,
        context: {requestingUserId: session.user.id},
      })
      return res.status(200).json(flag)
    } catch {
      return res.status(404).json({})
    }
  } else if (req.method === 'PUT') {
    try {
      const flag = await flagService.update({
        // FIXME: actually parse this correctly
        updated: JSON.parse(req.body) as UpdatedFlag,
        context: {requestingUserId: session.user.id},
      })
      return res.status(200).json(flag)
    } catch (err) {
      console.log(err)
      // TODO: actually break out status
      return res.status(400).json({})
    }
  } else {
    // FIXME: standardize
    return res.status(405).json({})
  }
}

const wrappedHandler = loginRequiredMiddleware(handler)
export default wrappedHandler

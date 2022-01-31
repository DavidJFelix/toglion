import {NextApiHandler} from 'next'
import {getSession} from 'next-auth/react'

// FIXME: rename this to something less sucky
export interface LoginError {
  error: {
    description: string
  }
}

export function loginRequiredMiddleware<TResponse = unknown>(
  next: NextApiHandler<TResponse>,
): NextApiHandler<TResponse | LoginError> {
  return async (req, res) => {
    const session = await getSession({req})

    if (session) {
      return next(req, res)
    } else {
      return res
        .status(401)
        .json({error: {description: 'Login Please Placeholder'}})
    }
  }
}

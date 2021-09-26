import {NextApiRequest, NextApiResponse} from 'next'
import {OAuthApp} from '@octokit/oauth-app'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import {config} from '@lib/config'

export default async function CallbackHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const app = new OAuthApp({
    clientType: 'oauth-app',
    clientId: config.github.clientId,
    clientSecret: config.github.clientSecret,
  })
  const {authentication} = await app.createToken({
    state: req.query.state as string,
    code: req.query.code as string,
  })
  const {token} = authentication
  const userPromise = axios.get('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
    },
  })
  const emailsPromise = await axios.get('https://api.github.com/user/emails', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
    },
  })
  const [user, emails] = await Promise.all([userPromise, emailsPromise])
  const cookie = jwt.sign(
    {
      githubUserId: user.data.id,
      emails: emails.data,
      token,
    },
    config.auth.secret,
  )

  const redirectUrl =
    req.cookies['toglion.auth.callbackRedirectUrl'] !== undefined
      ? req.cookies['toglion.auth.callbackRedirectUrl']
      : '/'

  res.setHeader('Set-Cookie', [
    `toglion.auth.session=${Buffer.from(cookie, 'utf-8').toString(
      'base64',
    )}; Path=/; Secure; Http-Only; Same-Site=Strict;`,
    `toglion.auth.callbackRedirectUrl="/"; Path=/; Secure; Http-Only; Same-Site=Strict; Expires=${new Date().toUTCString()}`,
  ])
  res.redirect(redirectUrl)
  return res.end()
}

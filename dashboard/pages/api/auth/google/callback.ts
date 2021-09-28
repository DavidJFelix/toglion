import {NextApiRequest, NextApiResponse} from 'next'
import {google} from 'googleapis'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import {config} from '@lib/config'

export default async function CallbackHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    `${config.hostname}/api/auth/google/callback`,
  )

  const {tokens} = await oauth2Client.getToken(req.query.code as string)
  oauth2Client.setCredentials(tokens)

  const googleAuth = google.oauth2({
    version: 'v2',
    auth: oauth2Client,
  })

  const googleUserInfo = await googleAuth.userinfo.get()
  const {id, email} = googleUserInfo.data

  const cookie = jwt.sign(
    {
      googleUserId: id,
      email,
      tokens,
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

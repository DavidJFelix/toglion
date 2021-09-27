import {NextApiRequest, NextApiResponse} from 'next'
import {google} from 'googleapis'

import {config} from '@lib/config'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    `${config.hostname}/api/auth/google/callback`,
  )

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes,
  })

  res.writeHead(302, {location: url})
  return res.end()
}

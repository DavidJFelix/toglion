import {OAuthApp} from '@octokit/oauth-app'
import {NextApiRequest, NextApiResponse} from 'next'
import {config} from '@lib/config'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const app = new OAuthApp({
    clientType: 'oauth-app',
    clientId: config.github.clientId,
    clientSecret: config.github.clientSecret,
  })
  const {url} = await app.getWebFlowAuthorizationUrl({
    state: req.query.state as string,
    scopes:
      typeof req.query.scopes === 'string'
        ? req.query.scopes.split(',')
        : ['user:email'],
    allowSignup: req.query.allowSignup === 'true' ? true : false,
    redirectUrl: (req.query.redirectUrl as string | undefined) || '/',
  })

  res.writeHead(302, {location: url})
  return res.end()
}

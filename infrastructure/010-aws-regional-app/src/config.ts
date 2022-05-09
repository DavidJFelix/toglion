import * as pulumi from '@pulumi/pulumi'

// Manage configuration
export interface Config {
  globalBaseStackName: string
  isLocal?: boolean
  regionalBaseStackName?: string
  tags: Record<string, string>
}

export const config = new pulumi.Config().requireObject<Config>('data')

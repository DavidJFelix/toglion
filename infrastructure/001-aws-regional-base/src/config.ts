import * as pulumi from '@pulumi/pulumi'

// Manage configuration
interface ConfigData {
  globalBaseStackName: string
  tags: Record<string, string>
}

export const config = new pulumi.Config().requireObject<ConfigData>('data')

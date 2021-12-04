import {dynamodb, Provider, Region} from '@pulumi/aws'
import {input} from '@pulumi/aws/types'
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
} from '@pulumi/pulumi'

export interface DynamoDBTableInputs extends dynamodb.TableArgs {
  isGlobal?: boolean
  regionsConfigs: Partial<Record<Region, Input<input.dynamodb.TableReplica>>>
}
export class DynamoDBTable extends ComponentResource {
  readonly tables: Partial<Record<Region, dynamodb.Table>> = {}
  readonly globalTable?: dynamodb.GlobalTable

  constructor(
    name: string,
    args: DynamoDBTableInputs,
    opts?: ComponentResourceOptions,
  ) {
    super('toglion:components:AwsDomain', name, args, opts)
    const {isGlobal = false, regions, ...tableArgs} = args
    const {billingMode, pointInTimeRecovery} = tableArgs

    regions.forEach((region) => {
      const provider = new Provider(`provider-${region}`, {region})
      this.tables[region] = new dynamodb.Table(
        ``,
        {
          ...tableArgs,
          billingMode: billingMode ?? 'PAY_PER_REQUEST',
          pointInTimeRecovery: pointInTimeRecovery ?? {enabled: true},
          replicas,
        },
        {provider},
      )
    })
  }
}

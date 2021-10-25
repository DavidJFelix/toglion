import {generateUpdate, GenerateUpdateParams} from './update'
import {generateInsert, GenerateInsertParams} from './insert'
import {DynamoDBParams} from './types'
import {Put, TransactWriteItem, Update} from '@aws-sdk/client-dynamodb'
import {generatePut, GeneratePutParams} from './put'

export interface TransactWriteParams extends DynamoDBParams {
  hardDeletes?: []
  inserts?: GenerateInsertParams<object>[]
  puts?: GeneratePutParams<object>[]
  softDeletes?: []
  updates?: GenerateUpdateParams<object>[]
}
export async function transactWrite(params: TransactWriteParams) {
  const {client, inserts, puts, updates} = params
  const transactInserts: TransactWriteItem[] = (inserts ? inserts : [])
    .map(generateInsert)
    .map((insert) => ({Update: insert as Update}))
  const transactPuts: TransactWriteItem[] = (puts ? puts : [])
    .map(generatePut)
    .map((put) => ({Put: put as Put}))
  const transactUpdates: TransactWriteItem[] = (updates ? updates : [])
    .map(generateUpdate)
    .map((update) => ({Update: update as Update}))

  await client.transactWriteItems({
    TransactItems: [...transactInserts, ...transactPuts, ...transactUpdates],
    ClientRequestToken: '',
  })
}

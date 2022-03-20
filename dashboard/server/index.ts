import {DynamoDBClient} from 'lib/dynamodb'
import {FlagService} from 'services/flags'

export const dynamoDBClient = new DynamoDBClient({})
export const flagService = new FlagService({dynamoDBClient})

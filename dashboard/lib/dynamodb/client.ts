import {DynamoDB, DynamoDBClientConfig} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from '../config'

export interface IDynamoDBClient {
  dynamoDBClient: DynamoDB
  dynamoDBDocumentClient: DynamoDBDocument
}
export class DynamoDBClient {
  readonly dynamoDBClient: DynamoDB
  readonly dynamoDBDocumentClient: DynamoDBDocument
  constructor({
    dynamoDBClient,
    dynamoDBDocumentClient,
    ...clientConfig
  }: Partial<IDynamoDBClient & DynamoDBClientConfig>) {
    if (dynamoDBClient !== undefined) {
      this.dynamoDBClient = dynamoDBClient
    } else {
      this.dynamoDBClient = new DynamoDB({
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
        ...clientConfig,
      })
    }

    if (dynamoDBDocumentClient !== undefined) {
      this.dynamoDBDocumentClient = dynamoDBDocumentClient
    } else {
      this.dynamoDBDocumentClient = DynamoDBDocument.from(this.dynamoDBClient)
    }
  }
}

export const defaultClient = new DynamoDBClient({})

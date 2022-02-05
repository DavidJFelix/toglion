import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {AppShell} from 'components/layout/AppShell'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {GetServerSidePropsContext} from 'next'
import {Organization} from 'types'

export interface OrganizationByNamePageProps {
  organization: Organization
}

export function OrganizationByNamePage({
  organization,
}: OrganizationByNamePageProps) {
  return <AppShell>{JSON.stringify(organization)}</AppShell>
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext) {
  const session = await getSessionFromCookie(req)

  // Extract

  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const result = await docDbClient.query({
    TableName: config.dynamodb.organizations,
    IndexName: 'name',
    KeyConditionExpression: '#n = :n',
    ExpressionAttributeNames: {'#n': 'name'},
    ExpressionAttributeValues: {':n': params!.organizationName},
  })

  const organization = result.Items?.[0]

  if (!organization) {
    return {notFound: true}
  }
  // Extract

  // TODO: don't let non member, non owners read. 404.

  // TODO: actually serialize
  return {props: {organization}}
}

export default OrganizationByNamePage

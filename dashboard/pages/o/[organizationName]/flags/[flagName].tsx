import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {AppShell} from 'components/layout/AppShell'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {Organization} from 'types'

export interface FlagByOrganizationNameAndFlagNamePageProps {
  organization: Organization
}

export function FlagByOrganizationNameAndFlagNamePage({
  organization,
}: FlagByOrganizationNameAndFlagNamePageProps) {
  return <AppShell organizationName={organization.name} />
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<FlagByOrganizationNameAndFlagNamePageProps>
> {
  const session = await getSessionFromCookie(req)

  // Extract
  // FIXME: get this into services asap
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

  const organization = result.Items?.[0] as Organization

  if (!organization) {
    return {notFound: true}
  }
  // Extract

  // TODO: don't let non member, non owners read. 404.

  // TODO: actually serialize
  return {props: {organization}}
}

export default FlagByOrganizationNameAndFlagNamePage

import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {Box, Button, Input} from '@chakra-ui/react'
import {AppShell} from 'components/layout/AppShell'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {GetServerSidePropsContext} from 'next'
import {useState} from 'react'
import {useMutation} from 'react-query'
import {Flag, Organization} from 'types'

export interface OrganizationByNamePageProps {
  organization: Organization
  flags: Flag[]
}

export function OrganizationByNamePage({
  organization,
  flags,
}: OrganizationByNamePageProps) {
  const [flagName, setFlagName] = useState('New Flag')
  const {mutate: createFlag} = useMutation(
    async (newFlag: Omit<Flag, 'id'>) => {
      return fetch('/api/flags', {
        method: 'post',
        body: JSON.stringify(newFlag),
      })
    },
  )
  return (
    <AppShell>
      <Box>{JSON.stringify(organization)}</Box>
      <Box>{JSON.stringify(flags)}</Box>
      <Input
        value={flagName}
        onChange={({target: {value}}) => setFlagName(value)}
      />
      <Button
        colorScheme="orange"
        onClick={() =>
          createFlag({
            name: flagName,
            value: true,
            organizationId: organization.id,
          })
        }
      >
        Create Flag
      </Button>
    </AppShell>
  )
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext) {
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
  // Extract
  const flagResult = await docDbClient.query({
    TableName: config.dynamodb.flags,
    IndexName: 'organization',
    KeyConditionExpression: '#o = :o',
    ExpressionAttributeNames: {'#o': 'organizationId'},
    ExpressionAttributeValues: {':o': organization.id},
  })

  const flags = flagResult.Items! as Flag[]

  // Extract

  // TODO: don't let non member, non owners read. 404.

  // TODO: actually serialize
  return {props: {organization, flags}}
}

export default OrganizationByNamePage

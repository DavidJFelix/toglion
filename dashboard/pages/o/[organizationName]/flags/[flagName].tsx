import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {Flex, Heading, Button} from '@chakra-ui/react'
import {AppShell} from 'components/layout/AppShell'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {useRouter} from 'next/router'
import {getFlagByName} from 'services/flags'
import {getOrganizationByName} from 'services/organizations'
import {Flag, Organization} from 'types'

export interface FlagByOrganizationNameAndFlagNamePageProps {
  organization: Organization
  flag: Flag
}

export function FlagByOrganizationNameAndFlagNamePage({
  organization,
  flag,
}: FlagByOrganizationNameAndFlagNamePageProps) {
  return (
    <AppShell organizationName={organization.name}>
      <Flex justifyContent="space-between">
        <Heading as="h1" size="lg" color="gray.800">
          {flag.name}
        </Heading>
        <Button colorScheme="red">Delete</Button>
      </Flex>
    </AppShell>
  )
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<FlagByOrganizationNameAndFlagNamePageProps>
> {
  const session = await getSessionFromCookie(req)
  try {
    const organization = await getOrganizationByName({
      organizationName: params!.organizationName as string,
      requestingUserId: session.user.id,
    })
    const flag = await getFlagByName({
      flagName: params!.flagName as string,
      organizationId: organization.id,
      requestingUserId: session.user.id,
    })

    // TODO: actually serialize
    return {props: {organization, flag}}
  } catch {
    return {notFound: true}
  }
}

export default FlagByOrganizationNameAndFlagNamePage

import {Flex, Heading, Button, Box, Icon} from '@chakra-ui/react'
import {AppShell} from 'components/layout/AppShell'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {FiEdit3} from 'react-icons/fi'
import {flagService} from 'server'
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
          <Icon
            ml={4}
            as={FiEdit3}
            h={6}
            w={6}
            color="gray.500"
            display="inline-block"
            verticalAlign="middle"
          />
        </Heading>
        <Button colorScheme="red">Delete</Button>
      </Flex>
      <Box mt={8} bgColor="white" height="xl">
        {JSON.stringify(flag.value)}
      </Box>
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
    const flag = await flagService.getByName({
      name: params!.flagName as string,
      context: {
        organizationId: organization.id,
        requestingUserId: session.user.id,
      },
    })

    // TODO: actually serialize
    return {props: {organization, flag}}
  } catch {
    return {notFound: true}
  }
}

export default FlagByOrganizationNameAndFlagNamePage

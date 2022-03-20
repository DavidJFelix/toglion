import {Box, Button, Flex, Heading, useDisclosure} from '@chakra-ui/react'
import {CreateFlagDrawer} from 'components/drawers/CreateFlagDrawer'
import {FeatureFlagsList} from 'components/FeatureFlagsListV2'
import {AppShell} from 'components/layout/AppShell'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {useListFlags} from 'lib/react-query/api'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {getOrganizationByName} from 'services/organizations'
import {Organization} from 'types'

export interface FlagListByOrganizationNamePageProps {
  organization: Organization
}

export function FlagListByOrganizationNamePage({
  organization,
}: FlagListByOrganizationNamePageProps) {
  const {isLoading, data} = useListFlags(organization.id)
  const {isOpen, onClose, onOpen} = useDisclosure()

  return (
    <AppShell organizationName={organization.name}>
      <CreateFlagDrawer
        isOpen={isOpen}
        onClose={onClose}
        organization={organization}
      />
      <Flex justifyContent="space-between">
        <Heading as="h1" size="lg" color="gray.800">
          Flags
        </Heading>
        <Button colorScheme="orange" onClick={onOpen}>
          New flag
        </Button>
      </Flex>
      {!isLoading && data && (
        <Box mt={6}>
          <FeatureFlagsList
            flags={data.flags}
            organizationName={organization.name}
          />
        </Box>
      )}
    </AppShell>
  )
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<FlagListByOrganizationNamePageProps>
> {
  const session = await getSessionFromCookie(req)

  try {
    const organization = await getOrganizationByName({
      requestingUserId: session.user.id,
      organizationName: params!.organizationName as string, // FIXME this is hideous
    })

    // TODO: actually serialize
    return {props: {organization}}
  } catch {
    return {notFound: true}
  }
}

export default FlagListByOrganizationNamePage

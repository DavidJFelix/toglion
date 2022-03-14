import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {Box, Button, Flex, Heading, HStack} from '@chakra-ui/react'
// import {Box, Button, Input} from '@chakra-ui/react'
import {FeatureFlagsList} from 'components/FeatureFlagsListV2'
import {AppShell} from 'components/layout/AppShell'
import {config} from 'lib/config'
import {getSessionFromCookie} from 'lib/next-auth/dynamodb-adapter'
import {useCreateFlag, useListFlags, useUpdateFlag} from 'lib/react-query/api'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
// import {useState} from 'react'
import {getOrganizationByName} from 'services/organizations'
import {Flag, Organization} from 'types'

export interface FlagListByOrganizationNamePageProps {
  organization: Organization
}

export function FlagListByOrganizationNamePage({
  organization,
}: FlagListByOrganizationNamePageProps) {
  // const [flagName, setFlagName] = useState('New Flag')

  const {isLoading, data} = useListFlags(organization.id)
  // const {mutate: createFlag} = useCreateFlag()
  const {mutate: updateFlag} = useUpdateFlag()

  const onFlagToggle = (newFlag: Flag) => {
    // rq mutate - updateFlag(id, newValue)
    updateFlag(newFlag)
  }

  return (
    <AppShell organizationName={organization.name}>
      <Flex justifyContent="space-between">
        <Heading as="h1" size="lg" color="gray.800">
          Flags
        </Heading>
        <Button colorScheme="orange">New flag</Button>
      </Flex>
      {!isLoading && data && (
        <Box mt={6}>
          <FeatureFlagsList
            flags={data.flags}
            organizationName={organization.name}
          />
        </Box>
      )}
      {/* <Input
        value={flagName}
        onChange={({target: {value}}) => setFlagName(value)}
      />
      <Button
        colorScheme="orange"
        onClick={() =>
          createFlag({
            name: flagName,
            value: true,
            schema: JSON.stringify({type: 'boolean'}),
            organizationId: organization.id,
          })
        }
      >
        Create Flag
      </Button> */}
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

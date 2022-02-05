import {Input, Link as ChakraLink} from '@chakra-ui/react'
import {AppShell} from 'components/layout/AppShell'
import {useState} from 'react'
import {useMutation} from 'react-query'
import {Organization} from 'types'

export function CreateOrganizationPage() {
  const [orgName, setOrgName] = useState('NewOrg!')
  const {mutate: createOrganization} = useMutation(
    async ({name}: Omit<Organization, 'id' | 'ownerUserId'>) => {
      return fetch('/api/organizations', {
        method: 'post',
        body: JSON.stringify({name}),
      })
    },
  )

  return (
    <AppShell>
      <Input
        value={orgName}
        onChange={({target: {value}}) => setOrgName(value)}
      />
      <ChakraLink onClick={() => createOrganization({name: orgName})}>
        New Org
      </ChakraLink>
    </AppShell>
  )
}

export default CreateOrganizationPage

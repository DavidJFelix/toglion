import {Box} from '@chakra-ui/react'
import {rest} from 'msw'
import {AppShell} from './AppShell'
import {Organization} from '../../types'

function BlankAppShell() {
  return (
    <AppShell>
      <Box
        h="3xl"
        borderStyle="dashed"
        borderWidth={4}
        borderRadius="base"
        borderColor="gray.200"
      />
    </AppShell>
  )
}

export default {
  title: 'App Shell',
  component: BlankAppShell,
  parameters: {
    layout: 'fullscreen',
  },
}

export const Empty = () => <BlankAppShell />
Empty.story = {
  parameters: {
    nextRouter: {
      pathname: '/flags',
    },
  },
}

export const WithOrganizations = () => <BlankAppShell />
WithOrganizations.parameters = {
  msw: {
    handlers: [
      rest.get('/api/organizations/', (req, res, ctx) => {
        return res(
          ctx.json({
            organizations: [
              {id: 'org-1', name: 'Org, Inc.', ownerUserId: 'user-1'},
              {id: 'org-2', name: 'Org, LLC.', ownerUserId: 'user-1'},
              {id: 'org-3', name: 'Org, Co.', ownerUserId: 'user-2'},
              {id: 'org-4', name: 'Org, Ltd.', ownerUserId: 'user-2'},
              {id: 'org-5', name: 'Org, Corp.', ownerUserId: 'user-3'},
            ],
          }),
        )
      }),
    ],
  },
}
WithOrganizations.story = {
  parameters: {
    nextRouter: {
      pathname: '/flags',
    },
  },
}

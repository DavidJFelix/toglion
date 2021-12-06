import {Box} from '@chakra-ui/react'
import React from 'react'
import {AppShell} from './AppShell'

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

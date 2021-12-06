import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport'
import {ChakraProvider} from '@chakra-ui/react'
import {RouterContext} from 'next/dist/shared/lib/router-context'

const withChakra = (StoryFn, context) => {
  return (
    <ChakraProvider>
      <StoryFn />
    </ChakraProvider>
  )
}

export const decorators = [withChakra]

export const parameters = {
  actions: {argTypesRegex: '^on[A-Z].*'},
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
}

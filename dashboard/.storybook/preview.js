import {ChakraProvider} from '@chakra-ui/react'
import {StoryContext} from '@storybook/react'

const withChakra = (StoryFn: Function, context: StoryContext) => {
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
}

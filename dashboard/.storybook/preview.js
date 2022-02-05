import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport'
import {RouterContext} from 'next/dist/shared/lib/router-context'
import {QueryClient, QueryClientProvider} from 'react-query'
import {initialize, mswDecorator} from 'msw-storybook-addon'

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

initialize()

const queryClient = new QueryClient()

export const decorators = [
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  ),
  mswDecorator,
]

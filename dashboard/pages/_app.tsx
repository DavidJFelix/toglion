import {ChakraProvider} from '@chakra-ui/react'
import {SessionProvider} from 'next-auth/react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {ReactQueryDevtools} from 'react-query/devtools'
import {AppProps} from 'next/app'

const queryClient = new QueryClient()

export default function App({
  Component,
  pageProps: {session, ...pageProps},
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ChakraProvider>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

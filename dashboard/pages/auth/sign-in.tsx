import {Box, Button, Flex, Icon, Image, VStack} from '@chakra-ui/react'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {BuiltInProviderType} from 'next-auth/providers'
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from 'next-auth/react'
import {useRouter} from 'next/router'
import {FaGithub} from 'react-icons/fa'
import {FcGoogle} from 'react-icons/fc'

export interface SignInPageProps {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null
}
function SignInPage({providers}: SignInPageProps) {
  const {status} = useSession()
  const {query, push} = useRouter()

  if (status === 'authenticated') {
    const maybeCallbackUrl = query['callbackUrl']
    const callBackUrl =
      typeof maybeCallbackUrl === 'object'
        ? maybeCallbackUrl[0]
        : typeof maybeCallbackUrl === 'string'
        ? maybeCallbackUrl
        : '/'
    push(callBackUrl)
  }

  return (
    <Flex
      bgColor="gray.50"
      w="100vw"
      h="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        bgColor="white"
        minH={64}
        minW={64}
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderWidth={1}
      >
        <VStack>
          <Image
            boxSize={24}
            // FIXME: get rid of this external dep
            src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/lion_1f981.png"
          />
          {providers !== null && Object.keys(providers).includes('github') && (
            <Button
              _hover={{
                backgroundColor: 'black',
                color: 'gray.300',
              }}
              backgroundColor="gray.800"
              color="gray.50"
              variant="outline"
              leftIcon={<Icon as={FaGithub} />}
              onClick={() => signIn(providers.github.id)}
            >
              Sign in with Github
            </Button>
          )}
          {providers !== null && Object.keys(providers).includes('google') && (
            <Button
              backgroundColor="white"
              variant="outline"
              leftIcon={<Icon as={FcGoogle} />}
              onClick={() => signIn(providers.google.id)}
            >
              Sign in with Google
            </Button>
          )}
        </VStack>
      </Box>
    </Flex>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<SignInPageProps>> {
  const providers = await getProviders()
  return {
    props: {providers},
  }
}

export default SignInPage

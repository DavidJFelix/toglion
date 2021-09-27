import React from 'react'
import Link from 'next/link'
import {VStack} from '@chakra-ui/layout'
import {Button} from '@chakra-ui/button'

function TestAuth() {
  return (
    <VStack>
      <Link href="/api/auth/github/login" passHref>
        <Button colorScheme="green" as="a">
          Login with Github
        </Button>
      </Link>
      <Link href="/api/auth/google/login" passHref>
        <Button colorScheme="red" as="a">
          Login with Google
        </Button>
      </Link>
    </VStack>
  )
}

export default TestAuth

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import {HiMenu} from 'react-icons/hi'
import React, {ReactNode} from 'react'

export interface AppShellProps {
  children?: ReactNode
}
export function AppShell({children}: AppShellProps) {
  const {isOpen, onOpen, onClose} = useDisclosure()

  return (
    <>
      <Flex h="full" minH="100vh" flexDir="column">
        <Flex as="header" flexShrink={0} h={16}>
          <Flex
            alignItems="center"
            justifyContent="center"
            w={20}
            h="full"
            backgroundColor="orange.400"
            borderBottomWidth={{base: 1, md: 0}}
          >
            <Image
              boxSize={12}
              src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/lion_1f981.png"
            />
          </Flex>
          <Flex
            aria-label="Top Navigation Bar"
            alignItems="center"
            justifyContent="flex-end"
            as="nav"
            flex="1 1 0"
            backgroundColor={{base: 'orange.400', md: 'white'}}
            borderBottomWidth={1}
          >
            <IconButton
              aria-label="Navigation Menu"
              borderRadius="base"
              display={{
                base: 'inline-flex',
                md: 'none',
              }}
              mr={4}
              icon={<Box as={HiMenu} size={24} />}
              onClick={onOpen}
              colorScheme="orange"
            />
          </Flex>
        </Flex>
        <Flex flex="1 1 0">
          <VStack
            aria-label="Side Navigation Bar"
            as="nav"
            width={20}
            display={{
              base: 'none',
              md: 'flex',
            }}
            backgroundColor="gray.800"
            spacing={4}
            p={4}
          >
            <Box width={12} height={12} backgroundColor="orange.400" />
            <Box width={12} height={12} backgroundColor="orange.400" />
            <Box width={12} height={12} backgroundColor="orange.400" />
            <Box width={12} height={12} backgroundColor="orange.400" />
          </VStack>
          <Box flex="1 1 0" backgroundColor="gray.50" p={6}>
            {children}
          </Box>
        </Flex>
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            size="lg"
            right={4}
            top={4}
            backgroundColor="white"
            color="gray.600"
            _hover={{backgroundColor: 'gray.100', color: 'gray.700'}}
            _active={{backgroundColor: 'white', color: 'gray.600'}}
          />
          <DrawerHeader>
            <Image
              boxSize={10}
              src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/lion_1f981.png"
            />
          </DrawerHeader>
          <DrawerBody>Test</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

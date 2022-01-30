import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Image,
  useDisclosure,
} from '@chakra-ui/react'
import {HiMenu} from 'react-icons/hi'
import {ReactNode} from 'react'
import {SideNavMenu} from '../SideNavMenu'

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
              icon={<Icon as={HiMenu} w={6} h={6} />}
              onClick={onOpen}
              colorScheme="orange"
            />
          </Flex>
        </Flex>
        <Flex flex="1 1 0">
          <SideNavMenu />
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

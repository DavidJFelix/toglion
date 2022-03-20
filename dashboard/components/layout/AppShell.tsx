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
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import {HiMenu} from 'react-icons/hi'
import {ChangeEvent, ReactNode, useCallback, useState} from 'react'
import {useQuery} from 'react-query'
import {useRouter} from 'next/router'
import {SideNavMenu} from '../SideNavMenu'
import {Organization} from '../../types'

const useSelectedOrganization = (organizations: Organization[]) => {
  const [organizationId, setOrganizationId] = useState<string>(
    () => localStorage.getItem('lastSelectedOrg') ?? '',
  )
}

export const OrganizationSelect = () => {
  // set the org name to the stored last org name or an empty string if no last
  // org is set
  const [orgName, setOrgName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastSelectedOrg') ?? ''
    }
    return ''
  })
  const {data, isLoading} = useQuery<{organizations: Organization[]}>(
    ['organizations'],
    async () => {
      const result = await fetch('/api/organizations/')
      return result.json()
    },
  )
  const router = useRouter()

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const organizationName = event.target.value

      // do nothing if they picked the same value
      if (orgName === organizationName) {
        return
      }

      // update the selected org
      setOrgName(organizationName)
      // set the new org as the last org name
      localStorage.setItem('lastSelectedOrg', organizationName)
      // navigate to the router
      router.push(`/o/${organizationName}`)
    },
    [orgName],
  )

  if (isLoading || !data?.organizations) {
    return null
  }

  return (
    <Select value={orgName} onChange={onChange}>
      {data?.organizations.map((org) => (
        <option key={org.id} value={org.name}>
          {org.name}
        </option>
      ))}
    </Select>
  )
}

export interface AppShellProps {
  organizationName?: string
  children?: ReactNode
}
export function AppShell({children, organizationName}: AppShellProps) {
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
              // FIXME: get rid of this external dep
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
            <Box
              display={{
                base: 'none',
                md: 'inline-flex',
              }}
            >
              <OrganizationSelect />
            </Box>
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
          {organizationName && (
            <SideNavMenu organizationName={organizationName} />
          )}
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

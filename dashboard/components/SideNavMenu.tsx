import {Flex, Icon, VStack} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import {HiChartBar, HiCog, HiOutlineFlag, HiUserGroup} from 'react-icons/hi'

export function SideNavMenu() {
  const {pathname} = useRouter()

  const routes = [
    {icon: HiOutlineFlag, title: 'Flags', path: '/flags'},
    {icon: HiChartBar, title: 'History', path: '/history'},
    {icon: HiUserGroup, title: 'Organization Members', path: '/members'},
    {icon: HiCog, title: 'Settings', path: '/settings'},
  ]
  return (
    <VStack
      aria-label="Side Navigation Bar"
      as="nav"
      width={20}
      display={{
        base: 'none',
        md: 'flex',
      }}
      backgroundColor="gray.700"
      spacing={3}
      p={3}
    >
      {routes.map(({icon, path, title}) => (
        <Link key={title} href={path}>
          <Flex
            as="a"
            width={14}
            height={14}
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
            _hover={{
              color: 'gray.300',
              backgroundColor: 'gray.600',
            }}
            {...(path === pathname
              ? {
                  backgroundColor: 'gray.800',
                  color: 'white',
                }
              : {
                  color: 'gray.400',
                })}
          >
            <Icon as={icon} w={6} h={6} />
          </Flex>
        </Link>
      ))}
    </VStack>
  )
}

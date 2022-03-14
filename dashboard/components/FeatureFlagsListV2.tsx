import {
  Box,
  Heading,
  Link as ChakraLink,
  StackDivider,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import {Flag} from 'types'

export interface FeatureFlagsListProps {
  flags: Flag[]
  isLoading?: boolean
  organizationName: string
}
export function FeatureFlagsList({
  flags,
  isLoading = false,
  organizationName,
}: FeatureFlagsListProps) {
  return (
    <>
      {isLoading ? (
        <></>
      ) : (
        <VStack
          spacing={0}
          align="stretch"
          divider={<StackDivider />}
          borderColor="gray.200"
          borderWidth={1}
        >
          {flags.map((flag) => (
            <Box key={flag.id} flexGrow={1} p={6} backgroundColor="white">
              <NextLink
                href={`/o/${encodeURIComponent(
                  organizationName,
                )}/flags/${encodeURIComponent(flag.name)}`}
                passHref
              >
                <Heading as={ChakraLink} size="sm" color="gray.700">
                  {flag.name}
                </Heading>
              </NextLink>
            </Box>
          ))}
        </VStack>
      )}
    </>
  )
}

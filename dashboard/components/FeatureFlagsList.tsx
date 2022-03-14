import {
  Box,
  Circle,
  HStack,
  StackDivider,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import {Flag} from 'types'

export interface FeatureFlagsListProps {
  flags: Flag[]
  onFlagChange: (newFlag: Flag) => void
}

const EnabledIcon = ({isEnabled}: {isEnabled: boolean}) => (
  <Circle w={2} h={2} bgColor={isEnabled ? 'green.500' : 'gray.500'} />
)

export function FeatureFlagsList({flags, onFlagChange}: FeatureFlagsListProps) {
  return (
    <VStack
      borderWidth="1px"
      borderColor="gray.200"
      divider={<StackDivider borderColor="gray.200" />}
      spacing={0}
      align="stretch"
    >
      {flags.map((flag) => (
        <HStack key={flag.id} spacing={3} p={3}>
          <EnabledIcon isEnabled />
          <Box flexGrow={1}>
            <Text color="blue.600">{flag.name}</Text>
            <Text color="gray.600">no description</Text>
          </Box>
          <Switch
            isChecked={flag.value as boolean}
            onChange={({target: {checked}}) =>
              onFlagChange({...flag, value: checked})
            }
          />
        </HStack>
      ))}
    </VStack>
  )
}

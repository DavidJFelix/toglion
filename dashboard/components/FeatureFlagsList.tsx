import {
  Box,
  Circle,
  HStack,
  StackDivider,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import {FeatureFlag} from '@toglion/types'

const EnabledIcon = ({isEnabled}: {isEnabled: boolean}) => (
  <Circle w={2} h={2} bgColor={isEnabled ? 'green.500' : 'gray.500'} />
)

export const FeatureFlagsList = ({
  flags,
  onToggle,
}: {
  flags: FeatureFlag[]
  onToggle: (id: string) => void
}) => (
  <VStack
    borderWidth="1px"
    borderColor="gray.200"
    divider={<StackDivider borderColor="gray.200" />}
    spacing={0}
    align="stretch"
  >
    {flags.map((flag) => (
      <HStack key={flag.id} spacing={3} p={3}>
        <EnabledIcon isEnabled={flag.isEnabled} />
        <Box flexGrow={1}>
          <Text color="blue.600">{flag.title}</Text>
          <Text color="gray.600">{flag.description}</Text>
        </Box>
        <Switch isChecked={flag.isEnabled} onChange={() => onToggle(flag.id)} />
      </HStack>
    ))}
  </VStack>
)

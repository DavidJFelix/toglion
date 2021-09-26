import {Box, Heading} from '@chakra-ui/react'
import {FeatureFlag} from '@toglion/types'
import {useState} from 'react'
import {FeatureFlagsList} from '../components/FeatureFlagsList'

const defaultFlags: FeatureFlag[] = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'If enabled, the app is in maintenance mode',
    isEnabled: true,
  },
  {
    id: 'experiment',
    title: 'Experiment',
    description: 'If enabled, The Big Experiment® is turned on',
    isEnabled: false,
  },
]

function IndexPage() {
  const [flags, setFlags] = useState(defaultFlags)

  const onFlagToggle = (id: string) => {
    setFlags((flags) => {
      const newFlags = [...flags]
      const flagIndex = flags.findIndex((flag) => flag.id === id)

      if (flagIndex !== -1) {
        const flag = flags[flagIndex]
        const isEnabled = !flag.isEnabled
        newFlags[flagIndex] = {
          ...flag,
          isEnabled,
        }
      }

      return newFlags
    })
  }

  return (
    <Box maxW="lg">
      <Heading>Feature Flags</Heading>
      <FeatureFlagsList flags={flags} onToggle={onFlagToggle} />
    </Box>
  )
}

export default IndexPage

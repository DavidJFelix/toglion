import {Flag} from 'types'
import {FeatureFlagsList, FeatureFlagsListProps} from './FeatureFlagsList'

export default {
  title: 'Feature Flags List',
  component: FeatureFlagsList,
}

export const Empty = {args: {}}

export const WithFlags = {
  args: {
    flags: [
      {
        id: '0',
        value: true,
        name: 'Very Important Flag',
        organizationId: '1',
        schema: '{"type": "boolean"}',
      },
      {
        id: '1',
        value: false,
        name: 'Not Important Flag',
        organizationId: '1',
        schema: '{"type": "boolean"}',
      },
    ],
    onFlagChange: logFlagChange,
  } as FeatureFlagsListProps,
}

function logFlagChange(newFlag: Flag) {
  console.log(`Toggling feature flag: ${newFlag}`)
}

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
        isEnabled: true,
        title: 'Very Important Flag',
        description: 'This flag is very important',
      },
      {
        id: '1',
        isEnabled: false,
        title: 'Not Important Flag',
        description: 'This flag is not very important',
      },
    ],
    onToggle: logToggle,
  } as FeatureFlagsListProps,
}

function logToggle(id: string) {
  console.log(`Toggling feature flag with id of ${id}`)
}

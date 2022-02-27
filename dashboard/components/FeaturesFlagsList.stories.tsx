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
      },
      {
        id: '1',
        value: false,
        name: 'Not Important Flag',
        organizationId: '1',
      },
    ],
    onToggle: logToggle,
  } as FeatureFlagsListProps,
}

function logToggle(id: string) {
  console.log(`Toggling feature flag with id of ${id}`)
}

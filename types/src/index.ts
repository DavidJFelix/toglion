export interface FeatureFlag {
  /** The unique id of the feature flag. */
  id: string
  /** The title of the feature flag. */
  title: string
  /** The description of the feature flag. Optional. */
  description?: string
  /** Whether the feature flag is enabled. */
  isEnabled: boolean
}

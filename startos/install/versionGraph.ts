import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions/v0_10_0'

export const versionGraph = VersionGraph.of({
  current,
  other,
})

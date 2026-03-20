import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions/v0_34_3'

export const versionGraph = VersionGraph.of({
  current,
  other,
})

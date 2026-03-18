import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_10_0 = VersionInfo.of({
  version: '0.10.0:0',
  releaseNotes: {
    en_US: 'Initial StartOS release of Am I Exposed? v0.10.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export { v_0_10_0 as current }
export const other = []

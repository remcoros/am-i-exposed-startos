import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_34_3 = VersionInfo.of({
  version: '0.34.3:0',
  releaseNotes: {
    en_US: 'Initial StartOS release of Am I Exposed? v0.34.3',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export { v_0_34_3 as current }
export const other = []

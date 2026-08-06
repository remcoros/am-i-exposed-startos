import { defaultMempoolProvider, storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const mempoolProvider =
    (await storeJson.read((store) => store.mempoolProvider).const(effects)) ??
    defaultMempoolProvider

  return {
    ...(mempoolProvider === 'mempool'
      ? {
          mempool: {
            kind: 'running' as const,
            versionRange: '>=3.3.1:18',
            healthChecks: ['webui'],
          },
        }
      : {
          'mempool-api-proxy': {
            kind: 'running' as const,
            versionRange: '>=0.1.0:0',
            healthChecks: ['api'],
          },
        }),
    tor: {
      kind: 'running',
      versionRange: '>=0.4.9.11:4',
      healthChecks: ['tor'],
    },
  }
})

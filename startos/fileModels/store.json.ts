import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const mempoolProviders = ['mempool', 'mempool-api-proxy'] as const
export type MempoolProvider = (typeof mempoolProviders)[number]
export const defaultMempoolProvider: MempoolProvider = 'mempool'

const shape = z.object({
  mempoolProvider: z.enum(mempoolProviders).catch(defaultMempoolProvider),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)

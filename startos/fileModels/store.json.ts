import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const mempoolSources = {
  public: 'Public (mempool.space)',
  local: 'Local (Mempool on StartOS)',
} as const

const shape = z
  .object({
    mempoolSource: z.enum(['public', 'local']).catch('local'),
  })
  .strip()

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/store.json',
  },
  shape,
)

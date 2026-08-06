import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  network: z.enum(['mainnet', 'testnet4']).catch('testnet4'),
  logLevel: z.enum(['error', 'warn', 'info', 'debug', 'trace']).catch('warn'),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)

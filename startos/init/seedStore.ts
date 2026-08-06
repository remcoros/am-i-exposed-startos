import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedStore = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read((value) => value).once()

  await storeJson.write(effects, {
    network: store?.network ?? 'testnet4',
    logLevel: store?.logLevel ?? 'warn',
  })
})

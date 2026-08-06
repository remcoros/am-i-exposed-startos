import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedStore = sdk.setupOnInit(async (effects) => {
  const network =
    (await storeJson.read((store) => store.network).once()) ?? 'testnet4'

  await storeJson.write(effects, { network })
})

import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  network: Value.select({
    name: i18n('Network'),
    description: i18n(
      'Select the Bitcoin network and matching Bitcoin and Fulcrum services.',
    ),
    values: {
      mainnet: i18n('Mainnet'),
      testnet4: i18n('Testnet4'),
    },
    default: 'testnet4',
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  {
    name: i18n('Configure'),
    description: i18n('Choose which Bitcoin network this service uses.'),
    warning: i18n(
      'Changing the network switches both Bitcoin and Fulcrum dependencies and restarts the service.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async () => ({ network: await selectedNetworkForAction() }),
  async ({ effects, input }) =>
    storeJson.merge(effects, { network: input.network }),
)

const selectedNetworkForAction = async () =>
  (await storeJson.read((store) => store.network).once()) ?? 'testnet4'

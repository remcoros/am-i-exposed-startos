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
  logLevel: Value.select({
    name: i18n('Proxy log level'),
    description: i18n(
      'Control proxy log verbosity. Informational and more verbose levels include HTTP request logs.',
    ),
    values: {
      error: i18n('Errors only'),
      warn: i18n('Warnings and errors'),
      info: i18n('Informational'),
      debug: i18n('Debug'),
      trace: i18n('Trace'),
    },
    default: 'warn',
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  {
    name: i18n('Configure'),
    description: i18n('Choose the Bitcoin network and proxy log level.'),
    warning: i18n(
      'Changing either setting restarts the service. Changing the network also switches both Bitcoin and Fulcrum dependencies.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async () => selectedConfigForAction(),
  async ({ effects, input }) =>
    storeJson.merge(effects, {
      network: input.network,
      logLevel: input.logLevel,
    }),
)

const selectedConfigForAction = async () => {
  const store = await storeJson.read((value) => value).once()

  return {
    network: store?.network ?? 'testnet4',
    logLevel: store?.logLevel ?? 'warn',
  }
}

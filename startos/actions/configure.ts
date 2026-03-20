import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson, mempoolSources } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  mempoolSource: Value.select({
    name: i18n('Mempool Source'),
    description: i18n(
      'Choose where Am I Exposed? fetches Bitcoin blockchain data. Use "Public" for zero setup (data leaves your device). Use "Local" to route all requests through your own Mempool instance running on StartOS for maximum privacy.',
    ),
    warning: null,
    default: 'local',
    values: mempoolSources,
  }),
})

export const configure = sdk.Action.withInput(
  // id
  'configure',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure'),
    description: i18n('Set the Mempool data source for blockchain lookups'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // pre-fill from current store
  async ({ effects }) => storeJson.read().once(),

  // save to store
  async ({ effects, input }) => storeJson.merge(effects, input),
)

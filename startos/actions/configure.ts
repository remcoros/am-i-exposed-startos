import { storeJson, defaultMempoolProvider } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  mempoolProvider: Value.select({
    name: i18n('Blockchain Data Provider'),
    description: i18n(
      'Choose which local service supplies Bitcoin blockchain data.',
    ),
    values: {
      mempool: 'mempool.space',
      'mempool-api-proxy': 'mempool.space (proxy)',
    },
    default: defaultMempoolProvider,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  async () => ({
    name: i18n('Configure'),
    description: i18n('Select the local blockchain data provider.'),
    warning: null,
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => ({
    mempoolProvider:
      (await storeJson.read((store) => store.mempoolProvider).once()) ??
      defaultMempoolProvider,
  }),
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      mempoolProvider: input.mempoolProvider,
    })
  },
)

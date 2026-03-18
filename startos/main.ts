import { sdk } from './sdk'
import { i18n } from './i18n'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Am I Exposed?'))

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'am-i-exposed' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'am-i-exposed-sub',
    ),
    exec: {
      command: sdk.useEntrypoint(),
      env: {
        // Satisfy envsubst in the nginx template — point at public mempool.space
        // until local mempool integration is wired up
        APP_MEMPOOL_IP: 'mempool.space',
        APP_MEMPOOL_PORT: '80',
        APP_TOR_PROXY_IP: '127.0.0.1',
        APP_TOR_PROXY_PORT: '3001',
        APP_MEMPOOL_HIDDEN_SERVICE: '',
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})

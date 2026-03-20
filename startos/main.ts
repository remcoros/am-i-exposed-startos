import { sdk } from './sdk'
import { i18n } from './i18n'
import { uiPort, torProxyPort } from './utils'
import { storeJson } from './fileModels/store.json'

// Internal port mempool listens on within the StartOS network
const mempoolLocalPort = 80

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Am I Exposed?'))

  const mempoolSource = await storeJson
    .read((s) => s.mempoolSource)
    .const(effects)

  const mempoolIp =
    mempoolSource === 'local' ? 'mempool.startos' : 'mempool.space'
  const mempoolPort = mempoolSource === 'local' ? mempoolLocalPort : 80

  // Get the Tor container IP (null if Tor is not installed)
  const torIp = await sdk.getContainerIp(effects, { packageId: 'tor' }).const()

  return sdk.Daemons.of(effects)
    .addDaemon('tor-proxy', {
      subcontainer: await sdk.SubContainer.of(
        effects,
        { imageId: 'am-i-exposed-tor-proxy' },
        null,
        'tor-proxy-sub',
      ),
      exec: {
        command: ['node', 'server.js'],
        env: {
          PORT: String(torProxyPort),
          TOR_PROXY_IP: torIp ?? '127.0.0.1',
          TOR_PROXY_PORT: '9050',
        },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, torProxyPort, {
            successMessage: i18n('Tor proxy is ready'),
            errorMessage: i18n('Tor proxy is not ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('primary', {
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
          APP_MEMPOOL_IP: mempoolIp,
          APP_MEMPOOL_PORT: String(mempoolPort),
          APP_TOR_PROXY_IP: '127.0.0.1',
          APP_TOR_PROXY_PORT: String(torProxyPort),
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
      requires: ['tor-proxy'],
    })
})

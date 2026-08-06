import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { manifest as mainnetBitcoinManifest } from 'bitcoin-core-startos/startos/manifest'
import {
  rpcHostId as mainnetRpcHostId,
  rpcPort as mainnetRpcPort,
  rpccookiefile as mainnetCookiePath,
} from 'bitcoin-core-startos/startos/utils'
import { manifest as testnetBitcoinManifest } from 'bitcoin-core-testnet-startos/startos/manifest'
import {
  rpcHostId as testnetRpcHostId,
  rpcPort as testnetRpcPort,
  rpccookiefile as testnetCookiePath,
} from 'bitcoin-core-testnet-startos/startos/utils'
import {
  electrumPort as mainnetElectrumPort,
  mainHostId as mainnetFulcrumHostId,
} from 'fulcrum-startos/startos/utils'
import {
  electrumPort as testnetElectrumPort,
  mainHostId as testnetFulcrumHostId,
} from 'fulcrum-testnet-startos/startos/utils'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  bitcoinMountpoint,
  proxyPort,
  splitBridgeAddress,
  torProxyPort,
  uiPort,
} from './utils'

const proxyPatchAsset = 'hide-proxy-explorer-links.js'
const proxyPatchPublicPath = '/startos-proxy-ui.js'
const proxyPatchTarget = `/usr/share/nginx/html${proxyPatchPublicPath}`
const proxyPatchMarker = 'data-startos-proxy-ui-patch'

const patchProxyExplorerLinks = async (rootfs: string): Promise<void> => {
  await copyFile(
    `${rootfs}/startos-assets/${proxyPatchAsset}`,
    `${rootfs}${proxyPatchTarget}`,
  )

  const indexPath = `${rootfs}/usr/share/nginx/html/index.html`
  const indexHtml = await readFile(indexPath, 'utf8')
  if (indexHtml.includes(proxyPatchMarker)) return

  const closingBody = indexHtml.lastIndexOf('</body>')
  if (closingBody < 0) {
    throw new Error('Cannot patch Am I Exposed: index.html has no closing body')
  }

  const scriptTag = `<script defer src="${proxyPatchPublicPath}" ${proxyPatchMarker}></script>`
  await writeFile(
    indexPath,
    `${indexHtml.slice(0, closingBody)}${scriptTag}${indexHtml.slice(closingBody)}`,
  )
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Am I Exposed?'))

  const network = await storeJson.read((store) => store.network).const(effects)
  if (!network) throw new Error('StartOS configuration store is missing')

  const isMainnet = network === 'mainnet'
  const bitcoinAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: isMainnet ? 'bitcoind' : 'bitcoind-testnet',
      hostId: isMainnet ? mainnetRpcHostId : testnetRpcHostId,
      internalPort: isMainnet ? mainnetRpcPort : testnetRpcPort,
      ssl: false,
    })
    .const()
  const fulcrumAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: isMainnet ? 'fulcrum' : 'fulcrum-testnet',
      hostId: isMainnet ? mainnetFulcrumHostId : testnetFulcrumHostId,
      internalPort: isMainnet ? mainnetElectrumPort : testnetElectrumPort,
      ssl: false,
    })
    .const()

  const fulcrum = fulcrumAddress ? splitBridgeAddress(fulcrumAddress) : null
  const bitcoinCookiePath = `${bitcoinMountpoint}/${
    isMainnet ? mainnetCookiePath : testnetCookiePath
  }`
  const bitcoinMounts = isMainnet
    ? sdk.Mounts.of().mountDependency<typeof mainnetBitcoinManifest>({
        dependencyId: 'bitcoind',
        volumeId: 'main',
        subpath: null,
        mountpoint: bitcoinMountpoint,
        readonly: true,
        type: 'directory',
        idmap: [{ fromId: 0, toId: 1000 }],
      })
    : sdk.Mounts.of().mountDependency<typeof testnetBitcoinManifest>({
        dependencyId: 'bitcoind-testnet',
        volumeId: 'main',
        subpath: null,
        mountpoint: bitcoinMountpoint,
        readonly: true,
        type: 'directory',
        idmap: [{ fromId: 0, toId: 1000 }],
      })

  const proxySubcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'proxy' },
    bitcoinMounts,
    'proxy',
  )

  const mainMounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    })
    .mountAssets({
      subpath: proxyPatchAsset,
      mountpoint: `/startos-assets/${proxyPatchAsset}`,
      type: 'file',
    })
  const mainSubcontainer = await sdk.SubContainer.eager(
    effects,
    { imageId: 'main' },
    mainMounts,
    'main',
  )
  await patchProxyExplorerLinks(mainSubcontainer.rootfs)

  const torSocks = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()

  return sdk.Daemons.of(effects)
    .addDaemon('proxy', {
      subcontainer: proxySubcontainer,
      exec: {
        command: ['node', '--use-system-ca', 'dist/server.js'],
        env: {
          BITCOIN_NETWORK: network,
          SERVER_HOST: '127.0.0.1',
          SERVER_PORT: String(proxyPort),
          RATE_LIMIT_MAX: '0',
          FULCRUM_TLS: 'false',
          ...(bitcoinAddress
            ? {
                BITCOIN_RPC_URL: `http://${bitcoinAddress}`,
                BITCOIN_RPC_COOKIE_FILE: bitcoinCookiePath,
              }
            : {}),
          ...(fulcrum
            ? {
                FULCRUM_HOST: fulcrum.host,
                FULCRUM_PORT: String(fulcrum.port),
              }
            : {}),
        },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${String(proxyPort)}/ready`,
            {
              successMessage: i18n('The API is ready'),
              errorMessage: i18n('The API is not ready'),
            },
          ),
      },
      requires: [],
    })
    .addDaemon('tor-proxy', {
      subcontainer: sdk.SubContainer.of(
        effects,
        { imageId: 'tor-proxy' },
        sdk.Mounts.of(),
        'tor-proxy',
      ),
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          HOST: '127.0.0.1',
          PORT: String(torProxyPort),
          TOR_SOCKS: torSocks,
        },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, torProxyPort, {
            successMessage: i18n('Tor proxy is ready'),
            errorMessage: i18n('Waiting for Tor proxy to be ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: mainSubcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          APP_MEMPOOL_IP: '127.0.0.1',
          APP_MEMPOOL_PORT: String(proxyPort),
          APP_TOR_PROXY_IP: '127.0.0.1',
          APP_TOR_PROXY_PORT: String(torProxyPort),
          APP_MEMPOOL_HIDDEN_SERVICE: '',
          APP_MEMPOOL_EXTERNAL_URL: '',
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
      requires: ['proxy', 'tor-proxy'],
    })
})

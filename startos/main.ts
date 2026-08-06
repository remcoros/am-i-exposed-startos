import { copyFile, readFile, writeFile } from 'node:fs/promises'
import {
  apiHostId as mempoolProxyHostId,
  apiPort as mempoolProxyPort,
} from 'mempool-api-proxy-startos/startos/utils'
import {
  mainHostId as mempoolHostId,
  uiPort as mempoolUiPort,
} from 'mempool-startos/startos/utils'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { defaultMempoolProvider, storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { torProxyPort, uiPort } from './utils'

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

  const mempoolProvider =
    (await storeJson.read((store) => store.mempoolProvider).const(effects)) ??
    defaultMempoolProvider
  const selectedProvider =
    mempoolProvider === 'mempool'
      ? {
          packageId: 'mempool' as const,
          hostId: mempoolHostId,
          internalPort: mempoolUiPort,
          healthId: 'webui',
          displayName: 'Mempool',
        }
      : {
          packageId: 'mempool-api-proxy' as const,
          hostId: mempoolProxyHostId,
          internalPort: mempoolProxyPort,
          healthId: 'api',
          displayName: 'Mempool API Proxy',
        }

  // The browser-facing nginx process does not reconnect its upstream on its
  // own. Watch the selected provider's actual ready health so this main context
  // is rebuilt when that provider becomes reachable again after a restart.
  const providerStatus = await sdk
    .getStatus(effects, { packageId: selectedProvider.packageId })
    .const()
  if (providerStatus?.health[selectedProvider.healthId]?.result !== 'success') {
    throw new Error(
      `Waiting for ${selectedProvider.displayName} to be reachable`,
    )
  }

  // Both providers implement the same plaintext HTTP /api contract consumed
  // by the pinned upstream image. Resolve the selected package's declared
  // host/port contract rather than assuming its assigned external port.
  const providerBridge = await sdk.host
    .getBridgeAddress(effects, {
      packageId: selectedProvider.packageId,
      hostId: selectedProvider.hostId,
      internalPort: selectedProvider.internalPort,
      ssl: false,
    })
    .const()
  if (!providerBridge) {
    throw new Error(
      `Waiting for ${selectedProvider.displayName} to be reachable`,
    )
  }
  const [mempoolIp, mempoolPort] = providerBridge.split(':')

  // Only the full Mempool package has a browser-facing explorer. The proxy is
  // API-only, so it deliberately supplies no external URL; a proxy-only asset
  // patch below hides the pinned UI's otherwise-broken fallback link.
  const mempoolExternalUrl =
    mempoolProvider === 'mempool'
      ? await sdk.host
          .get(
            effects,
            { hostId: mempoolHostId, packageId: 'mempool' },
            (host) => {
              const addr =
                host &&
                Object.values(host.bindings)
                  .flatMap((binding) => Object.values(binding.interfaces))
                  .find((serviceInterface) => serviceInterface.id === 'webui')
                  ?.addressInfo
              if (!addr) return ''
              return (
                addr
                  .filter({ visibility: 'public', kind: 'domain' })
                  .format()[0] ??
                addr.filter({ visibility: 'public', kind: 'ip' }).format()[0] ??
                addr.filter({ kind: 'mdns' }).format()[0] ??
                ''
              )
            },
          )
          .const()
      : ''

  // Tor's SOCKS proxy over the bridge, handed to the tor-proxy sidecar as
  // TOR_SOCKS. With the 9050 fallback the resolved address stays constant across
  // tor install/update/uninstall, so this `.const()` never restarts on tor
  // churn; a dead bridge address is just connection-refused, so routing
  // Chainalysis lookups through it is always safe.
  const torSocks = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()

  let mainMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })

  let mainSubcontainer
  if (mempoolProvider === 'mempool-api-proxy') {
    mainMounts = mainMounts.mountAssets({
      subpath: proxyPatchAsset,
      mountpoint: `/startos-assets/${proxyPatchAsset}`,
      type: 'file',
    })
    const eagerMain = await sdk.SubContainer.eager(
      effects,
      { imageId: 'main' },
      mainMounts,
      'main',
    )
    await patchProxyExplorerLinks(eagerMain.rootfs)
    mainSubcontainer = eagerMain
  } else {
    mainSubcontainer = sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      mainMounts,
      'main',
    )
  }

  return sdk.Daemons.of(effects)
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
          APP_MEMPOOL_IP: mempoolIp,
          APP_MEMPOOL_PORT: mempoolPort,
          APP_TOR_PROXY_IP: '127.0.0.1',
          APP_TOR_PROXY_PORT: String(torProxyPort),
          APP_MEMPOOL_HIDDEN_SERVICE: '',
          APP_MEMPOOL_EXTERNAL_URL: mempoolExternalUrl,
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

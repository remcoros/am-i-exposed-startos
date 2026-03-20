import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { configure } from './actions/configure'

const mempoolTaskReplayId = 'mempool:configure-source'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const mempoolSource = await storeJson
    .read((s) => s.mempoolSource)
    .const(effects)

  const deps: Record<string, any> = {}

  // Tor is always optional — declare it if installed so StartOS shows the link
  const torIp = await sdk.getContainerIp(effects, { packageId: 'tor' }).const()
  if (torIp) {
    deps.tor = {
      kind: 'running',
      versionRange: '*',
      healthChecks: [],
    }
  }

  if (mempoolSource === 'local') {
    const depResult = await sdk.checkDependencies(effects, ['mempool'])
    const mempoolInstalled = depResult.installedSatisfied('mempool')

    if (!mempoolInstalled) {
      await sdk.action.createOwnTask(effects, configure, 'important', {
        replayId: mempoolTaskReplayId,
        reason: i18n(
          'Mempool is not installed. Switch the source to "Public (mempool.space)" or install Mempool on StartOS.',
        ),
      })

      deps.mempool = {
        kind: 'running',
        versionRange: '*',
        healthChecks: [],
      }
    } else {
      await sdk.action.clearTask(effects, mempoolTaskReplayId)

      deps.mempool = {
        kind: 'running',
        versionRange: '*',
        healthChecks: [],
      }
    }
  } else {
    await sdk.action.clearTask(effects, mempoolTaskReplayId)
  }

  return deps
})


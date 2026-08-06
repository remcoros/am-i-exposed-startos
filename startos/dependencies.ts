import { autoconfig as configureMainnetBitcoin } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { autoconfig as configureTestnetBitcoin } from 'bitcoin-core-testnet-startos/startos/actions/config/autoconfig'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'

const mainnetConfigReplayId = 'am-i-exposed-modded-bitcoin-mainnet'
const testnetConfigReplayId = 'am-i-exposed-modded-bitcoin-testnet4'

const torDependency = {
  kind: 'running' as const,
  versionRange: '>=0.4.9.11:4',
  healthChecks: ['tor'],
}

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const network = await storeJson.read((store) => store.network).const(effects)

  if (network === 'mainnet') {
    await sdk.action.clearTask(effects, testnetConfigReplayId)
    await sdk.action.createTask(
      effects,
      'bitcoind',
      configureMainnetBitcoin,
      'critical',
      {
        replayId: mainnetConfigReplayId,
        input: {
          kind: 'partial',
          accept: [{ prune: 0, txindex: true }],
          set: { prune: 0, txindex: true },
        },
        when: { condition: 'input-not-matches', once: false },
        reason: i18n(
          'Bitcoin must be unpruned with transaction indexing enabled.',
        ),
      },
    )

    return {
      bitcoind: {
        kind: 'running',
        versionRange: '>=31.1:4',
        healthChecks: ['bitcoind', 'sync-progress'],
      },
      fulcrum: {
        kind: 'running',
        versionRange: '>=2.1.1:8',
        healthChecks: ['primary', 'sync-progress'],
      },
      tor: torDependency,
    }
  }

  await sdk.action.clearTask(effects, mainnetConfigReplayId)
  await sdk.action.createTask(
    effects,
    'bitcoind-testnet',
    configureTestnetBitcoin,
    'critical',
    {
      replayId: testnetConfigReplayId,
      input: {
        kind: 'partial',
        accept: [{ prune: 0, txindex: true }],
        set: { prune: 0, txindex: true },
      },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n(
        'Bitcoin must be unpruned with transaction indexing enabled.',
      ),
    },
  )

  return {
    'bitcoind-testnet': {
      kind: 'running',
      versionRange: '>=31.1:1',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
    'fulcrum-testnet': {
      kind: 'running',
      versionRange: '>=2.1.1:2',
      healthChecks: ['primary', 'sync-progress'],
    },
    tor: torDependency,
  }
})

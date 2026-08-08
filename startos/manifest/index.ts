import { setupManifest } from '@start9labs/start-sdk'
import {
  bitcoinMainnetDescription,
  bitcoinTestnetDescription,
  fulcrumMainnetDescription,
  fulcrumTestnetDescription,
  long,
  short,
  torDescription,
} from './i18n'

export const manifest = setupManifest({
  id: 'am-i-exposed-modded',
  title: 'Am I Exposed? (modded)',
  license: 'MIT',
  packageRepo: 'https://github.com/remcoros/am-i-exposed-startos',
  upstreamRepo: 'https://github.com/Copexit/am-i-exposed',
  marketingUrl: 'https://am-i.exposed',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    main: {
      source: {
        dockerTag: 'ghcr.io/copexit/am-i-exposed-umbrel:v0.35.8',
      },
      arch: ['x86_64', 'aarch64'],
    },
    proxy: {
      source: {
        dockerTag:
          'ghcr.io/remcoros/mempool-api-proxy:0.1.0@sha256:e5b12b6da202e01f00c106ad9e9b91a3d92f4a4867797dce0458fd1536783823',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'tor-proxy': {
      source: {
        dockerBuild: {
          workdir: './tor-proxy',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    bitcoind: {
      description: bitcoinMainnetDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/89394ab82fcf004c905cf65ce9c6bbd0e9dc28f0/dep-icon.svg',
      },
    },
    fulcrum: {
      description: fulcrumMainnetDescription,
      optional: true,
      metadata: {
        title: 'Fulcrum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/987f43239df8f7053a637731d67602d7f46eb35c/icon.png',
      },
    },
    'bitcoind-testnet': {
      description: bitcoinTestnetDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin (testnet4)',
        icon: 'https://raw.githubusercontent.com/remcoros/bitcoind-testnet4-startos/fea66004a383b1584ed18c59befe024bd5867fa8/dep-icon.svg',
      },
    },
    'fulcrum-testnet': {
      description: fulcrumTestnetDescription,
      optional: true,
      metadata: {
        title: 'Fulcrum (testnet4)',
        icon: 'https://raw.githubusercontent.com/remcoros/fulcrum-startos/67bd68a5e064288871ba3e6c5315d8b86e43b202/icon.png',
      },
    },
    tor: {
      description: torDescription,
      optional: false,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})

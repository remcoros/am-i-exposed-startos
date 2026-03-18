import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'am-i-exposed',
  title: 'Am I Exposed?',
  license: 'MIT',
  packageRepo: 'https://github.com/Copexit/am-i-exposed-startos',
  upstreamRepo: 'https://github.com/Copexit/am-i-exposed',
  marketingUrl: 'https://am-i.exposed',
  donationUrl: 'https://coinos.io/pay/exposed',
  docsUrls: ['https://github.com/Copexit/am-i-exposed/blob/main/README.md'],
  description: { short, long },
  volumes: ['main'],
  images: {
    'am-i-exposed': {
      source: {
        dockerTag: 'ghcr.io/copexit/am-i-exposed-umbrel:v0.10.0',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})

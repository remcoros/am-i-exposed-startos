export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Am I Exposed?': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The Bitcoin privacy scanner web interface': 5,

  'Tor proxy is ready': 11,
  'Tor proxy is not ready': 12,

  // actions/configure.ts
  'Mempool Source': 6,
  'Choose where Am I Exposed? fetches Bitcoin blockchain data. Use "Public" for zero setup (data leaves your device). Use "Local" to route all requests through your own Mempool instance running on StartOS for maximum privacy.': 7,
  'Configure': 8,
  'Set the Mempool data source for blockchain lookups': 9,

  // dependencies.ts
  'Mempool is not installed. Switch the source to "Public (mempool.space)" or install Mempool on StartOS.': 10,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

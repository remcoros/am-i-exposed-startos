export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Am I Exposed?': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  'Waiting for Tor proxy to be ready': 4,
  'Tor proxy is ready': 5,

  // interfaces.ts
  'Web UI': 6,
  'The web interface of Am I Exposed?': 7,

  // actions/configure.ts
  Configure: 8,
  Network: 9,
  'Select the Bitcoin network and matching Bitcoin and Fulcrum services.': 10,
  Mainnet: 11,
  Testnet4: 12,
  'Choose the Bitcoin network and proxy log level.': 13,
  'Changing either setting restarts the service. Changing the network also switches both Bitcoin and Fulcrum dependencies.': 14,

  // dependencies.ts
  'Bitcoin must be unpruned with transaction indexing enabled.': 15,

  // embedded API proxy
  'The API is ready': 16,
  'The API is not ready': 17,
  'Proxy log level': 18,
  'Control proxy log verbosity. Informational and more verbose levels include HTTP request logs.': 19,
  'Errors only': 20,
  'Warnings and errors': 21,
  Informational: 22,
  Debug: 23,
  Trace: 24,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:7',
  releaseNotes: {
    en_US:
      'Tunes the embedded Mempool API Proxy for large personal wallets with 16 concurrent Bitcoin RPC requests and 8 concurrent Fulcrum requests.',
    es_ES:
      'Ajusta el Mempool API Proxy integrado para grandes carteras personales con 16 solicitudes RPC de Bitcoin y 8 solicitudes de Fulcrum simultáneas.',
    de_DE:
      'Optimiert den eingebetteten Mempool API Proxy für große persönliche Wallets mit 16 gleichzeitigen Bitcoin-RPC- und 8 gleichzeitigen Fulcrum-Anfragen.',
    pl_PL:
      'Dostosowuje wbudowany Mempool API Proxy do dużych portfeli osobistych, używając 16 równoczesnych żądań Bitcoin RPC i 8 równoczesnych żądań Fulcrum.',
    fr_FR:
      'Optimise le Mempool API Proxy intégré pour les grands portefeuilles personnels avec 16 requêtes RPC Bitcoin et 8 requêtes Fulcrum simultanées.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

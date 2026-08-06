import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:4',
  releaseNotes: {
    en_US:
      'Adds a Configure action for choosing either the full Mempool package or the lightweight Mempool API Proxy as the local blockchain data provider. Existing installations continue using Mempool by default.',
    es_ES:
      'Añade una acción Configurar para elegir el paquete completo Mempool o el ligero Mempool API Proxy como proveedor local de datos de blockchain. Las instalaciones existentes continúan usando Mempool de forma predeterminada.',
    de_DE:
      'Fügt eine Konfigurationsaktion hinzu, mit der entweder das vollständige Mempool-Paket oder der schlanke Mempool API Proxy als lokaler Blockchain-Datenanbieter ausgewählt werden kann. Bestehende Installationen verwenden standardmäßig weiterhin Mempool.',
    pl_PL:
      'Dodaje akcję konfiguracji umożliwiającą wybór pełnego pakietu Mempool albo lekkiego Mempool API Proxy jako lokalnego dostawcy danych blockchain. Istniejące instalacje nadal domyślnie używają Mempool.',
    fr_FR:
      'Ajoute une action de configuration permettant de choisir le paquet Mempool complet ou le léger Mempool API Proxy comme fournisseur local de données blockchain. Les installations existantes continuent d’utiliser Mempool par défaut.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

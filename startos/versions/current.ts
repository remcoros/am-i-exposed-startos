import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:12',
  releaseNotes: {
    en_US:
      'Default to mainnet. Show the correct dependency name for Bitcoin testnet4.',
    es_ES:
      'Por defecto a mainnet. Muestra el nombre de dependencia correcto para Bitcoin testnet4.',
    de_DE:
      'Standardmäßig auf Mainnet. Zeigt den korrekten Abhängigkeitsnamen für Bitcoin testnet4 an.',
    pl_PL:
      'Domyślnie do mainnet. Pokazuje poprawną nazwę zależności dla Bitcoin testnet4.',
    fr_FR:
      "Par défaut sur le mainnet. Affiche le nom de dépendance correct pour Bitcoin testnet4.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

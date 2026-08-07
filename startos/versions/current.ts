import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:10',
  releaseNotes: {
    en_US:
      'Updates the embedded proxy to support all protocol-valid witness addresses and return mempool-compatible script assembly.',
    es_ES:
      'Actualiza el proxy integrado para admitir todas las direcciones witness válidas según el protocolo y devolver ensamblado de script compatible con mempool.',
    de_DE:
      'Aktualisiert den eingebetteten Proxy, damit alle protokollgültigen Witness-Adressen unterstützt und mempool-kompatible Skript-Assemblierungen zurückgegeben werden.',
    pl_PL:
      'Aktualizuje wbudowany serwer proxy, aby obsługiwał wszystkie adresy witness zgodne z protokołem i zwracał składnię skryptów zgodną z mempool.',
    fr_FR:
      'Met à jour le proxy intégré afin de prendre en charge toutes les adresses witness valides selon le protocole et de renvoyer un assemblage de script compatible avec mempool.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:11',
  releaseNotes: {
    en_US:
      'Adds support for ARM64 StartOS systems and updates the embedded proxy to the multi-architecture 0.1.0 image.',
    es_ES:
      'Añade compatibilidad con sistemas StartOS ARM64 y actualiza el proxy integrado a la imagen multiarquitectura 0.1.0.',
    de_DE:
      'Fügt Unterstützung für ARM64-StartOS-Systeme hinzu und aktualisiert den eingebetteten Proxy auf das Multi-Architektur-Image 0.1.0.',
    pl_PL:
      'Dodaje obsługę systemów StartOS ARM64 i aktualizuje wbudowany serwer proxy do wieloarchitekturowego obrazu 0.1.0.',
    fr_FR:
      "Ajoute la prise en charge des systèmes StartOS ARM64 et met à jour le proxy intégré vers l'image multiarchitecture 0.1.0.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

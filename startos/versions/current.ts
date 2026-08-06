import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:8',
  releaseNotes: {
    en_US:
      'Adds configurable embedded-proxy logging and defaults to warnings and errors, suppressing routine HTTP request logs.',
    es_ES:
      'Añade un registro configurable para el proxy integrado y utiliza de forma predeterminada advertencias y errores, suprimiendo los registros rutinarios de solicitudes HTTP.',
    de_DE:
      'Fügt eine konfigurierbare Protokollierung für den eingebetteten Proxy hinzu und verwendet standardmäßig Warnungen und Fehler, wodurch routinemäßige HTTP-Anfrageprotokolle unterdrückt werden.',
    pl_PL:
      'Dodaje konfigurowalne rejestrowanie wbudowanego proxy i domyślnie zapisuje ostrzeżenia oraz błędy, wyłączając rutynowe dzienniki żądań HTTP.',
    fr_FR:
      'Ajoute une journalisation configurable pour le proxy intégré et utilise par défaut les avertissements et les erreurs, supprimant les journaux courants des requêtes HTTP.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

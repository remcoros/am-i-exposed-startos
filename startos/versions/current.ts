import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:9',
  releaseNotes: {
    en_US:
      'Applies configurable logging to both the embedded proxy and Web UI nginx, suppressing their routine request logs at the default warning level.',
    es_ES:
      'Aplica el registro configurable tanto al proxy integrado como a nginx de la interfaz web, suprimiendo sus registros rutinarios de solicitudes con el nivel de advertencia predeterminado.',
    de_DE:
      'Wendet die konfigurierbare Protokollierung auf den eingebetteten Proxy und Web-UI-nginx an und unterdrückt deren routinemäßige Anfrageprotokolle bei der standardmäßigen Warnstufe.',
    pl_PL:
      'Stosuje konfigurowalne rejestrowanie zarówno do wbudowanego proxy, jak i nginx interfejsu webowego, wyłączając rutynowe dzienniki żądań przy domyślnym poziomie ostrzeżeń.',
    fr_FR:
      'Applique la journalisation configurable au proxy intégré et à nginx de l’interface web, supprimant leurs journaux courants de requêtes au niveau d’avertissement par défaut.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

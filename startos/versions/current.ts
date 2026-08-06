import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.35.8:5',
  releaseNotes: {
    en_US:
      'Embeds the lightweight Mempool API Proxy and adds a network setting that connects directly to matching local Bitcoin and Fulcrum services on mainnet or testnet4.',
    es_ES:
      'Integra el ligero Mempool API Proxy y añade una configuración de red que conecta directamente con los servicios locales correspondientes de Bitcoin y Fulcrum en mainnet o testnet4.',
    de_DE:
      'Bettet den schlanken Mempool API Proxy ein und fügt eine Netzwerkeinstellung hinzu, die sich im Mainnet oder Testnet4 direkt mit den passenden lokalen Bitcoin- und Fulcrum-Diensten verbindet.',
    pl_PL:
      'Osadza lekki Mempool API Proxy i dodaje ustawienie sieci, które łączy się bezpośrednio z odpowiednimi lokalnymi usługami Bitcoin i Fulcrum w mainnet lub testnet4.',
    fr_FR:
      'Intègre le léger Mempool API Proxy et ajoute un réglage réseau qui se connecte directement aux services Bitcoin et Fulcrum locaux correspondants sur mainnet ou testnet4.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

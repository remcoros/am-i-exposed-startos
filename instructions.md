# Am I Exposed? — StartOS Instructions

## Overview

**Am I Exposed?** is a Bitcoin privacy scanner that checks if your addresses, transactions, or UTXOs have been linked to regulated exchanges, KYC providers, or blockchain surveillance services.

Running it on StartOS keeps all scanning on your own hardware with no data sent to external servers — especially when combined with a local Mempool instance.

---

## Mempool Source

After installing, open the **Config** settings and choose a Mempool source:

- **Public (mempool.space)** — zero setup, but blockchain lookups go through mempool.space's servers.
- **Local (Mempool on StartOS)** — requires [Mempool](https://start9.com/marketplace/mempool) installed and running on StartOS. All blockchain data stays on your device.

---

## Tor Lookups

Chainalysis/blockchain analysis lookups are routed through a built-in Tor proxy sidecar. The proxy connects to `127.0.0.1:9050` if a system Tor client is available; otherwise it falls back to direct connections.

No additional configuration is needed for Tor-routed lookups.

---

## Backup & Restore

This service stores minimal runtime state. Backups include the `/data` volume, which contains your saved config. There is no wallet data or private keys.

---

## Notes

- The web interface is available on port 80 (Tor) and port 443 (LAN).
- This package uses the official [Umbrel Docker image](https://github.com/Copexit/am-i-exposed) repackaged for StartOS 0.3.5.

# Am I Exposed? — StartOS Instructions

## Overview

**Am I Exposed?** is a Bitcoin privacy scanner that checks if your addresses, transactions, or UTXOs have been linked to regulated exchanges, KYC providers, or blockchain surveillance services.

Running it on StartOS keeps all scanning on your own hardware with no data sent to external servers when combined with a local Mempool instance.

---

## Mempool Source

After installing, open the **Config** settings and choose a Mempool source:

- **Public (mempool.space)** — zero setup, but blockchain lookups go through mempool.space's servers.
- **Local (Mempool on StartOS)** — requires mempool.space installed and running on StartOS. All blockchain data stays on your device.

---

## Backup & Restore

This service stores minimal runtime state. Backups include the `/data` volume, which contains your saved config. There is no wallet data or private keys.

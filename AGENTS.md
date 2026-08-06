# AGENTS.md

This is a StartOS service-package repository that builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by
`start-cli s9pk init-workspace`, which provides the packaging guide and agent
context one level up. If the local guide is unavailable, use
<https://docs.start9.com/packaging>.

Start at the guide's recipe index and read only the recipes/references required
for the task. Work `TODO.md` top to bottom. Keep `README.md` (developer and
architecture contract) synchronized with `instructions.md` (user-visible
behavior). Do not report a runtime feature as working based only on TypeScript,
bundle, or package checks; state which behavior was exercised on StartOS.

## Package architecture

- The package manifest id is `am-i-exposed-modded`. It is a leaf UI service and
  exports only the Web UI. This id creates a distinct package that can coexist
  with `am-i-exposed`; there is no automatic migration of the old package's
  data, settings, or backups.
- The runtime contains the `main` Web UI daemon, the internal `proxy` Mempool
  API Proxy daemon, and the internal `tor-proxy` HTTP-to-SOCKS daemon. `main` uses
  `ghcr.io/copexit/am-i-exposed-umbrel:v0.35.8`, the embedded proxy uses the
  local `mempool-api-proxy:poc` development tag, and the existing Tor proxy is
  built from `tor-proxy/Dockerfile`. Do not introduce another custom image
  build. The Web UI rootfs is intentionally materialized and patched on every
  start to inject `hide-proxy-explorer-links.js` into `index.html`; this is a
  runtime rootfs patch without a custom Web UI image or Dockerfile.
- The embedded proxy is always used. Do not add a Mempool/provider switch or a
  dependency on `mempool` or the separately packaged `mempool-api-proxy`.
- The Configure action selects only `mainnet` or `testnet4`, with `testnet4` as
  the default. It conditionally declares the matching direct Bitcoin and
  Fulcrum dependencies; Tor is always required. Do not claim end-to-end network
  integration is complete: the pinned frontend independently derives and
  persists its network through URL/default behavior and browser `localStorage`,
  and uses that selection as its cache namespace. It can mismatch the StartOS
  backend until a runtime patch or source-level image fix is implemented and
  tested.
- Resolve dependency addresses with `sdk.host.getBridgeAddress(...).const()`
  and dependency-exported host/port constants. Never use `.startos` DNS names,
  dependency container IPs, or assumed external ports.
- Bitcoin RPC uses the selected package's read-only `main` volume and cookie:
  `/mnt/bitcoin/.cookie` on Mainnet or
  `/mnt/bitcoin/testnet4/.cookie` on Testnet4. Preserve the id mapping that lets
  the non-root proxy read the cookie without making the mount writable. Do not
  create or persist RPC usernames/passwords.
- Fulcrum is reached through its internal plaintext Electrum binding. The proxy
  has no writable volume, database, persistent cache, or exported interface.
  Its port is nevertheless reachable as `/api/*` through nginx on every
  enabled Web UI address.
- Keep `RATE_LIMIT_MAX=0` in the embedded proxy environment. This disables only
  the inbound HTTP rate cap, including traffic through the exported Web UI;
  bounded upstream concurrency and work limits stay enabled.
- Explorer links are always hidden because the internal API has no explorer UI.
  Preserve the always-applied materialized-rootfs script injection. Do not
  restore Mempool URL discovery or make the injection provider-conditional.
- The current local `mempool-api-proxy:poc` image is x86_64-only and suitable
  only for development. Replacing it with a reproducible published image is a
  release blocker.

## Repository boundaries

Do not add a local `file:` dependency on another StartOS package. The embedded
proxy is an image/runtime component, not a package dependency. Keep source and
image update instructions in `UPDATING.md` and incomplete release/runtime work
in `TODO.md`.

## Inspecting a running install

For the materialized Web UI rootfs, use
`start-cli package attach -i main am-i-exposed-modded <command>`. For `proxy`
or `tor-proxy`, first run `start-cli package attach am-i-exposed-modded` to list
the currently running subcontainer Guids, then select the exact Guid with
`-s <guid>`. StartOS regenerates those Guids when the service restarts. With
`start-cli 1.1.0`, `-n <subcontainer-name>` and `-i proxy` do not disambiguate
these two lazy subcontainers in a non-interactive shell.

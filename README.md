<p align="center">
  <img src="icon.svg" alt="Am I Exposed? Logo" width="21%">
</p>

# Am I Exposed? on StartOS

> **Upstream docs:** <https://github.com/Copexit/am-i-exposed>

[Am I Exposed?](https://github.com/Copexit/am-i-exposed) is a client-side
Bitcoin privacy analysis tool. This StartOS package embeds a stateless Mempool
API Proxy whose backend always connects to the selected local Bitcoin and
Fulcrum services. It does not depend on Mempool or on a separately installed
Mempool API Proxy package. End-to-end network selection is not yet complete:
the pinned frontend independently selects and persists its network.

The StartOS manifest id is `am-i-exposed-modded`. StartOS treats this as a
different package from the former `am-i-exposed` id, so the two can be installed
side by side. The new package does not migrate the old package's data, settings,
or backups.

## Container Runtime

The package runs three internal daemons:

| Daemon      | Image source                                                                                                 | Purpose                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `main`      | `ghcr.io/copexit/am-i-exposed-umbrel:v0.35.8`                                                                | Nginx and the static browser application                       |
| `proxy`     | `ghcr.io/remcoros/mempool-api-proxy@sha256:656dd0276092629e2579c7df3c0946b1c068c35b1da400369a7a6b89fe31bb69` | Stateless Esplora-compatible API backed by Bitcoin and Fulcrum |
| `tor-proxy` | Package-local `tor-proxy/Dockerfile` build                                                                   | HTTP-to-SOCKS bridge for private Chainalysis lookups           |

The Web UI and embedded proxy are referenced with `dockerTag`; neither requires
a custom Dockerfile or replacement image. The package does, however, always
materialize the Web UI rootfs and inject `hide-proxy-explorer-links.js` into its
`index.html`. This runtime script injection hides invalid explorer links. The
existing Tor proxy remains the package's sole custom Dockerfile build. The
proxy image is published from
[`remcoros/mempool-api-proxy`](https://github.com/remcoros/mempool-api-proxy)
and pinned to an immutable OCI index digest. That index currently publishes
only a `linux/amd64` runtime manifest, so the package remains x86_64-only.

The Web UI's nginx sends every `/api/*` request to the embedded proxy over the
package's private container network. The proxy port is not exported as its own
StartOS interface, but the same API remains reachable through `/api/*` on every
enabled Web UI address. `RATE_LIMIT_MAX=0` explicitly disables its per-client
HTTP request limiter, including for requests arriving through those UI
addresses; upstream concurrency, history, work, response-size, and timeout
limits remain active. The proxy has no persistent data volume.

## Volumes

| Volume    | Mount                      | Purpose                   |
| --------- | -------------------------- | ------------------------- |
| `main`    | `/data` in the Web UI      | Upstream application data |
| `startos` | StartOS package state only | Selected Bitcoin network  |

The embedded proxy is stateless. It has no database, cache volume, or data
directory. The selected Bitcoin package's `main` volume is mounted read-only
into the proxy solely for RPC cookie authentication:

- Mainnet: `/mnt/bitcoin/.cookie`
- Testnet4: `/mnt/bitcoin/testnet4/.cookie`

The mount maps Bitcoin's root-owned files to the proxy's non-root uid so the
mode-0600 cookie is readable without making the dependency volume writable.
The proxy rereads the cookie for each RPC attempt, so atomic cookie replacement
during a Bitcoin restart does not require stored credentials.

## Installation and Configuration

The **Configure** action selects only the Bitcoin network. `testnet4` is the
default for current validation. The choice switches the complete direct
dependency pair:

| Selection | Bitcoin dependency | Fulcrum dependency |
| --------- | ------------------ | ------------------ |
| Mainnet   | `bitcoind`         | `fulcrum`          |
| Testnet4  | `bitcoind-testnet` | `fulcrum-testnet`  |

Tor is always a direct dependency. The package also requires the selected
Bitcoin service to be unpruned with transaction indexing enabled. Users do not
select an API provider and do not install Mempool or Mempool API Proxy.

This setting currently controls the backend only: dependency selection and the
proxy's Bitcoin network. The pinned frontend still derives its own network from
its URL/default behavior, persists that choice in browser `localStorage`, and
uses it for its cache namespace. Its network can therefore disagree with the
StartOS backend after a fresh visit, URL change, or previously stored browser
choice. A runtime patch or source-level frontend image fix must make these
settings agree before Mainnet/Testnet4 switching is considered end-to-end
complete.

## Network Interfaces

| Interface | Port | Protocol | Purpose                      |
| --------- | ---- | -------- | ---------------------------- |
| Web UI    | 8080 | HTTP     | Privacy analysis application |

Only the Web UI is exported. The embedded blockchain API and Tor proxy remain
internal. The interface declaration does not claim Tor or public-internet
reachability; the user controls enabled StartOS addresses.

The UI has no local block explorer behind its API. An always-applied packaged
script is copied into the materialized Web UI rootfs and injected into
`index.html`; it hides transaction and address result links for both backend
network selections. This is a runtime rootfs patch, not a custom image or
Dockerfile, and it does not add a public-explorer fallback.

## Dependencies

The package declares Tor plus one matching Bitcoin/Fulcrum pair directly.
Bridge addresses are resolved reactively from dependency-exported host and port
constants; assigned external ports are never hardcoded. Bitcoin RPC uses the
plaintext bridge binding plus the read-only cookie. Fulcrum uses its plaintext
internal Electrum binding. Tor's SOCKS bridge is consumed by the internal Tor
proxy.

Dependency declarations drive StartOS warnings but do not gate daemon startup.
The package's own health and readiness checks surface unavailable, mismatched,
or unsynced upstreams.

## Actions

| Action      | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `Configure` | Select Mainnet or Testnet4; Testnet4 is the default |

There is no provider switch. Changing networks changes both backend Bitcoin and
Fulcrum dependencies and restarts the affected runtime context. It does not yet
change or clear the frontend's independent URL/`localStorage` network choice or
cache namespace.

## Backups

Backups include the Web UI's `main` volume and the `startos` volume containing
the selected network. They contain no proxy index, cache, RPC password, or
copied Bitcoin cookie. Bitcoin and Fulcrum own and back up their chain/index
state independently.

Because `am-i-exposed-modded` is a new manifest id, installing it does not
restore or adopt volumes, settings, or backups belonging to `am-i-exposed`.
Move any needed user data explicitly after its compatibility is verified; do
not assume an in-place package upgrade.

## Health Checks

- The internal Tor proxy must listen before the Web UI starts.
- The embedded Mempool API Proxy checks its `/ready` endpoint and reports the
  selected Bitcoin/Fulcrum network, genesis, txindex, and sync invariants.
- The Web UI has its own port-listening readiness check.

## Limitations and Differences

- The package supports Mainnet and Testnet4, one per installed instance. Signet
  is not selectable.
- Backend selection works independently of the pinned frontend's URL,
  `localStorage`, and cache-namespace selection. A mismatch is currently
  possible and end-to-end network switching remains a release blocker.
- Explorer links are always hidden because the embedded API is not an explorer
  UI; this is implemented by an always-applied materialized-rootfs script
  injection.
- The embedded API has no HTTP request-rate cap and `/api/*` exposes it through
  every enabled Web UI address. Keep the UI on trusted StartOS addresses or
  apply traffic controls outside the service when broadly exposing it.
- The published proxy image currently provides only a `linux/amd64` runtime
  manifest, so this package supports x86_64 only.
- Live validation and release blockers are tracked in `TODO.md`.

## What Is Unchanged from Upstream

- All privacy heuristics and chain-analysis modules
- CoinJoin detection and Boltzmann entropy analysis
- Wallet fingerprinting and entity matching
- Chainalysis address exposure checks through Tor
- Privacy scoring and language translations
- Client-side analysis in the browser; only blockchain data retrieval is
  delegated to the internal proxy

## Quick Reference for AI Consumers

```yaml
package_id: am-i-exposed-modded
architectures: [x86_64] # published proxy image provides linux/amd64 only
daemons:
  - main
  - proxy
  - tor-proxy
volumes:
  main: upstream web application data
  startos: selected Bitcoin network
ports:
  web_ui: 8080
dependencies:
  mainnet: [bitcoind, fulcrum, tor]
  testnet4: [bitcoind-testnet, fulcrum-testnet, tor]
default_network: testnet4
proxy:
  exported: false
  reachable_via: web_ui:/api/*
  persistent_data: false
  rate_limit_max: 0
  bitcoin_auth: read-only RPC cookie
frontend_network_integration: blocked # URL/localStorage/cache can mismatch backend
explorer_links: hidden by always-applied materialized-rootfs script injection
custom_dockerfile: tor-proxy/Dockerfile only
migration_from_am_i_exposed: none
```

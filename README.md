<p align="center">
  <img src="icon.svg" alt="Am I Exposed? Logo" width="21%">
</p>

# Am I Exposed? on StartOS

> **Upstream docs:** <https://github.com/Copexit/am-i-exposed>
>
> Everything not listed in this document should behave the same as upstream
> Am I Exposed?. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[Am I Exposed?](https://github.com/Copexit/am-i-exposed) is a client-side Bitcoin privacy analysis tool that grades your transactions and addresses using chain analysis heuristics — the same techniques used by surveillance firms. Paste any Bitcoin address or transaction ID and get a privacy score from 0 to 100 with a letter grade and actionable findings.

---

## Table of Contents

- [Container Runtime](#container-runtime)
- [Volumes](#volumes)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Interfaces](#network-interfaces)
- [Dependencies](#dependencies)
- [Actions](#actions)
- [Backups](#backups)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Container Runtime

| Image     | Source                                | Purpose                                      |
| --------- | ------------------------------------- | -------------------------------------------- |
| main      | `ghcr.io/copexit/am-i-exposed-umbrel` | Nginx serving static frontend + API proxy    |
| tor-proxy | Custom build (`tor-proxy/Dockerfile`) | HTTP-to-SOCKS bridge for Chainalysis lookups |

Architectures: x86_64, aarch64

The main image is the upstream Umbrel build — a static Next.js export served by nginx, with a reverse proxy that routes `/api/*` requests to the selected local blockchain data provider. The tor-proxy sidecar forwards Chainalysis address checks through Tor's SOCKS5 proxy for private surveillance database lookups.

## Volumes

| Volume    | Mount Point | Purpose                                   |
| --------- | ----------- | ----------------------------------------- |
| `main`    | `/data`     | Upstream application data                 |
| `startos` | Not mounted | Selected blockchain data provider setting |

## Installation and First-Run Flow

The existing **Mempool** package is selected by default, preserving the behavior of earlier releases. Install and run Mempool plus Tor, then start Am I Exposed?.

To use **Mempool API Proxy** instead, stop Am I Exposed?, open **Actions → Configure**, select **mempool.space (proxy)**, and start the service again. Only the selected blockchain data provider and Tor are required at runtime.

## Network Interfaces

| Interface | Port | Protocol | Purpose                         |
| --------- | ---- | -------- | ------------------------------- |
| Web UI    | 8080 | HTTP     | Privacy scanner web application |

## Dependencies

### Blockchain data provider (choose one)

#### Mempool

| Property           | Value                                     |
| ------------------ | ----------------------------------------- |
| Version constraint | Declared in `startos/dependencies.ts`     |
| Required state     | Running                                   |
| Health checks      | `webui`                                   |
| Mounted volumes    | None                                      |
| Purpose            | Blockchain API data through your own node |

#### Mempool API Proxy

| Property           | Value                                    |
| ------------------ | ---------------------------------------- |
| Version constraint | Declared in `startos/dependencies.ts`    |
| Required state     | Running                                  |
| Health checks      | `api`                                    |
| Mounted volumes    | None                                     |
| Purpose            | Lightweight mempool.space-compatible API |

All `/api/*` requests from the browser are reverse-proxied by nginx to the selected provider over the internal LXC bridge. The bridge address is resolved from each provider's exported host and port constants at runtime and passed to the upstream image as `APP_MEMPOOL_IP`/`APP_MEMPOOL_PORT`.

When Mempool is selected, `startos/main.ts` also resolves its browser-facing `webui` address for the upstream **View on local mempool** link. Mempool API Proxy is API-only and has no explorer page. For that selection only, the wrapper copies a small packaged script into the materialized upstream image and injects its tag into `index.html`; the script hides only invalid same-host `/tx/…` and `/address/…` result links. The unmodified image is used when Mempool is selected.

### Tor (required)

| Property           | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Version constraint | Declared in `startos/dependencies.ts`                |
| Required state     | Running                                              |
| Health checks      | `tor`                                                |
| Mounted volumes    | None                                                 |
| Purpose            | SOCKS5 proxy for private Chainalysis address lookups |

Chainalysis address checks are routed through Tor via the tor-proxy sidecar for private surveillance database lookups.

## Configuration Management

| StartOS-Managed                              | Upstream-Managed |
| -------------------------------------------- | ---------------- |
| Blockchain data provider selection           | None             |
| Selected provider API connection (automatic) | None             |
| Tor proxy connection (automatic)             | None             |

The **Configure** action stores the provider choice in StartOS-owned `store.json`. Connection values remain automatic environment variables and are never entered by the user.

## Actions

| Action      | Allowed status | Purpose                             |
| ----------- | -------------- | ----------------------------------- |
| `Configure` | Stopped        | Select Mempool or Mempool API Proxy |

## Backups

The `main` and `startos` volumes are backed up, including the provider choice.

## Health Checks

| Check         | Method                | Display | Messages                            |
| ------------- | --------------------- | ------- | ----------------------------------- |
| Tor Proxy     | Port listening (3001) | Hidden  | Ready: "Tor proxy is ready"         |
| Web Interface | Port listening (8080) | Shown   | Ready: "The web interface is ready" |

## Limitations and Differences

1. **Explorer links with the proxy** — Mempool API Proxy has no explorer UI, so result-page explorer links are hidden while it is selected.
2. **Proxy networks** — Mempool API Proxy supports mainnet and testnet4, but not signet. The full Mempool provider remains available for other supported upstream configurations.
3. **Mempool onion address** — The `/api/local-info` endpoint returns an empty `mempoolOnion` since Tor is handled differently on StartOS.
4. **Local development dependency** — Until `mempool-api-proxy-startos` is published, `package.json` uses a local `file:` dependency and the repo-local `.npmrc` permits that package's Git-based type dependencies and installs the local package inside this repository's build root. All temporary settings must be removed and replaced with a pinned remote dependency before publication.

## What Is Unchanged from Upstream

- All 31 heuristics and 14 chain analysis modules
- CoinJoin detection (Whirlpool, WabiSabi, JoinMarket)
- Boltzmann entropy calculation via WebAssembly
- Wallet fingerprinting and entity matching
- Chainalysis address exposure checks (via Tor proxy)
- Privacy scoring (0–100 with letter grades A+ to F)
- Support for mainnet, testnet4, and signet
- 100% client-side analysis in browser
- All 5 language translations (EN, ES, DE, FR, PT)

---

## Contributing

Build with `npm ci && make`. See the [StartOS packaging guide](https://docs.start9.com/packaging) for the full development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: am-i-exposed
images:
  main: ghcr.io/copexit/am-i-exposed-umbrel
  tor-proxy: custom build (tor-proxy/Dockerfile)
architectures: [x86_64, aarch64]
volumes:
  main: /data
  startos: provider selection
ports:
  ui: 8080
  tor-proxy: 3001 (internal)
dependencies:
  - one of: [mempool, mempool-api-proxy]
  - tor
startos_managed_env_vars:
  main:
    - APP_MEMPOOL_IP
    - APP_MEMPOOL_PORT
    - APP_TOR_PROXY_IP
    - APP_TOR_PROXY_PORT
    - APP_MEMPOOL_HIDDEN_SERVICE
    - APP_MEMPOOL_EXTERNAL_URL
  tor-proxy:
    - PORT
    - TOR_SOCKS
actions:
  - configure
health_checks:
  - port_listening: 3001
  - port_listening: 8080
backup_volumes:
  - main
  - startos
```

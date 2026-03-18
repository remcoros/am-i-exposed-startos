# am-i-exposed-startos — Packaging Runbook

Bitcoin privacy scanner (`am-i-exposed`) for StartOS 0.4.

- **Upstream repo:** https://github.com/Copexit/am-i-exposed
- **Wrapper repo:** https://github.com/Copexit/am-i-exposed-startos _(to be created)_
- **Package ID:** `am-i-exposed`
- **Target upstream version:** `0.34.0` (package.json) / `v0.10.0` (Docker image)
- **License:** MIT

---

## App Summary

`am-i.exposed` is a **static Next.js app** (no backend) that runs entirely client-side. It:

- Accepts Bitcoin addresses, txids, xpubs/descriptors, and PSBTs
- Runs 31 chain-analysis heuristics in the browser
- Fetches blockchain data from a **mempool.space-compatible API**
- Supports Tor routing via a sidecar proxy (optional)
- Has zero server-side state — all analysis is client-side WASM + JS

**Umbrel architecture (what we're adapting):**

```
[nginx container :8080]          # static Next.js export
  |-- /api/*      → mempool (APP_MEMPOOL_IP:PORT)
  |-- /tor-proxy/* → tor-proxy sidecar (APP_TOR_PROXY_IP:PORT)
  |-- /api/local-info → JSON with mempoolPort + mempoolOnion
```

**StartOS architecture (target):**

```
[am-i-exposed container :8080]   # same nginx image, same static export
  |-- /api/*      → mempool.startos:80  (StartOS internal DNS)
  |-- /tor-proxy/* → tor proxy sidecar (optional, if we build one)
  |-- /api/local-info → injected JSON (mempool port/onion info)
```

---

## Key Decisions

| Question | Decision | Rationale |
|---|---|---|
| Use upstream image? | ✅ Yes — `ghcr.io/copexit/am-i-exposed-umbrel:v0.10.0` | Multi-arch (amd64 + arm64), agnostic nginx serving |
| Build our own image? | ❌ No, not initially | Image is platform-agnostic |
| mempool dependency | Required | The app proxies all blockchain requests to local mempool |
| Tor proxy sidecar | Optional / phase 2 | Nice-to-have; skip for v1 |
| StartOS dependency on mempool | Declared as optional | App falls back to public mempool.space if no local instance |
| Nginx env injection | ✅ Use `APP_MEMPOOL_IP`/`PORT` | Matches what the image already expects via envsubst |

### Mempool connectivity

The nginx template uses `${APP_MEMPOOL_IP}` and `${APP_MEMPOOL_PORT}` (envsubst at startup).
On StartOS, mempool is reachable at `mempool.startos:80` (internal DNS).

We need to inject:
- `APP_MEMPOOL_IP=mempool.startos`
- `APP_MEMPOOL_PORT=80`

The `/api/local-info` endpoint also returns `mempoolPort` — this needs to match the external port mempool exposes to the browser (for explorer links). We'll set this to `80` and let the frontend handle it.

### Tor proxy

For v1: skip the Tor proxy sidecar. The app degrades gracefully — Tor features simply won't work without it.

---

## Packaging Checklist

### Phase 1 — Repo setup

- [x] Clone upstream repo
- [x] Initialize `am-i-exposed-startos` git repo
- [ ] Copy structure from `hello-world-startos` template
- [ ] Initialize `package.json`, `tsconfig.json`, `Makefile`
- [ ] Add `startos/sdk.ts`
- [ ] Add placeholder `icon.png` and `assets/`

### Phase 2 — Manifest

- [ ] `startos/manifest/index.ts`
  - [ ] `id: 'am-i-exposed'`
  - [ ] `title: 'Am I Exposed?'`
  - [ ] `license: 'MIT'`
  - [ ] `packageRepo`, `upstreamRepo`, `marketingUrl`, `donationUrl`, `docsUrls`
  - [ ] `volumes: ['main']`
  - [ ] `images.am-i-exposed` → `ghcr.io/copexit/am-i-exposed-umbrel:v0.10.0`
  - [ ] `arch: ['x86_64', 'aarch64']`
  - [ ] `dependencies.mempool` (optional, with metadata/s9pk)
  - [ ] Description (short + long)
  - [ ] Alerts (install alert about mempool dependency)

### Phase 3 — Main

- [ ] `startos/main.ts`
  - [ ] Single daemon `primary` with `am-i-exposed` image
  - [ ] Mount `main` volume at `/data` (or wherever nginx needs state — likely unused, but volumes required)
  - [ ] Set env vars: `APP_MEMPOOL_IP=mempool.startos`, `APP_MEMPOOL_PORT=80`
  - [ ] Set `APP_TOR_PROXY_IP` + `APP_TOR_PROXY_PORT` to empty/disabled values
  - [ ] Health check: `sdk.healthCheck.checkPortListening` on port 8080
  - [ ] `sdk.useEntrypoint()` (nginx starts with the existing CMD)

### Phase 4 — Interfaces

- [ ] `startos/interfaces.ts`
  - [ ] Single `ui` interface on port 8080
  - [ ] No auth required

### Phase 5 — Init

- [ ] `startos/init/index.ts`
  - [ ] Install init: likely no-op (no secrets, no db to bootstrap)
  - [ ] Restore init: no-op

### Phase 6 — Dependencies

- [ ] `startos/dependencies.ts`
  - [ ] Declare mempool dependency shape
  - [ ] No cross-service tasks needed initially (mempool doesn't need to be configured by us)

### Phase 7 — Versions

- [ ] `startos/install/versions/v0_10_0.ts`
- [ ] `startos/install/index.ts`

### Phase 8 — i18n

- [ ] `startos/i18n/en.ts` (short + long descriptions)
- [ ] `startos/i18n/index.ts`

### Phase 9 — Remaining files

- [ ] `startos/index.ts` (barrel)
- [ ] `startos/utils.ts`
- [ ] `startos/backups.ts`
- [ ] `startos/actions/index.ts`
- [ ] `startos/fileModels/` (likely empty or minimal)

### Phase 10 — Assets and docs

- [ ] `icon.png` (or `icon.jpg`) — download from upstream or create placeholder
- [ ] `assets/` directory with at least one tracked file
- [ ] `LICENSE` (copy MIT from upstream)
- [ ] `README.md`

### Phase 11 — Build validation

- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] `make` passes (produces `.s9pk` or build artifact)

### Phase 12 — Runtime testing (requires StartOS)

- [ ] Service starts without errors
- [ ] Health check reports healthy
- [ ] Web UI loads at the exposed interface URL
- [ ] mempool API requests proxy correctly (blockchain data loads)
- [ ] Test without mempool dependency (app should still load, use public API or show warning)
- [ ] Backup/restore cycle works

---

## Open Questions / Risks

| # | Question | Status |
|---|---|---|
| 1 | Does `mempool.startos:80` correctly resolve to the local mempool service? | ❓ Needs runtime test |
| 2 | What port does StartOS mempool expose internally? 80? 3000? | ❓ Check mempool package |
| 3 | The `/api/local-info` endpoint injects `mempoolPort` for the frontend's explorer links — what port does the browser need? | ❓ Needs investigation |
| 4 | Tor proxy sidecar — include in v1 or defer? | 🔜 Deferred to v2 |
| 5 | Does the image's nginx config need `APP_TOR_PROXY_IP`/`PORT` vars even if not used? | ❓ Check envsubst behavior |
| 6 | Do we need a mempool.space s9pk URL or metadata icon for the dependency declaration? | ❓ Check if mempool-startos has a published s9pk |
| 7 | Volume required by SDK even if nginx doesn't persist state? | Likely yes — manifest requires at least one volume |

---

## Version Strategy

- Package version: `0.10.0:0` (ExVer — upstream `v0.10.0`, revision `0`)
- Docker image: `ghcr.io/copexit/am-i-exposed-umbrel:v0.10.0`
- Upstream `package.json` version (`0.34.0`) is the npm CLI version, not the web app version — use Docker image tag

---

## Notes

- The nginx image uses `envsubst` via the official nginx template mechanism (`/etc/nginx/templates/*.conf.template` → processed on startup)
- The `APP_MEMPOOL_HIDDEN_SERVICE` env var is used for the Tor onion address in `/api/local-info` — can be set to empty string for v1
- Image already runs as non-root (UID 1000)
- Health check endpoint: `GET /health` → `200 ok`
- No persistent data, secrets, or database — simplest possible init flow

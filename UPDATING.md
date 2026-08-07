# Updating upstream images

This package uses two manifest `dockerTag` images and one package-local build:

- `ghcr.io/copexit/am-i-exposed-umbrel:v0.35.8` for `main`;
- `ghcr.io/remcoros/mempool-api-proxy:0.1.0@sha256:e5b12b6da202e01f00c106ad9e9b91a3d92f4a4867797dce0458fd1536783823`
  for `proxy`; and
- `tor-proxy/Dockerfile` for the existing internal HTTP-to-SOCKS proxy.

The Web UI and embedded Mempool API Proxy integration do not require custom
Dockerfiles or replacement images. The package does always materialize the Web
UI rootfs, inject its explorer-link-hiding script into `index.html`, and patch
nginx logging. Retain and retest those runtime patches whenever the Web UI image
changes.

## Am I Exposed? Web UI

[Copexit/am-i-exposed](https://github.com/Copexit/am-i-exposed) publishes git
tags without GitHub Releases:

```sh
gh api repos/Copexit/am-i-exposed/tags --jq '.[0].name'
```

Match the manifest's Web UI tag to the verified upstream tag; it is currently
`ghcr.io/copexit/am-i-exposed-umbrel:v0.35.8`. Confirm that the selected image
still routes `/api/*` to the embedded proxy and remains compatible with the
always-applied explorer-link script injection.

The pinned frontend independently derives its network from URL/default state,
persists it in browser `localStorage`, and uses it as a cache namespace. The
StartOS Configure action currently changes only the backend. This can mismatch
the UI and backend networks and is a release blocker, not completed integration.
Choose either a materialized-rootfs runtime patch or a source-level replacement
image fix, then test clean and pre-existing browser state on both networks.

## Embedded Mempool API Proxy

The proxy image is published from
[`remcoros/mempool-api-proxy`](https://github.com/remcoros/mempool-api-proxy)
and pinned by immutable OCI index digest. The pinned index contains
`linux/amd64` and `linux/arm64` runtime manifests. The Web UI image and the
`node:22-alpine` base used by the Tor proxy must also retain both architectures;
keep all three manifest image declarations and `ARCHES := x86 arm` aligned.

The embedded proxy must continue to:

- run as a non-root user without a writable data volume;
- use the selected Bitcoin RPC cookie and plaintext internal Fulcrum binding;
- receive `RATE_LIMIT_MAX=0`; and
- receive `CORE_RPC_MAX_CONCURRENCY=16` and `FULCRUM_MAX_CONCURRENCY=8`; and
- receive the configured `LOG_LEVEL`, defaulting to `warn`; and
- expose no separate StartOS interface for its port while remaining reachable
  as `/api/*` through all enabled Web UI addresses.

The same configured log level must patch the materialized Web UI nginx rootfs.
At `error` and `warn`, disable its global access log and quiet informational
entrypoint messages. At `info`, `debug`, and `trace`, retain the access log. Map
`trace` to nginx's `debug` error level and use `nginx-debug` for both `debug` and
`trace`. Guard the expected global directives so an upstream layout change
fails visibly instead of silently leaving noisy logs enabled.

## Tor proxy

The Tor proxy remains a package-local build from `tor-proxy/Dockerfile`. Review
its base image pin and proxy configuration whenever the Web UI's Tor behavior
or upstream base image changes. Keep this build narrowly scoped to the
HTTP-to-SOCKS adapter; do not use it to patch the Web UI or embedded Mempool API
Proxy.

## Package identity

The manifest id is now `am-i-exposed-modded`. StartOS treats it as a distinct
package that can exist beside `am-i-exposed`; this is not an in-place update and
does not migrate the old package's data, settings, or backups. Test clean
installation and side-by-side behavior. Any future migration must be designed
and verified explicitly rather than inferred from version metadata.

## Applying an update

1. Verify upstream tags, image provenance, immutable digests, and architecture
   availability for every changed image. Review the Tor proxy's pinned base
   image when that build changes.
2. Update the appropriate `dockerTag` or `tor-proxy/Dockerfile` input.
3. Install the pinned package dependencies with `npm ci --allow-git=all`.
   npm 12 otherwise rejects the nested Git dependencies used by the StartOS
   Bitcoin, Fulcrum, and Tor packages. Keep this opt-in command-local; do not
   weaken the user's global npm configuration.
4. Update `startos/versions/current.ts` in place and reset the downstream
   revision when the upstream version changes. Add a historical version file
   only when an ordered migration is required.
5. Run formatting, TypeScript, bundle, and proxy application tests.
6. Pack and install the exact artifact. Exercise both backend network
   selections, frontend URL/`localStorage`/cache agreement, cookie rotation,
   embedded-proxy readiness, every service log-level selection and suppression
   of proxy and nginx request logs at `warn`, `/api/*` exposure and limits, injected
   hidden explorer links, Tor lookups, side-by-side package identity,
   restart/update, and backup/restore before publication.

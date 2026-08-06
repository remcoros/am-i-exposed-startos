# TODO

- [ ] **Publication blocker:** replace the temporary
      `file:../../mempool-api-proxy-startos` dependency with a pinned Git remote
      branch or commit and regenerate `package-lock.json` after the proxy package
      repository is published. Remove the repo-local `.npmrc` `allow-git=all`
      and `install-links=true` workarounds at the same time; they are needed only
      while npm prepares the local package, installs its Git-based type
      dependencies, and copies it inside this package's TypeScript build root.
- [ ] Replace the proxy-only runtime explorer-link patch with the corresponding
      upstream behavior when a released Am I Exposed image can explicitly hide
      explorer links for API-only providers.
- [ ] Recheck `npm audit` after the next Start SDK release. SDK 2.0.9 bundles
      the currently reported `brace-expansion` and `js-yaml` build-tooling
      advisories, and npm cannot update those bundled copies locally.

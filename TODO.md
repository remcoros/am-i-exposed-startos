# TODO

- [ ] Choose and implement a single frontend-network integration: either extend
      the materialized-rootfs runtime patch or publish a source-level Web UI
      image fix. It must make the frontend URL/default, `localStorage` choice,
      and cache namespace follow the StartOS-selected backend network.
- [ ] Test frontend/backend network agreement on Mainnet and Testnet4 with a
      clean browser, both network URL forms, pre-existing `localStorage`, cached
      data from the other network, service restart, and repeated network
      switches. Do not mark end-to-end network integration complete while a
      mismatch remains possible.
- [ ] Verify cookie rotation and proxy recovery after Bitcoin restarts on
      Mainnet and Testnet4. Both read-only cookie paths, mode `0600`, and the
      uid 0 to 1000 mapping have been exercised on a live install.
- [ ] Verify the embedded proxy stays internal and stateless, uses plaintext
      bridge connections only, and rejects mismatched or lagging upstreams.
- [ ] Load-test `/api/*` through each enabled Web UI address to confirm
      `RATE_LIMIT_MAX=0` leaves inbound requests unthrottled while concurrency,
      history, work, response-size, and timeout limits remain enforced. Confirm
      the configured 16-request Bitcoin and 8-request Fulcrum limits and that
      the proxy port has no separate StartOS interface.
- [ ] Verify explorer links remain hidden for transaction and address results
      on both networks through the always-applied materialized-rootfs script
      injection, including after restart and package update.
- [ ] Verify Tor-backed Chainalysis lookups, service restart/update, and
      backup/restore of only intended package state.
- [ ] Recheck `npm audit` after the next Start SDK release. SDK 2.0.9 currently
      carries the reported `brace-expansion` and `js-yaml` build-tooling
      advisories.

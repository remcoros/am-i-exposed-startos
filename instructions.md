# Am I Exposed?

## Documentation

- [Am I Exposed? docs](https://github.com/Copexit/am-i-exposed/tree/main/docs)
  explain the privacy scores, heuristics, and supported analysis workflows.

## What you get on StartOS

- A **Web UI** for analyzing the privacy exposure of Bitcoin addresses,
  transactions, and wallets.
- A built-in, stateless blockchain API that always uses your selected local
  Bitcoin and Fulcrum services.
- Private Chainalysis lookups through your Tor service.

You do not need the Mempool package or a separate Mempool API Proxy package.

This package installs under the new id `am-i-exposed-modded`. It is separate
from the older `am-i-exposed` package: both may be installed at once, and data,
settings, and backups from the old package are not migrated automatically.

## Getting set up

1. Open **Actions → Configure**, select **Mainnet** or **Testnet4**, and choose
   the embedded proxy log level. Testnet4 and **Warnings and errors** are the
   defaults.
2. Install and start the Bitcoin and Fulcrum dependencies shown by StartOS for
   that network.
3. Complete the Bitcoin configuration task if it appears. Bitcoin must be
   unpruned and have transaction indexing enabled.
4. Install and start **Tor**.
5. Wait for Bitcoin and Fulcrum to sync and for Am I Exposed? to become ready.
6. Open the **Web UI** and enter an address, xpub, or transaction id.

Changing the network switches the backend Bitcoin and Fulcrum services together
and restarts Am I Exposed?. It does not migrate or share chain data between
networks.

> **Known network-selection limitation:** the pinned Web UI independently
> chooses a network from its URL/default behavior, saves that choice in browser
> `localStorage`, and uses it to namespace cached data. **Configure** does not
> currently update or clear that browser state, so the Web UI network can
> disagree with the StartOS backend. Mainnet/Testnet4 switching is not yet
> end-to-end complete. Until the frontend integration is fixed and tested,
> verify that the network shown by the UI matches the backend before relying on
> a result.

Bitcoin RPC authentication is automatic. The embedded API reads the selected
Bitcoin service's cookie from a read-only mount and follows cookie replacement
across restarts. There is no RPC username, password, or credential task to copy.

## Using Am I Exposed?

The analyzer obtains blockchain information only from its built-in proxy and
your selected local dependencies. It does not maintain another blockchain
database.

Links such as **View on local mempool** are always hidden because the embedded
API does not provide explorer pages. The package implements this by injecting a
small script into the materialized Web UI rootfs; it does not build a custom Web
UI image or Dockerfile. Analysis results and graph tools remain available.

The embedded proxy has no separate StartOS interface, but nginx exposes it as
`/api/*` through every enabled Web UI address. The package disables that API's
per-client HTTP request limit. It uses the tested personal-use concurrency
profile of 16 active Bitcoin RPC requests and 8 active Fulcrum requests for
large-wallet analysis. Its default **Warnings and errors** log level suppresses
routine HTTP request logs; use **Informational**, **Debug**, or **Trace** only
when extra detail is useful. Keep the Web UI on trusted StartOS addresses, or
add external traffic controls if you make it broadly reachable.

## Data and backups

Backups retain the Web UI data, selected network, and proxy log level. The
stateless proxy has no database or cache to back up, and Bitcoin's RPC cookie
is neither copied nor stored in this package's backup. Backups created for the
older `am-i-exposed` package are not backups of `am-i-exposed-modded` and are
not migrated into it.

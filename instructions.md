# Am I Exposed?

## Documentation

- [Am I Exposed? docs](https://github.com/Copexit/am-i-exposed/tree/main/docs) — upstream documentation for the privacy and exposure analysis tool.

## What you get on StartOS

- A **Web UI** that analyzes how exposed your on-chain Bitcoin activity is — address clustering, transaction graph hints, and the heuristics chain analysis companies use.
- A bundled Tor proxy that lets the analyzer reach external services over Tor.

## Getting set up

Am I Exposed? requires Tor and one blockchain data provider. The existing Mempool package remains the default:

1. Install and start the **Mempool** package. The analyzer talks to it for on-chain data.
2. Install and start the **Tor** package, used by the bundled proxy to fetch external lookups privately.
3. Start Am I Exposed? and open the **Web UI** to start analyzing.

To use the lightweight API-only alternative:

1. Install and configure **Mempool API Proxy** for the same Bitcoin network you intend to analyze.
2. Stop Am I Exposed?.
3. Open **Actions → Configure** and select **mempool.space (proxy)**.
4. Start Am I Exposed? again. The full Mempool package is no longer required while the proxy is selected.

## Using Am I Exposed?

### Web UI

Paste an address, xpub, or transaction id and the tool walks you through what an outside observer could infer about it.

When Mempool is selected, results that link to **View on local mempool** open your own Mempool service — using its public address if you have one set up, otherwise its `.local` address (reachable from your home network). Mempool API Proxy has no explorer pages, so these links are hidden while the proxy is selected.

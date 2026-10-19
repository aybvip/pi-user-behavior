# Documentation index — pi-user-behavior

Read-only measurement of what "user behavior" is observable on the Pi blockchain.

## Start here

| Document | What it answers |
|---|---|
| [`../README.md`](../README.md) | Overview, the seven behavior layers (B1–B7), quick start, and the master boundary table |
| [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) | "Is user behavior observable on-chain?" — layer by layer, with what each layer can and cannot prove |
| [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md) | "What is the `Engagement Score`, and is it on the blockchain?" — the official PiRC1 mechanism, decoded |
| [`FAQ-BEYOND-RPC.md`](FAQ-BEYOND-RPC.md) | "You only measure the RPC — what about multi-accounting, Sybil detection, social media, PiVerify, the Code of Conduct?" — the enforcement layer (B7) |
| [`SAID-VS-DONE.md`](SAID-VS-DONE.md) | What Pi **stated** vs what Pi **shipped** — official quotes side by side with measured state |
| [`SOURCES.md`](SOURCES.md) | Every source used, with status (official / RFC / external) |
| [`VERIFICATION.md`](VERIFICATION.md) | How to reproduce each measured claim yourself |

## The claim buckets

Every statement in this repo is sorted into exactly one bucket:

| Bucket | Meaning | Where verified |
|---|---|---|
| **Measured** | Reproduced by this repo's code against official endpoints | `node behavior.mjs --network …` |
| **Documented** | Quoted from an official Pi source (URL + status) | [`SOURCES.md`](SOURCES.md) |
| **External** | Reported by a third party — flagged **unofficial** | [`SOURCES.md`](SOURCES.md) |
| **Not claimed** | Out of scope (identity, intent, price, reserves) | [`../README.md`](../README.md) |

## The seven behavior layers

| # | Layer | On-chain? |
|---|---|---|
| B1 | Ledger operations | ✅ measured |
| B2 | Contract events | ✅ measured |
| B3 | Account / ledger state | ✅ measured |
| B4 | App engagement (`Engagement Score`) | ❌ app-side |
| B5 | Network-level Sybil heuristics | ❌ internal / external |
| B6 | Economic intent ("contributor" / "speculator") | ❌ a label, not a field |
| B7 | Identity & enforcement (one-account rule, KYC, Security Circles, PiVerify) | ❌ account/identity level |

## Commands

| Command | Measures |
|---|---|
| `node behavior.mjs --network mainnet` | B1 + B3 (Horizon REST) |
| `node behavior.mjs --network testnet-events` | B2 (Soroban JSON-RPC) |
| `node behavior.mjs --claims` | Prints the full claim audit |
| `node said-vs-done.mjs` | Re-measures the "Said vs Done" facts (both networks) |
| `node test/run.mjs` | Offline test suite (no network) |

## The master boundary

> **Behavior belongs to an account (or an app), never to a coin.** The ledger records what
> happened; it never stamps a unit with a history.

## Related repositories

- [`pi-fungibility`](https://github.com/aybvip/pi-fungibility) — the native asset carries no
  per-unit origin.
- [`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply) — fixed `totalCoins`, no issuance.
- [`pi-soroban-events`](https://github.com/aybvip/pi-soroban-events) — reading contract events
  honestly (retention, truncation, exclusive `endLedger`).

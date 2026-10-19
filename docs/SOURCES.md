# Sources

Every source used in this repository, with its status. We separate **official** from **RFC (design
intent)** from **external (unofficial)** on purpose.

## Official — Pi Network

| # | Source | Used for | Status |
|---|---|---|---|
| S1 | `https://api.mainnet.minepi.com` (Horizon REST) | B1 operation histogram, B3 ledger header (`total_coins`, `fee_pool`) | **Official** — protocol 28, network passphrase `Pi Network` |
| S2 | `https://rpc.testnet.minepi.com` (Soroban JSON-RPC) | B2 event-topic vocabulary (`getEvents`, `xdrFormat: "json"`) | **Official** — network passphrase `Pi Testnet`, protocol 28, retention 120,960 ledgers |
| S3 | `https://minepi.com/blog/launchpad-update-flow` (2026-06-11) | Deterministic hold/commit curve; engagement reframed as token bonus; IRRA/SLICE Testnet figures | **Official blog post** |
| S4 | `https://minepi.com/pioneer-code-of-conduct` | "Expected / unacceptable behavior" is a *community policy*, not a ledger quantity | **Official policy** |
| S6 | `https://minepi.com/faqs/can-i-mine-from-more-than-one-device-how-does-pi-network-prevent-fake-accounts-bots-etc-from-mining-pi/` | One-account-per-person rule; multi-pronged anti-bot strategy (third-party checks + ML, Security Circles, native KYC) | **Official FAQ** |
| S7 | `https://minepi.com/blog/pi2day2026/` (2026-06-28) | PiVerify (KYC + duplicate detection for third parties); SoloHost; Pi Sign-in; 18M+ KYC verified | **Official blog post** |
| S8 | `https://minepi.com/support/` | "native, decentralized KYC process to identify and verify that the members have only one account" | **Official support page** |
| S9 | `https://minepi.com/roadmap/` | Pi's own banner: roadmap is "no longer being updated or maintained … historical reference only" | **Official — self-declared frozen** |
| S10 | `https://minepi.com/blog/pi-day-2026/` | Pi Day 2026 releases (App Studio on Mainnet, persistent payments) | **Official blog post** |
| S11 | `https://github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md` | `uid` is app-specific; "two apps cannot correlate the same person"; `GET /v2/me`; scopes | **Official developer guide** |
| S12 | `https://docs.minepi.com/api-reference/PlatformAPI` | `/me` returns only consented fields; `uid` changes on revoke; Server API Key rules | **Official API reference** |
| S5 | `https://minepi.com/white-paper/` | Network description (context only) | **Official** |

## Official — RFC (design intent, not final Mainnet spec)

| # | Source | Used for | Status |
|---|---|---|---|
| R1 | `github.com/PiNetwork/PiRC` → `PiRC1/3-participation.md` §3.2 | `Engagement Score` definition; `PiPower`; `PiPower_Baseline` (≥90% lockup, ≥3 years, account before 2026-02-20) | **RFC (proposal)** |
| R2 | `github.com/PiNetwork/PiRC` → `PiRC1/4-allocation/4-allocation design 1.md` | Engagement tiers; ~10% / ~5% / 0% extra tokens; `p_eff/p_list` = 0.909 / 0.952 / 1.000 | **RFC (proposal)** |
| R3 | `github.com/PiNetwork/PiRC` → `PiRC1/ReadMe.md` | Launchpad scope; projects issue tokens for utility | **RFC (proposal)** |
| R4 | `github.com/PiNetwork/SmartContracts` | Contract-facing token interface = scalars only | **Official reference implementation** |

> RFC = Request for Comment. PiRC states the designs are **subject to revision** and that not all
> suggestions are adopted. `PiPower_Baseline` is explicitly **"will be calibrated"**.

## External — unofficial (flagged, never used as a measured claim)

| # | Source | Used for | Status |
|---|---|---|---|
| X1 | Third-party exchange wiki (e.g. `bybit.com/en/wiki`) | Anti-Sybil "behavioral signals" (login frequency, device fingerprints, geographic clustering, referral patterns) | **UNOFFICIAL** — Pi's real features/thresholds are not public |
| X2 | Social posts attributed to `@PiCoreTeam` (counts such as "60M Engaged Pioneers") | Headline engagement counts | **UNOFFICIAL mirror of an official statement** — not a ledger-observable quantity |
| X3 | Community threads claiming multi-account users are "silently marked" | Suggesting an enforcement mechanism | **UNOFFICIAL (community)** — the one-account rule is official; the mechanism detail is not confirmed |

These are included **only** to show how the words "user behavior" circulate, and are always labelled
as external/unverified. See `node behavior.mjs --claims`.

## Measured endpoints (exact)

| Layer | Endpoint | Method |
|---|---|---|
| B1 | `GET /transactions?limit=…&order=desc&include_failed=false`, then each tx's `operations` link | read-only |
| B3 | `GET /ledgers?limit=1&order=desc` | read-only |
| B2 | `POST` `getHealth`, `getNetwork`, `getEvents` (`xdrFormat: "json"`) | read-only |

## What is deliberately **not** a source

- Any price feed, exchange ticker, or valuation.
- Any claim about a specific user's identity, intent, or quality.
- Any reproduction of Pi's internal Engagement Score or Sybil heuristics (not public).

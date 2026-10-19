# Verification

This repository is designed so that every **Measured** claim can be reproduced by anyone with
Node.js ≥ 20. No API keys, no accounts, no writes.

## 0. Requirements

```bash
node --version   # expect v20 or newer (built-in fetch)
```

No `npm install` is required — there are **zero** runtime dependencies.

## 1. Offline tests (no network)

```bash
node test/run.mjs
```

Expected: all test files pass, `fail: 0`. These cover the pure helpers
(`horizonHref`, `classifyOperation`, `eventTopicNames`) and the **claim-table integrity** —
including the assertion that **no Measured claim asserts an on-chain behavior score exists**.

## 2. Reproduce B1 + B3 (Mainnet ledger behavior)

```bash
node behavior.mjs --network mainnet
```

Expected shape:

- `latest : ledger <N>`
- `total_coins: 100000000000.0000000` (a single scalar native supply)
- an observed operation-type histogram, and a `behavior-verdict` block stating which
  contract/claim-style operations were **observed** or **not observed in window**.

> **Honesty note:** absence in a window is a **window-local** result. The tool prints the window;
> widen `txPages`/`txPerPage` to extend the claim.

## 3. Reproduce B2 (Testnet contract events)

```bash
node behavior.mjs --network testnet-events
```

Expected shape:

- `network : Pi Testnet   protocol: 28`
- `retention: 120960 ledgers`
- an observed event-topic vocabulary dominated by `transfer` and `fee`, plus token-symbol topics
  (e.g. `USDT:…`, `OUSD:…`) and `escrow_*` topics.
- `engagement/claim-ish topics : NOT OBSERVED in window`

The tool sends `endLedger = latest - c*span` (exclusive) and reports **lower bounds** when it hits
the measured 100-event page cap.

## 4. Print the claim audit

```bash
node behavior.mjs --claims
```

Each claim prints its **bucket** (measured / documented / external / not-claimed), a **detail**, a
**source**, and a **status**. External claims are always labelled unofficial.

## 5. What you should *not* be able to reproduce

- An on-chain `Engagement Score` field or event. (It is app-side, B4.)
- A per-unit "behavior" or "origin" tag on native π. (It does not exist.)
- Pi's internal Sybil detection. (Not public, B5.)

If any of these ever becomes reproducible, this repo should be updated — with the measurement.

## 6. Boundary and scope

- Read-only: only `GET` / read-only `POST` (JSON-RPC reads). Nothing is signed or submitted.
- Unofficial: not affiliated with Pi Network.
- No claim about price, identity, intent, or reserves.

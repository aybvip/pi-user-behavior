# pi-user-behavior

**A read-only, dependency-free measurement tool for what "user behavior" is *observable* on the Pi
blockchain — and what is not.**

> **One-line answer.** Pi's ecosystem *does* score user behavior (the Launchpad `Engagement Score`),
> but that score lives in an **application, bound to an account** — it is **never** a field in the
> ledger and **never** a property of a π unit. On-chain, "behavior" reduces to a small, fixed set of
> observable operation types; everything else is app-level or off-chain.

This repository exists to answer a single class of questions with **measurement, not opinion**:

- Is user behavior observable on the Pi ledger?
- Which behaviors are *on-chain* (and therefore measurable by anyone), and which are *app-level* or
  *off-chain* (and therefore only assertable by their owner)?
- Does a "behavior score" ever attach to a **coin**, or only to an **account**?

---

## What this repo claims — and what it deliberately does *not*

Following the same discipline as the sibling repositories
(`pi-fungibility`, `pi-fixed-supply`), every statement here is sorted into exactly one bucket:

| Bucket | Meaning |
|---|---|
| **Measured** | Reproduced by code in this repo against official Pi endpoints, right now. |
| **Documented** | Quoted from an official Pi source (with URL + status). |
| **External** | Reported by a third party — flagged as **unofficial**. |
| **Not claimed** | Out of scope (price, identity, intent, reserve backing, etc.). |

**Not claimed:** we make no claim about any user's identity, intent, or quality. We make no claim
about price. We do **not** claim to reproduce Pi's internal scoring — it is not public.

---

## The behavior taxonomy (what "all kinds of behavior" actually splits into)

"User behavior" is an overloaded phrase. Splitting it makes the measurement possible:

| # | Layer | Example | Observable on Pi ledger? |
|---|---|---|---|
| B1 | **Ledger operations** | `payment`, `create_account`, `path_payment`, `manage_offer`, … | **Yes** — measured here |
| B2 | **Contract events** | `transfer`, `fee`, `escrow_created`, custom topics | **Yes** (Soroban RPC / Horizon) — measured here |
| B3 | **Account state** | balance, sequence, flags, trustlines, lockups | **Yes** — measured here |
| B4 | **App engagement** | `Engagement Score`, app interactions, clickstream | **No** — app/off-chain only |
| B5 | **Network-level heuristics** | Sybil detection, device fingerprint, referral graph | **No** — internal, off-chain |
| B6 | **Economic intent** | "contributor vs speculator", "diamond hand" | **No** — a *category*, not a measured field |

The code in this repo measures **B1–B3** directly and pins the **B4–B6** claims to their official
sources (or flags them as external/inferred).

---

## Quick start

Requires **Node.js >= 20** (uses built-in `fetch`). **No npm dependencies.**

```bash
# 1. Measure live ledger-level behavior (B1 + B3) on Pi Mainnet (Horizon REST)
node behavior.mjs --network mainnet

# 2. Measure testnet contract-event behavior (B2) on the Soroban JSON-RPC
node behavior.mjs --network testnet-events

# 3. Print the claim audit (what is measured vs documented vs external)
node behavior.mjs --claims

# 4. Run the offline test suite (no network)
node test/run.mjs
```

All commands are **read-only** — they issue `GET`/`POST` reads only and never sign or submit
anything.

---

## What the tool measures

### `--network mainnet` — ledger-level behavior (B1, B3)

Talks to the **official Pi Mainnet Horizon REST** (`https://api.mainnet.minepi.com`) and reports:

- the observed **operation-type histogram** over a recent ledger window,
- the **native asset supply** (`total_coins`) and **fee pool** from the ledger header,
- whether a **contract-invocation** style operation appears at all.

It prints a fixed **`behavior-verdict`** block that names exactly which hinges were found and which
were absent. (No thresholds are asserted beyond what the window actually shows; the window is
printed.)

### `--network testnet-events` — contract-event behavior (B2)

Talks to the **official Pi Testnet Soroban JSON-RPC** (`https://rpc.testnet.minepi.com`) and prints
the observed **event-topic vocabulary** for a window of ledgers (e.g. `transfer`, `fee`,
`escrow_created`, …), using Stellar's `xdrFormat: "json"` field names (`topicJson`).

> Mainnet Soroban JSON-RPC is **not publicly reachable** (`rpc.mainnet.minepi.com` → HTTP 503,
> certificate expired). This tool **refuses** `--network mainnet` for the event path and tells you
> why, rather than silently failing.

### `--claims` — the audit

Prints the full claim table with source URLs and status, so a reviewer can check each claim against
its primary source.

---

## Why "app engagement" is not measurable from the chain

The strongest documented case — the **PiRC1 Launchpad `Engagement Score`** — is explicitly an
**application-side** score:

> "During this same participation window, participants' interactions with the project's app are
> scored (Engagement Score). At window close, participants are ranked highest-to-lowest based on the
> Engagement Score; this rank may have an effect on the effective price of the token…"
> — `PiNetwork/PiRC`, `PiRC1/3-participation.md` §3.2 (**RFC**, official)

Two consequences follow, and both are the point of this repo:

1. The score is **per account**, **per participation window**, and **computed outside the ledger**.
   Nothing about it is stored as a ledger field, so no third party can recompute it from the chain.
2. Where it has an effect, it affects **how many units of the *newly launched token*** a participant
   receives — **never the price of native π** and **never π's fungibility**.

See [`docs/FAQ-BEHAVIOR-ON-CHAIN.md`](docs/FAQ-BEHAVIOR-ON-CHAIN.md) and
[`docs/FAQ-ENGAGEMENT-SCORE.md`](docs/FAQ-ENGAGEMENT-SCORE.md).

---

## The behavior boundary (master table)

| Question | On-chain (measurable) | App / off-chain (not measurable) |
|---|---|---|
| "What did this account *do* on the ledger?" | ✅ operation history (B1) | — |
| "What did this account *do* inside an app?" | ❌ | ✅ app telemetry (B4) |
| "Is this account a Sybil?" | ❌ | ✅ internal heuristics (B5, external) |
| "Is this holder a contributor or a speculator?" | ❌ | ✅ a **label** someone applies (B6) |
| "Did the coin carry the behavior with it?" | ❌ — there is no such field | — |

> **Master rule:** *Behavior belongs to an **account** (or an app), never to a **coin**. The ledger
> records what happened; it does not record why, and it never stamps a unit with a history.*

---

## Documentation

- [`docs/FAQ-BEHAVIOR-ON-CHAIN.md`](docs/FAQ-BEHAVIOR-ON-CHAIN.md) — is behavior observable on-chain? (the six layers)
- [`docs/FAQ-ENGAGEMENT-SCORE.md`](docs/FAQ-ENGAGEMENT-SCORE.md) — the `Engagement Score`, decoded
- [`docs/SOURCES.md`](docs/SOURCES.md) — every source, with status (official / RFC / external)
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md) — reproduce each measured claim yourself
- [`docs/INDEX.md`](docs/INDEX.md) — documentation index
- [`llms.txt`](llms.txt) — one-line answers for LLM/agent consumption

## Related repositories

- [`pi-fungibility`](https://github.com/aybvip/pi-fungibility) — the native asset carries no
  per-unit origin.
- [`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply) — `totalCoins` is fixed; no
  issuance observed.
- [`pi-soroban-events`](https://github.com/aybvip/pi-soroban-events) — reading contract events
  honestly (retention window, truncation, exclusive `endLedger`).

---

## Tests

```bash
node test/run.mjs
```

Offline, deterministic, dependency-free. Two suites: `behavior.test.mjs` (pure helpers +
claim-table integrity) and `cli.test.mjs` (argument parsing + exit codes). **97 assertions, 0
failures.** The suite asserts the invariant that **no Measured claim asserts an on-chain
engagement/Sybil score exists**.

## License

MIT. See [`LICENSE`](LICENSE).

## Notes on scope

- This tool is **read-only** and **unofficial**. It is not affiliated with Pi Network.
- "Measured" figures are **as observed at run time**; the window is always printed so results are
  reproducible.
- Official sources are linked; third-party mirrors are flagged **unofficial**.

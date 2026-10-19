# FAQ — Is "user behavior" observable on the Pi blockchain?

> **Objection / question:** *"People keep talking about user behavior in Pi. Can you measure it?
> Can you tell a contributor from a speculator from the chain?"*
>
> **Short answer:** **Partly.** Behavior splits into six layers. Three of them (ledger operations,
> contract events, account/ledger state) are **on-chain and measurable by anyone**. The other three
> (app engagement, network-level Sybil heuristics, and economic *labels* like
> contributor-vs-speculator) are **not on-chain** — they live inside applications or inside Pi's
> internal systems, and are **never** carried by a coin.

This is the honest boundary. Saying "behavior is on-chain" without splitting the layers is what
creates confusion.

---

## The six layers

| # | Layer | Example | On-chain? | How you verify it |
|---|---|---|---|---|
| **B1** | Ledger operations | `payment`, `create_account`, `manage_offer`, `path_payment` | ✅ **Yes** | Horizon REST (`/transactions`, `/operations`) |
| **B2** | Contract events | `transfer`, `fee`, `escrow_created`, custom topics | ✅ **Yes** | Soroban RPC `getEvents` (`xdrFormat: "json"`) |
| **B3** | Account / ledger state | balance, sequence, flags, trustlines, `total_coins` | ✅ **Yes** | Horizon REST (`/accounts`, `/ledgers`) |
| **B4** | App engagement | Launchpad `Engagement Score`, clickstream | ❌ **No** | Only the app owner can see it |
| **B5** | Network-level heuristics | Sybil detection, device fingerprint, referral graph | ❌ **No** | Internal; not public |
| **B6** | Economic intent / label | "contributor", "speculator", "diamond hand" | ❌ **No** | A category *someone applies*, not a field |

Run `node behavior.mjs --claims` to print this table with sources.

---

## 1. What **is** measurable (B1–B3)

These are reproducible **right now** against Pi's official endpoints:

- **B1** — the set of operation types that actually occur. In the windows we measured, Pi Mainnet
  shows ordinary value-moving operations (`payment` and account operations); **no**
  contract-invocation style operation was observed in the window. (This is a *window-local* result,
  not a global claim — the tool prints the window so you can widen it.)
- **B2** — the event-topic vocabulary on Testnet. Rust/Soroban token contracts expose
  `transfer` / `fee`-style topics; we observed **no** per-user `engagement`/`score` topic.
- **B3** — the native asset appears as **one scalar supply figure** (`total_coins`) in the ledger
  header. There is no array of units and no per-unit record.

See [`README.md`](../README.md) for exact commands.

---

## 2. What is **documented** on Pi's side (B4)

The clearest official statement is PiRC1's **Engagement Score**:

> "During this same participation window, participants' interactions with the project's app are
> scored (Engagement Score). At window close, participants are ranked highest-to-lowest based on the
> Engagement Score; this rank may have an effect on the effective price of the token in the
> Allocation Period."
> — `PiNetwork/PiRC`, `PiRC1/3-participation.md` §3.2 (**RFC**, official)

Read carefully: the score is **computed during a participation window**, **inside the app**. Nothing
in this sentence makes it a ledger field. It is **B4**: app-side, per-account, per-window.

And where it has an effect, it affects **the new token** — never native π. See
[`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md).

---

## 3. What is **external / unofficial** (B5)

Third-party articles describe Pi's anti-Sybil systems as analysing *"login frequency, device
fingerprints, geographic clustering, and referral patterns."* That is a **plausible and common**
design — and it is **unofficial**: Pi's actual features, weights, and thresholds are **not public**.
We flag it as **external**, never as measured. (See `--claims`, entry `E1`.)

---

## 4. What is a **category, not a measurement** (B6)

"Contributor vs speculator" is the most common phrase people use. It is important to be exact:

- It is a **label a person (or an app) applies** to an account.
- It is **not** a field on the ledger, and **not** a property of a coin.
- Two people can look at the same account and disagree on the label — which is exactly what makes it
  **not measurable**.

What *is* measurable is the raw behavior underneath: an account's operation history. The leap from
"this account moved value this way" to "this account is a contributor" is an **interpretation**, and
interpretations are not measurements.

---

## 5. The key consequence for coins

> **Behavior belongs to an account (or an app), never to a coin.**

This is the same conclusion as
[`pi-fungibility`](https://github.com/aybvip/pi-fungibility): native π carries no per-unit origin or
history. A behavior score, an engagement rank, or a "contributor" label **cannot travel with a π
unit** — because there is no field on a unit to carry it.

So the answer to *"did the behavior follow the coins?"* is: **there is no such thing for it to
follow.**

---

## 6. Takeaways

1. **Behavior is measurable only where it is recorded** — B1–B3.
2. **App engagement (B4) is real but app-side** — documented in PiRC1, not reproducible from the chain.
3. **Sybil heuristics (B5) are external and internal** — flag as unofficial.
4. **"Contributor vs speculator" (B6) is a label**, not a measurement.
5. **No behavior layer attaches to a coin.** It attaches to accounts.

---

## Sources

- Official RFC: `github.com/PiNetwork/PiRC` → `PiRC1/3-participation.md` (Engagement Tracking)
- Official blog: `minepi.com/blog/launchpad-update-flow` (2026-06-11)
- Official REST: `api.mainnet.minepi.com` — Official RPC: `rpc.testnet.minepi.com`
- External / unofficial: third-party exchange wiki describing anti-Sybil signals (**flagged**)
- Related: [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md) ·
  [`README.md`](../README.md) · [`docs/INDEX.md`](INDEX.md)

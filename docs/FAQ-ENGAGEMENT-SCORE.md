# FAQ — What is the `Engagement Score`, and is it on the blockchain?

> **Objection / question:** *"Pi scores how engaged users are. So Pi *does* measure user behavior —
> and maybe that score is attached to everything."*
>
> **Short answer:** Pi's Launchpad design **does** score engagement — that part is real and official.
> But the score is **app-side, per-account, and per participation window**. It is **not** a ledger
> field, it is **not** attached to π units, and where it has an effect it changes **only the newly
> launched token** — never the price or fungibility of native π.

---

## 1. What the official source says

From Pi Network's own RFC, `PiRC1/3-participation.md` §3.2 *Engagement Tracking*:

> "During this same participation window, participants' interactions with the project's app are
> scored (Engagement Score). At window close, participants are ranked highest-to-lowest based on the
> Engagement Score; this rank may have an effect on the effective price of the token in the
> Allocation Period."

Four properties are stated or implied, and all four matter:

| Property | Value | Why it matters |
|---|---|---|
| **Where** | "the project's app" | Computed by the app, not by the ledger. |
| **When** | "during this same participation window" | Per-window, not permanent. |
| **Scope** | per participant (an account) | Bound to an **account**, not to coins. |
| **Effect** | "the effective price of the token" | The **new token**, not native π. |

---

## 2. What the score changes (design 1, official)

From `PiRC1/4-allocation/4-allocation design 1.md` (RFC):

- `T_engage = 5%·T` of the launched token's supply is reserved for engagement.
- Participants are ranked and split into thirds:
  - **Top 1/3** receive `2/3` of `T_engage` → ~**10% more tokens**
  - **Middle 1/3** receive `1/3` of `T_engage` → ~**5% more tokens**
  - **Bottom 1/3** receive **0**
- Effective price ratio: `p_eff / p_list` = **0.909 / 0.952 / 1.000**.

**Every number here is about *the new token*.** None of it re-prices π.

---

## 3. Is the score observable on-chain?

**No.** We measured this directly (`node behavior.mjs --network testnet-events`): the observed
event-topic vocabulary on Testnet is `transfer` / `fee`-style, and we observed **no** per-user
`engagement`/`score` topic in the measured window. The score is computed in the app and used by the
Launchpad logic; it is not written as a ledger field a third party can read back.

This is consistent with the RFC's own wording — "the project's app", "during this participation
window" — which places the computation outside the ledger.

---

## 4. What Pi changed later (official, 2026-06-11)

Pi's Launchpad update blog post is important for honesty, because it moves **away** from dynamic
behavior:

> "Instead of being fully dynamic based on participant behavior, the ratio between the hold and
> commit follows a deterministic curve."

And it reframes the reward:

- engagement benefits become a **percentage bonus on the tokens a Pioneer receives** (not a
  discount on the token price);
- the mechanism is renamed the **"fair-access hold"** (previously stake / PiPower);
- the hold is **the Pioneer's own Pi and is returned** after the hold duration — it is not a
  purchase of the project's token.

So the trend is toward **deterministic, simpler rules** — not toward scoring users more.

---

## 5. What it does **not** establish

| Tempting conclusion | Verdict |
|---|---|
| "So π has a behavior score on-chain." | **No** — the score is app-side (B4). |
| "So engaged π is worth more than other π." | **No** — the bonus is in the *new token*; π stays fungible. |
| "So my score follows my coins if I send them." | **No** — a score attaches to an **account**, not to a unit. |
| "So the Launchpad measures *everything* about me." | **Not claimed.** We only report what the official design states. |

---

## 6. Testnet status (read this before quoting numbers)

- PiRC1 is a **Request for Comment** — design intent, subject to revision; `PiPower_Baseline` is
  stated as **"will be calibrated"**.
- The first test launch (IRRA) was on **Testnet**: **~478,000** participants staked **36.05M
  Test-Pi**, committed **14.72M Test-Pi**, with **11.71M** applied toward **10M IRRA** tokens.
- The second test token (**SLICE**) is also **Testnet**, and Pi states it **"will never go onto
  Mainnet"**.

Treat the *mechanism* as official design intent and the *numbers* as **provisional and Testnet-only**.

---

## 7. Bottom line

> **The Engagement Score is a real, officially-designed, app-side, account-bound measure. It is not
> on the blockchain, it is not attached to π, and it never changes 1 π = 1 π.**

---

## Sources

- Official RFC: `github.com/PiNetwork/PiRC`
  → `PiRC1/3-participation.md` (Engagement Tracking, PiPower, PiPower_Baseline)
  → `PiRC1/4-allocation/4-allocation design 1.md` (tiers, `p_eff/p_list`)
- Official blog: `minepi.com/blog/launchpad-update-flow` (2026-06-11) — deterministic curve,
  fair-access hold, IRRA/SLICE Testnet figures
- Related: [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) ·
  [`pi-fungibility` FAQ-SOURCE-VS-PRIVILEGES](https://github.com/aybvip/pi-fungibility/blob/main/docs/FAQ-SOURCE-VS-PRIVILEGES.md)

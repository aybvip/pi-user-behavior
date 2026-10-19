# SAID vs DONE — what Pi has *stated* vs what Pi has *shipped*

> **Purpose.** This page puts Pi's **own official words** side by side with the **observable state**
> of the network, so a reader can separate *announced intent* from *shipped reality*. It is written
> in the same discipline as the rest of this repo: every row is either **official-quoted**,
> **measured**, or **not-shipped-as-claimed** — and labelled.

**This page does not accuse, and it does not defend.** It quotes Pi, then measures. Where Pi itself
marks something as provisional (RFC / Testnet / "will be calibrated"), we say so.

---

## How to read each row

| Column | Meaning |
|---|---|
| **Pi said** | A quote or paraphrase from an **official** Pi source, with the date. |
| **Pi did (observed)** | What the network/endpoints show **right now**, or what Pi has published since. |
| **Status** | `shipped` · `testnet-only` · `rfc/provisional` · `stale/self-retired` · `not-observable` |

---

## A. Statements about the *roadmap itself*

### A1. The roadmap that would track promises is officially **frozen**

| Pi said | Pi did (observed) |
|---|---|
| The roadmap page carries Pi's own banner: *"This roadmap is **no longer being updated or maintained** … should be **considered a historical reference only** and **should not be relied upon** for current or future planning."* | The same page still lists "over 20 active projects" with "In Progress" markers and **no dates for the Open Network era**. There is **no maintained public milestone tracker** replacing it. |

**Status: `stale/self-retired`.** This is the single most important honesty fact on the page: Pi
itself says the document people cite as a plan **is not a plan anymore**.

---

## B. Statements about the *chain* (measurable)

### B1. "Mainnet is live" — yes; and it is one native asset

| Pi said | Pi did (observed) |
|---|---|
| Enclosed Mainnet began **December 2021**; the firewall was removed for **Open Network on 2025-02-20**. | Mainnet REST (`api.mainnet.minepi.com`) responds, network passphrase **`Pi Network`**, protocol **28**. Ledger header shows a **single scalar** `total_coins = 100000000000.0000000`. |

**Status: `shipped`.** And it is consistent with
[`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply): the native asset is one scalar.

### B2. "Soroban smart contracts / PiRC" — announced, still **Testnet-first**

| Pi said | Pi did (observed) |
|---|---|
| Pi's blog announced the **first smart contract on Testnet** (subscriptions), with *"a way to evaluate the contract before rollout to the Mainnet"*. PiRC1/PiRC2 are **RFCs**. | **Measured:** in a window of ~150 recent Mainnet transactions there were **zero `invoke_host_function`** operations and **zero issued assets** (`/assets` → 0 records). Testnet JSON-RPC is active (protocol 28, retention 120,960 ledgers) with a live contract-event vocabulary. |

**Status: `testnet-only`** at the time of measurement. The capability is real — on **Testnet**.

### B3. "Ecosystem tokens / Launchpad" — real, but Testnet and explicitly never-Mainnet for the test tokens

| Pi said | Pi did (observed) |
|---|---|
| PiRC1 designs the Launchpad; the first test token (**IRRA**) ran on Pi Day 2026; the second (**SLICE**) is *"only on Testnet and **will never go onto Mainnet**"*. | Measured Testnet events include `IRRA:GAAA…` and `SLICE:GAAA…` token topics, alongside `OUSD`/`USDT` and `escrow_*` topics. On **Mainnet**, `/assets` returns **0** issued assets. |

**Status: `testnet-only`.** The tokens exist and move — on Testnet, as Pi itself states.

### B4. "Behavior is scored" — stated for the app layer, not the chain

| Pi said | Pi did (observed) |
|---|---|
| PiRC1 §3.2: *"participants' interactions with the project's app are scored (Engagement Score)"*. Pi's 2026-06-11 update: *"Instead of being fully dynamic based on participant behavior, the ratio … follows a **deterministic curve**."* | Measured: **no** per-user `engagement`/`score` event topic appears in the Testnet event vocabulary. The score is app-side. |

**Status: `rfc/provisional` + `not-observable`.** Officially designed; not on the ledger. See
[`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md).

---

## C. Statements about *identity / enforcement*

### C1. "One account per person" — official, enforced off-chain

| Pi said | Pi did (observed) |
|---|---|
| *"Pioneers are only allowed **one Pi account per person**."* Enforcement is a **"multi-pronged strategy"**: third-party checks + ML, **Security Circles**, native **KYC**. *"only accounts validated as belonging to distinct real individuals will be honored on the Mainnet blockchain."* | **Not observable on-chain** — by design. The enforcement lever is the **account/identity**, and Pi states the checks are *"usually invisible"*. |

**Status: `shipped as policy` / `not-observable`.** See [`FAQ-BEYOND-RPC.md`](FAQ-BEYOND-RPC.md).

### C2. "PiVerify" — announced Pi2Day 2026, a product for third parties

| Pi said | Pi did (observed) |
|---|---|
| Pi2Day 2026 (2026-06-28) released **PiVerify**, making KYC available to external clients, including **"duplicate detection"**; *"over 18+ million Pioneers"* verified via *"AI + human KYC"*. | Official product page exists (`piverify.minepi.com`). The **counts and detection rates are official statements, not ledger-observable**. |

**Status: `shipped (product)` / counts `not-observable`.**

### C3. The **Code of Conduct** — behavior is governed by policy, not ledger state

| Pi said | Pi did (observed) |
|---|---|
| The Code of Conduct lists **account-level** consequences: *"temporary ban or permanent suspension of accounts … removal of privileges from, or adding restrictions to, accounts."* | No corresponding **ledger** field exists on an account or a coin. Enforcement is off-chain. |

**Status: `shipped as policy` / `not-observable on-chain`.**

### C4. **Pi Social Profiles** — an official profile per Pioneer, readable only by Pi

| Pi said | Pi did (observed) |
|---|---|
| Pi2Day 2024 released **Pi Social Profiles**: *"an open social identity"* with a **profile picture**, **followers**, **presence**, and *"your activities on various Pi apps"*, with **privacy controls**; *"over **3.36 million** Pioneers"'* had set one up. Pi **Badges** (2026-02-26) then used concrete activity milestones — **365 mined days**, **2,000+ hours in Pi Chats**, **50+ Pi apps explored** *(Dec 2024 – Dec 2025)* — displayed on Chats / Forum / **Profiles**. | The profile lives **inside the Pi Browser**. The official developer object — `UserDTO` — has **only** `uid`, `credentials.scopes`, `username?`: **no** picture, followers, badges, or activity fields. There is **no developer endpoint** for a profile, and no `profile`/`badge`/`engagement` topic appears in the measured Mainnet operation window or the Testnet event vocabulary. |

**Status: `shipped (product)` / `not-observable on-chain` and `not-readable by third parties`.** This is
the clearest instance of layer **B6**: a large, officially-tracked social object that is entirely
**off-chain and owner-held**. See [`FAQ-PI-BROWSER-PROFILE.md`](FAQ-PI-BROWSER-PROFILE.md).

---

## D. Numbers Pi states that we **cannot** verify from the chain

These are **official statements**. We list them as such — and mark them **not ledger-observable**.
We do **not** call them true or false; we call them **unverifiable from public on-chain data**.

| Pi statement (official) | Why it is not on-chain-verifiable |
|---|---|
| "60M+ Engaged Pioneers" | "Engaged" is an app/off-chain definition; the ledger has no such counter |
| "18M+ KYC-verified Pioneers" | KYC identity data is private by necessity |
| "420,000+ Pioneer-operated Nodes" | Node registrations are not a ledger field |
| Migration waves ("8/9 checklist", "next wave") | Migration scheduling is app-side |
| Protocol upgrade dates (e.g. "Protocol 27 complete, 28 set") | Upgrade announcements are blog/news; the header shows a **protocol version number** (currently 28) but not the process narrative |

**Status: `not-observable`.** Marked honestly, not judged.

---

## E. The pattern this page demonstrates

1. **Pi is candid about status when it wants to be.** It labels RFC vs shipped, Testnet vs Mainnet,
   and *itself* retires the old roadmap. That is a **positive** honesty signal.
2. **The gap is not "lied vs truth" — it is "announced vs shipped."** Most gaps are **timing and
   environment** (Testnet vs Mainnet), not contradiction.
3. **The measurable chain is narrow and stable.** Native π = one scalar fixed supply; contracts and
   tokens live on **Testnet**; behaviour scoring lives in **apps**; enforcement lives in
   **identity**. None of it is a per-unit property of π.

> **Master rule (unchanged):** what is on the chain is **one native asset and ordinary value-moving
> operations**. Everything else is either **Testnet**, **app-side**, or **off-chain** — and Pi's own
> documents mostly say exactly that.

---

## F. How to re-measure this page

Everything in section **B** is reproduced by:

```bash
node behavior.mjs --network mainnet        # B1/B3: native supply, operation types
node behavior.mjs --network testnet-events # B2: contract-event vocabulary
```

Sections **A/C/D** quote official sources; see [`SOURCES.md`](SOURCES.md). If Pi ships Mainnet
contracts or a maintained roadmap, **this page should be updated with the new measurement.**

---

## Sources

- Official roadmap (self-declared frozen): `minepi.com/roadmap/`
- Official blog: `minepi.com/blog/launchpad-update-flow` (2026-06-11), `minepi.com/blog/pi2day2026/` (2026-06-28)
- Official FAQ: `minepi.com/faqs/can-i-mine-from-more-than-one-device-…`
- Official policy: `minepi.com/pioneer-code-of-conduct`
- Official RFC: `github.com/PiNetwork/PiRC` → `PiRC1/*`
- Measured endpoints: `api.mainnet.minepi.com` · `rpc.testnet.minepi.com`
- Related: [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) ·
  [`FAQ-BEYOND-RPC.md`](FAQ-BEYOND-RPC.md) ·
  [`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply)

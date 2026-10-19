# FAQ — Behavior *beyond* the RPC: multi-accounting, Sybil detection, social media, and the Code of Conduct

> **Objection / question:** *"You only measure the RPC. But real behavior isn't on-chain: how does
> Pi follow the community on social media, how does it catch cheaters running two accounts from one
> phone, or many Telegram/X accounts? Someone can just use two phones — how does Pi even know an
> account ID, let alone find a cheater?"*
>
> **Short answer:** This is the right question, and it is the one place where **measurement stops and
> enforcement begins**. Pi's own FAQ answers it directly: the **one-account-per-person rule** is
> enforced by a **multi-pronged strategy** — third-party checks + native ML, **Security Circles**, and
> **native KYC** — and only **KYC-validated distinct real individuals** are honoured on Mainnet. None
> of that enforcement is a ledger field; it is **B7: off-chain identity & enforcement**.

This page is the honest boundary: what is *documented*, what is *external*, and what is **simply not
public**.

---

## 1. The layers again — and where enforcement lives

| # | Layer | On-chain? | Where the answer comes from |
|---|---|---|---|
| B1 | Ledger operations | ✅ measured | Horizon REST |
| B2 | Contract events | ✅ measured | Soroban RPC |
| B3 | Account / ledger state | ✅ measured | Horizon REST |
| B4 | App engagement (`Engagement Score`) | ❌ | app-side (PiRC1) |
| B5 | Network-level heuristics (Sybil, device, referral) | ❌ | internal — *described*, not public |
| B6 | Economic intent ("contributor" / "speculator") | ❌ | a label, not a field |
| **B7** | **Off-chain identity & enforcement** | ❌ | official FAQ, KYC, Code of Conduct |

**Key point:** multi-account detection is **B5 + B7**. It is real, it is official, and it is
**deliberately not reproducible from the chain** — because it is about *people and devices*,
not about coins.

---

## 2. What Pi officially says (quoted, with source)

From the **official Pi FAQ**
(*"Can I mine from more than one device? How does Pi Network prevent fake accounts, bots, etc.?"*):

> "No, you cannot mine from more than one device. **Pioneers are only allowed one Pi account per
> person.**"

> "Pi uses a **multi-pronged strategy** to safeguard against fake accounts and bots. First, the
> network uses a combination of **third party checks (e.g., recaptcha)** and **natively developed
> machine learning algorithms** to identify bots. Such checks are usually invisible to most Pioneers."

> "Second, **Security Circles** … also make it easy to detect fake accounts. Fake accounts will not
> have enough real people pointing at them via Security Circles. At best, fake accounts would be
> pointing at each other with very few incoming pointers from the rest of the network. **This anomaly
> is easy to detect with computer algorithms.**"

> "Third, Pi's **native, decentralized KYC** solution helps validate the identity of Pioneers before
> they are eligible to migrate their mined mobile Pi balance onto the Mainnet blockchain. In other
> words, **only accounts validated as belonging to distinct real individuals will be honored on the
> Mainnet blockchain.** … bot owners will not be able to prove bots to be real people with real names
> and government-issued identity cards."

So the answer to *"how does Pi even know the account ID?"* is: **it does not need to read it off the
chain** — the identity layer (KYC) and the social graph (Security Circles) are **off-chain inputs**
to the enforcement decision.

---

## 3. Pi2Day 2026 — Pi turned identity into a product (PiVerify)

Pi's own Pi2Day 2026 announcement (2026-06-28) released **PiVerify**, making Pi's real-human
verification available to **third parties**:

> "PiVerify can support identity verification services such as **document checks, liveness
> verification, sanctions and AML screening support, and duplicate detection.**"

> "Pi's AI + human KYC model … has verified **over 18+ million Pioneers across more than 200
> countries and regions**."

Two honest consequences:

1. **Duplicate/fake-account detection is now an explicit product capability** ("duplicate detection"),
   sold to external platforms — not just an internal cleanup.
2. The **counts** (18M+ verified) are **official statements**, not ledger-measurable quantities; we
   flag them as **documented, not measured**.

Pi2Day also shipped **SoloHost** (self-hosted apps / compute on Pis) and **Pi Sign-in** (use a Pi
account to sign in to third-party sites). None of these change the ledger's fungibility; they expand
**identity and compute utility**.

---

## 4. The Code of Conduct — behavior as *policy*, not as a field

The **Pi Community Code of Conduct** defines:

- **Expected behavior** — "Participate in an authentic and active way … Exercise consideration and
  respect … Attempt collaboration before conflict …"
- **Unacceptable behavior** — harassment, threats, doxxing, deliberate intimidation, etc.
- **Consequences** — "up to and including … a temporary ban or permanent suspension of accounts;
  removal of a user, member or moderator; **removal of privileges from, or adding restrictions to,
  accounts**; and removal of content."

**Read this carefully:** these are **account-level** consequences applied by a **policy process**.
They are **not** ledger mechanics. There is no "misconduct" field on an account, and no flag on a
coin. The Code of Conduct governs **who may participate**, not **what a π unit is**.

---

## 5. "I use two phones / several Telegram accounts — how do they know?"

This is the strongest form of the objection, and the honest answer has three parts:

1. **The rule is per person, not per device.** Pi's FAQ says exactly that: *one account per person*.
   Using two devices does not create a second *person*.
2. **The enforcement signal is the social graph and identity, not the device alone.** Security
   Circles (who points at you) and KYC (can you prove a distinct real human) are the two official
   detectors Pi names. A bot farm with no real incoming pointers and no provable identity is the
   *anomaly*.
3. **The exact thresholds and signals are NOT public.** Pi says the checks are "usually invisible" —
   i.e. **deliberately unpublished**. So we do **not** claim to know the method; we quote what Pi
   states and flag everything else as **external / unverified**.

> **Not claimed:** we do not know the weights, the ML features, the device fingerprints, or the
> detection rate. Those are internal. Anyone who tells you the exact mechanism is speculating.

---

## 6. Social media specifically

Pi's official channels (X / Facebook / YouTube / Instagram, and the in-app **Pi Social Profiles** and
**Pi Chats**) are where Pi **communicates** and where the community **gathers** — badges from the
Pi2Day Ecosystem Quest are, for example, "accessible in **Pi Chats and Pi Social Profiles**".

But two things are true at once, and both matter:

- Pi **officially engages the community on social platforms** (announcements, quests, ecosystem
  events, the Pi Ecosystem Summit).
- **Social-media behavior is not a ledger input, and not a public scoring system.** There is no
  official "social score" that we could find, and nothing in the ledger records social activity. Any
  claim that Pi "scores you by your tweets" is **not documented** here — we would flag it as
  **external / unverified** if someone asserted it.

So: **community engagement on social media is real; a social-media *score* attached to your coins is
not.**

---

## 7. What this changes for the fungibility question

**Nothing.** This is the crucial link back to
[`pi-fungibility`](https://github.com/aybvip/pi-fungibility):

- Enforcement happens at the **account / identity** layer (B7).
- A coin carries **no** enforcement state and **no** behavior history.
- The consequence Pi applies is to an **account** ("ban / suspend / restrict"), never to a **π unit**.

Even in the strongest enforcement case, the lever is the **account**, not the **coin** — because
there is no per-unit lever to pull.

---

## 8. Takeaways

1. **Multi-account & Sybil defense is official and real** — one account per person, enforced by
   third-party checks + ML, Security Circles, and KYC. **B5 + B7.**
2. **PiVerify (Pi2Day 2026) productised it** — including "duplicate detection" for third parties.
3. **The exact method, thresholds, and features are NOT public** — quote the source, flag the rest.
4. **The Code of Conduct governs participation**, with **account-level** consequences — not ledger
   state.
5. **Social engagement ≠ a score on your coins.** Community building is real; a coin-attached social
   score is not documented.
6. **None of this touches fungibility.** Enforcement targets accounts; coins carry nothing.

---

## Sources

- Official FAQ: `minepi.com/faqs/can-i-mine-from-more-than-one-device-how-does-pi-network-prevent-fake-accounts-bots-etc-from-mining-pi/`
- Official blog: `minepi.com/blog/pi2day2026/` (2026-06-28) — SoloHost, Pi Sign-in, PiVerify
- Official policy: `minepi.com/pioneer-code-of-conduct`
- Official support: `minepi.com/support/` — "native, decentralized KYC process to identify and verify
  that the members have only one account"
- External (flagged): community threads asserting a "silently marking" algorithm (**UNOFFICIAL**)
- Related: [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) ·
  [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md) · [`SOURCES.md`](SOURCES.md)

# FAQ — "Develop this into a Pioneer Contribution Profile" (off-chain evidence layer)

> **Objection / proposal:** *"Don't just read the blockchain. Add the user's consented Pi identity, a
> GitHub evidence collector, an external app-activity database, and on-chain evidence — and turn
> them into a stronger proof of each Pioneer's contribution to the ecosystem."*
>
> **Short answer:** The idea is **mostly sound as a direction**, and this page keeps a record of it.
> But it **cannot become a *global* profile** the way it is usually described, for one decisive,
> measured reason: **Pi's `uid` is app-specific and Pi states that two apps cannot correlate the same
> person.** So a working version is only possible **per app, with consent**, and even then **the
> identity link is never proven** — it is at most *self-declared*.
>
> **This page does not change what this repository is.** `pi-user-behavior` stays a **measurement**
> repo. The *model* form of the proposal lives in a separate repository
> ([`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model)).
> Measurement and people-scoring are kept apart on purpose.

---

## 1. Why this page exists (and why it is only a page)

The proposal is a real question people ask: *"the chain shows money moving, but it can't show who
built the tools."* That is correct, and it is exactly the gap this repository names in
[`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) (layers B4–B7).

But there are two very different responses to that gap:

| Response | What it produces | Where it belongs |
|---|---|---|
| **Measurement** (this repo) | "here is what the chain shows, and what it *cannot* show" | `pi-user-behavior` |
| **A model of an evidence layer** | "here is how one *could* be modelled, with invariants" | `pi-contribution-evidence-model` |

Folding the second into the first is how a measurement repo quietly becomes a **scoring system**.
This repository refuses that, and says so here.

---

## 2. The proposal, recorded

Preserved so the discussion has a stable reference. Four proposed evidence blocks:

- **A. Profile & Identity** — the Pi identifier the user consented to share; account-link date;
  self-added links to their work.
- **B. Developer Contributions** — GitHub projects, commits, accepted pull requests, fixes, docs,
  tools.
- **C. App Activity Database** — an external DB recording, with consent, real in-app activity
  (completed tasks, service use, useful content/function contributions).
- **D. On-chain Evidence** — Pi transactions, operation timing, payments linkable to documented
  data — **without** treating balance size as evidence of contribution.

Plus the proposal's own good principles:

- An external database does **not** replace the chain; each source proves a different thing.
- Distinguish a link made with consent from proof that all activity under both accounts was the same
  person — *linking does not prove that automatically*.
- Do not reward commit volume; commits can be small or automated.
- Do not treat transaction count as greater contribution.
- Keep it read-only at first, with **no** authority over money or wallets.

These principles are adopted; the *scope* they are applied to is corrected below.

---

## 3. The decisive measured constraint

This is the part that decides what is buildable. Quoted from **official** Pi documentation:

> **`uid`** is **app-specific** and stable per user **for your app**. The same Pi user gets a
> different `uid` in a different app, so **two apps cannot correlate the same person.**
> — Pi Sign-in developer guide (official)

> **`uid`** … An app-local identifier for the user. It is specific to this user and this app. It will
> **change if the user revokes the permissions** they granted to your app.
> — Pi SDK / Platform API reference (official)

> Retrieve the user's information, **including user information limited to what the user has
> consented to share** with your app.
> — Platform API `GET /me` (official)

**Consequences:**

1. **A global profile spanning many apps is not constructible** from Pi platform primitives. It is
   blocked **by design**, not by a missing endpoint.
2. **There is no developer scope for KYC** or real-world identity.
3. **There is no developer scope for other apps' activity.** Each app sees only its own events.
4. Therefore any **Pi ↔ GitHub** link is **not proven by Pi** — it is at most **self-declared**.

See the model repo's [`LINKAGE.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/LINKAGE.md)
for the full argument.

---

## 4. What *is* buildable, honestly

| Form | Possible? | Notes |
|---|---|---|
| Per-**app** profile for **that app's** consenting users | ✅ Yes | uses `Pi.authenticate` + `GET /v2/me`; activity from **its own** events |
| Git evidence attached to a **self-declared** link | ✅ Yes | label it `self-declared`, never `verified` |
| **Cryptographic** link (user signs a challenge) | ⚠️ Technically possible | app-side logic; out of scope for a specification repo |
| **Global** cross-app profile of "the person" | ❌ **No** | defeats Pi's own privacy design |

> **The honest summary:** you can build a profile for **your app's users**; you cannot build one for
> **the person**.

---

## 5. The invariant that answers the "contributor vs speculator" question

The proposal's strongest instinct is right: **do not collapse everything into one number.** A single
score needs a weighted formula, and hiding that formula makes a *judgement* look like a
*measurement*.

So the model reports **four independent axes** and exposes **no** combined score:

- **A** technical contribution · **B** ecosystem utility · **C** in-app activity · **D** evidence
  strength.

And it fixes one subtle mistake up front: **activity is not contribution.** Using an app (C) is not
building one (A). Reporting them separately is what keeps the answer honest — and it is why the
`Engagement Score` discussion in [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md) never turns
into a claim about a person's worth.

---

## 6. Boundaries this repository keeps

Whether or not such a system is ever built:

- **No personal data** lives in this repository. None.
- **No combined contribution score** is produced here.
- **No cross-app correlation** is attempted or endorsed.
- **No claim** about anyone's identity, intent, or quality.
- **No authority** over money or wallets.

If a real evidence service is ever built, it belongs in **its own repository**, with its own storage
threat model, consent policy, and deletion path — not bolted onto a measurement tool.

---

## 7. Verdict

- **The direction is right**: evidence over opinion, many sources, no naive scoring, human review for
  hard cases.
- **The usual "global Pioneer profile" framing is not buildable**, because Pi makes the same person
  unlinkable across apps on purpose.
- **The safe form of the idea is the model form**, holding no data — see
  [`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model).
- **This repository stays a measurement tool.** That separation is the integrity mechanism.

---

## Sources

- Pi Sign-in (official): `github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md`
- Platform API reference (official): `docs.minepi.com/api-reference/PlatformAPI`
- SDK reference (official): `docs.minepi.com/api-reference/SdkReference`
- Full review: [`pi-contribution-evidence-model` → `docs/REVIEW-OF-PROPOSAL.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/REVIEW-OF-PROPOSAL.md)
- Related here: [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) ·
  [`FAQ-BEYOND-RPC.md`](FAQ-BEYOND-RPC.md) · [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md)

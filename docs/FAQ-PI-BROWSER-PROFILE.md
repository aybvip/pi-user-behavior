# FAQ — the Pi Browser **Profile** (Pi Social Profiles): real, official, and *not* measurable

> **Objection:** *"The Pi Browser has a Profile for each Pioneer — picture, username, followers, the
> apps they use. Why don't you measure **that**? The profile is the user's behavior, right there."*
>
> **Short answer:** Yes — Pi Social Profiles are **real and official**, and they are **millions** of
> them. But a Profile is **not a measurement source**. It lives **inside the Pi Browser**, it is
> **readable only by Pi itself**, it stores **no ledger field**, and **no developer API exposes it**.
> In this repo's taxonomy it is a **B6 object** (*social / economic-intent layer*) — the layer this
> repo explicitly says is **off-chain and not measurable from the chain**.

---

## 1. What the Pi Browser Profile *is* (official)

From Pi's own announcement of **Pi Social Profiles** (released on Pi2Day 2024, official blog):

> "Pi Social Profiles allow Pioneers to have an **open social identity** to interact with others and
> **personalize their presence** within the network. This feature enables you to add a **profile
> picture**, **link up with other Pioneers**, and **showcase your activities on various Pi apps**,
> such as Fireside Forum … directly on your profile. Eventually, your profile can also be **linked to
> your other social media profiles**, bridging your Web2 and Web3 individual social presence."

> "The settings of Pi Social Profiles are designed **with privacy in mind**, offering you control over
> the level of sharing you are comfortable with, such as **who can see your full name** and whether
> you want **followers**."

> "So far **over 3.36 million Pioneers** have set up their Pi Social Profiles… To set up your Pi
> Social Profile … go to the **Pi Browser** and tap '**Profiles**'."

So the object the objection points at is genuine: **a profile page, per Pioneer, inside the Pi
Browser**, with privacy controls and social features. And the scale is large (3.36M+ at launch, 2024).

---

## 2. The same thing, stated with *measurable* milestones

Pi later used **profiles/chats/apps activity** as the basis for **Pi Badges** (official blog,
2026-02-26), where the criteria are concrete:

> Badges were awarded to Pioneers who, between **Dec 2024 – Dec 2025**, achieved milestones such as
> **mined for 365 days**, **spent 2,000+ hours in Pi Chats**, or **explored 50+ Pi apps**; badges can
> be displayed *"when engaging on Pi Chats (and Fireside Forum and Pi Social Profiles …)"*.

This is the strongest official evidence that **Pi does measure user behavior across activities**. It
also shows, precisely, **where** that measurement lives — see §3.

---

## 3. Where that measurement lives (and why it is not a chain fact)

Every one of those signals — signup date, mining days, hours in Pi Chats, number of apps explored —
is computed from **Pi's own servers**, then **summarised into a badge** on an **account's profile**.

| Signal | Computed by | Stored on the ledger? | Readable by a third party? |
|---|---|---|---|
| Mining days (365) | Pi servers | ❌ No | ❌ No |
| Hours in Pi Chats | Pi social backend | ❌ No | ❌ No |
| Apps explored (50+) | Pi ecosystem backend | ❌ No | ❌ No |
| Profile picture / username / followers | Pi Browser profile service | ❌ No | ❌ No |
| Badge shown on Chats / Forum / Profile | Pi servers | ❌ No | ❌ No |

**None of it is a ledger field.** Measured today: a Mainnet operation window shows ordinary
value-moving operations only (`payment`, `create_account`, `claim_claimable_balance`, …) with **no**
`invoke_host_function`; the Testnet **event vocabulary** contains no `profile`, `badge`, `followers`,
or `engagement` topic. Reproduce with:

```bash
node behavior.mjs --network mainnet        # operation histogram — no profile/badge ops
node behavior.mjs --network testnet-events # topic vocabulary — no social/engagement topic
```

---

## 4. What the **official developer API** exposes — and what it does not

This is the decisive part. The **Platform API** (`api.minepi.com/v2`, official reference) defines the
entire surface a developer can read about a user. Its user object is:

```jsonc
// UserDTO — official
{
  "uid": "…",                    // "An app-specific user identifier"
  "credentials": {
    "scopes": ["username", "…"], // the scopes actually granted
    "valid_until": { "timestamp": 0, "iso8601": "…" }
  },
  "username?": "…"               // requires the `username` scope
}
```

Compare that to the profile object above. The official `UserDTO` contains **no field at all** for:

- profile picture, full name visibility, or follower graph,
- badges, mining-day counts, chat hours, or apps-explored counts,
- any activity the user performed in **another** Pi app.

**Grants are the only route**, and the granularity is deliberate:

> "Retrieve the user's information, **including user information limited to what the user has
> consented to share** with your app." — `GET /me`, official

And even the *new* capabilities announced **2026-09-04** stay app-scoped:

> "The API returns the user's **effective stake specifically for the requesting app** … giving
> developers access to **app-specific staking information**." — official blog

> "Because the data is stored locally, it **remains associated with a particular account and device**
> rather than automatically following a user across devices." — official blog (local storage)

So: an app sees **its own** slice, never the profile, never another app's view of the same person.

---

## 5. Why this *confirms* the repo's taxonomy rather than contradicting it

Nothing here contradicts the measurement; it **instantiates B6**.

| Layer | What it is | Where the profile sits |
|---|---|---|
| B1 Ledger operations | value-moving operations | — |
| B2 Contract events | `transfer`, `fee`, `escrow_*` | — |
| B3 Account state | balance, sequence, flags | — |
| B4 App engagement | clicks, interactions, **badge criteria** | ← measured by **Pi**, not on the chain |
| B5 Network heuristics | anti-Sybil, device signals | — |
| **B6 Social / economic intent** | **profile, followers, badges, "presence"** | **← the Pi Browser Profile lives here** |
| B7 Identity & enforcement | one-account-per-person, KYC, PiVerify | — |

The profile is the clearest possible proof that **user behavior is a real, large, officially-tracked
object** — *and* that it is **owned, stored, and scored off-chain**, invisible to any measurement tool
and to any other app. Pi says so itself, in its privacy controls and in its `UserDTO`.

---

## 6. What we therefore do **not** claim

- We do **not** claim the profile is on-chain. It is not.
- We do **not** claim a third party can read it. It cannot (no developer scope, no endpoint).
- We do **not** claim 3.36M profiles imply 3.36M *contributors*. A profile is presence, not
  contribution; signup is not work.
- We do **not** claim badges "prove" anything about a coin. They are **account-level**, off-chain.
- We do **not** treat follower counts or presence as economic intent. Intent is a **label (B6)**, not
  a measured field — the same point as [`FAQ-ENGAGEMENT-SCORE.md`](FAQ-ENGAGEMENT-SCORE.md).

> **One-line rule:** *a Profile shows that an account exists and is social; it never shows what a
> **coin** is, and it is never readable as data by anyone except Pi.*

---

## 7. The natural next question

*"Then how would you ever build a contribution profile from profiles + GitHub + activity?"*

That is a real question, and it is answered — with the linkage constraint stated first — in
[`FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md`](FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md). The headline: because
Pi's `uid` is **app-specific**, a **global** profile of *the person* is **not constructible**; only a
**per-app, consented** view is. The same limit that hides the Browser Profile from us is the limit
that hides it from every other app.

---

## Sources

- Pi Social Profiles — official blog: `minepi.com/blog/social-profiles/` (2024-07-26)
- Pi Badges & Ecosystem Tokens — official blog: `minepi.com/blog/badges-ecosystem-token/` (2026-02-26)
- New developer capabilities (local storage, app-specific staking API) — official blog:
  `minepi.com/blog/dev-capabilities-documentation/` (2026-09-04)
- Platform API reference (`UserDTO`, scopes, `GET /me`) — official: `docs.minepi.com/api-reference/PlatformAPI`
- Pi Sign-in guide (app-specific `uid`) — official: `pi-apps/pi-platform-docs` → `pi-sign-in.md`
- Related here: [`FAQ-BEHAVIOR-ON-CHAIN.md`](FAQ-BEHAVIOR-ON-CHAIN.md) ·
  [`FAQ-BEYOND-RPC.md`](FAQ-BEYOND-RPC.md) ·
  [`FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md`](FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md) ·
  [`SAID-VS-DONE.md`](SAID-VS-DONE.md)

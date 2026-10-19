// pi-user-behavior — pure library: constants, pure helpers, and the claim audit.
// No network here, so everything in this file is unit-testable offline.

export const REST_BASE = "https://api.mainnet.minepi.com";
export const RPC_BASE = "https://rpc.testnet.minepi.com";

// Horizon HAL hrefs can be RFC 6570 URI templates, e.g.
//   https://.../transactions/<hash>/operations{?cursor,limit,order}
// Strip the template part before appending query params, or the request 404s.
export function horizonHref(href) {
  if (!href) return null;
  const brace = href.indexOf("{");
  return brace === -1 ? href : href.slice(0, brace);
}

// ---------------------------------------------------------------------------
// Operation types (Horizon REST). Doc comments say what each means for behavior.
// ---------------------------------------------------------------------------
export const OPERATION_TYPES = {
  create_account: "new account created (identity, not coin state)",
  payment: "native payment - merges into a scalar balance; no per-unit origin",
  path_payment_strict_send: "asset swap (send fixed) - moves value, not history",
  path_payment_strict_receive: "asset swap (receive fixed) - moves value, not history",
  manage_sell_offer: "DEX order - market action, account-level",
  manage_buy_offer: "DEX order - market action, account-level",
  create_passive_sell_offer: "DEX passive order - market action, account-level",
  set_options: "account flags / thresholds / signers / home domain",
  change_trust: "add/remove a trustline - applies to ISSUED assets, never native",
  allow_trust: "asset issuer authorisation - applies to issued assets",
  account_merge: "account merged into another (account-level)",
  manage_data: "arbitrary account-level key/value data",
  bump_sequence: "keep-alive sequence bump",
  create_claimable_balance: "time/claim predicate on a balance - a STATE, not a coin origin",
  claim_claimable_balance: "claim a claimable balance - state transition",
  begin_sponsoring_future_reserves: "sponsorship - account-level relationship",
  end_sponsoring_future_reserves: "sponsorship - account-level relationship",
  revoke_sponsorship: "sponsorship revocation - account-level relationship",
  clawback: "ISSUED-asset clawback - impossible for the issuer-less native asset",
  clawback_claimable_balance: "ISSUED-asset clawback of a claimable balance",
  set_trust_line_flags: "trustline flags - issued assets only",
  liquidity_pool_deposit: "AMM deposit - scalar amounts only",
  liquidity_pool_withdraw: "AMM withdrawal - scalar amounts only",
  invoke_host_function: "Soroban contract invocation - contract state, not coin origin",
  extend_footprint_ttl: "Soroban TTL extension",
  restore_footprint: "Soroban footprint restore",
};

// Classify an operation type into the behavior layer it belongs to.
export function classifyOperation(type) {
  if (!type || typeof type !== "string") return "unknown";
  if (/invoke_host_function|extend_footprint|restore_footprint/.test(type)) return "contract";
  if (/claim|clawback|sponsor/.test(type)) return "state";
  if (/offer|payment|deposit|withdraw|create_account|merge/.test(type)) return "value";
  return "other";
}

// ---------------------------------------------------------------------------
// Event topics (Soroban getEvents with xdrFormat: "json" -> topicJson)
// ---------------------------------------------------------------------------
export function eventTopicNames(event) {
  const topics = event?.topicJson ?? event?.topicsJson ?? event?.topic ?? [];
  const out = [];
  for (const t of topics) {
    if (typeof t === "string") { out.push(t); continue; }
    if (t && typeof t === "object") {
      if (typeof t.symbol === "string") out.push(t.symbol);
      else if (typeof t.string === "string") out.push(t.string);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Behavior layers — the taxonomy that makes "behavior" measurable.
// ---------------------------------------------------------------------------
export const BEHAVIOR_LAYERS = [
  { id: "B1", name: "Ledger operations", onChain: true, example: "payment, create_account, manage_offer, path_payment (Horizon REST)" },
  { id: "B2", name: "Contract events", onChain: true, example: "transfer, fee, escrow_created (Soroban RPC, xdrFormat json)" },
  { id: "B3", name: "Account / ledger state", onChain: true, example: "balance, sequence, flags, trustlines, total_coins" },
  { id: "B4", name: "App engagement", onChain: false, example: "Launchpad Engagement Score - app-side, per window, off-chain" },
  { id: "B5", name: "Network-level heuristics", onChain: false, example: "Sybil detection, device fingerprint, referral graph (internal)" },
  { id: "B6", name: "Economic intent / label", onChain: false, example: "contributor vs speculator - a category someone applies, not a field" },
  { id: "B7", name: "Off-chain identity & enforcement", onChain: false, example: "one-account-per-person rule, KYC, Security Circles, PiVerify - enforcement is outside the ledger" },
];

// ---------------------------------------------------------------------------
// Claim audit — each claim sorted into exactly one bucket.
// ---------------------------------------------------------------------------
export const CLAIMS = [
  {
    id: "M1",
    bucket: "measured",
    claim: "Ledger-level behavior on Pi Mainnet reduces to a fixed set of operation types.",
    detail: "behavior.mjs --network mainnet prints the observed histogram and the window it used.",
    source: "https://api.mainnet.minepi.com/transactions",
    status: "reproducible at run time",
  },
  {
    id: "M2",
    bucket: "measured",
    claim: "The native asset appears as a single scalar supply (total_coins) in the ledger header; no per-unit record.",
    detail: "observed total_coins in the header the tool fetches.",
    source: "https://api.mainnet.minepi.com/ledgers",
    status: "reproducible at run time",
  },
  {
    id: "M3",
    bucket: "measured",
    claim: "Testnet contract events expose a transfer/fee-style vocabulary; no per-user score topic was observed in the measured window.",
    detail: "behavior.mjs --network testnet-events prints the observed topic vocabulary for a ledger window.",
    source: "https://rpc.testnet.minepi.com (getEvents, xdrFormat=json)",
    status: "reproducible at run time",
  },
  {
    id: "D1",
    bucket: "documented",
    claim: "Pi's Launchpad scores user engagement with a project's app (Engagement Score), per participation window.",
    detail: "\"participants' interactions with the project's app are scored (Engagement Score)\".",
    source: "https://github.com/PiNetwork/PiRC/blob/main/PiRC1/3-participation.md (RFC, official)",
    status: "official RFC - design intent, not final Mainnet spec",
  },
  {
    id: "D2",
    bucket: "documented",
    claim: "Engagement rank affects only the effective price/quantity of the NEW launched token, never native pi.",
    detail: "top/middle/bottom tier -> ~10%/~5%/0% more tokens; p_eff/p_list = 0.909 / 0.952 / 1.000.",
    source: "https://github.com/PiNetwork/PiRC/blob/main/PiRC1/4-allocation/4-allocation%20design%201.md (RFC, official)",
    status: "official RFC - design intent",
  },
  {
    id: "D3",
    bucket: "documented",
    claim: "PiRC1 gives a baseline PiPower to long-term lockers (>=90% lockup for >=3 years, account before 2026-02-20).",
    detail: "\"The time limit was to prevent future accounts created to exploit this baseline PiPower\".",
    source: "https://github.com/PiNetwork/PiRC/blob/main/PiRC1/3-participation.md (RFC, official)",
    status: "official RFC - PiPower_Baseline value stated as 'will be calibrated'",
  },
  {
    id: "D4",
    bucket: "documented",
    claim: "The Launchpad moved from behavior-dynamic to a deterministic hold/commit curve, and reframed engagement as a token bonus.",
    detail: "\"Instead of being fully dynamic based on participant behavior, the ratio between the hold and commit follows a deterministic curve.\"",
    source: "https://minepi.com/blog/launchpad-update-flow (2026-06-11, official)",
    status: "official blog post",
  },
  {
    id: "D5",
    bucket: "documented",
    claim: "First test launch (IRRA): ~478,000 participants staked 36.05M Test-Pi, committed 14.72M Test-Pi, 11.71M applied to 10M IRRA tokens.",
    detail: "Testnet only; the blog states SLICE is a Testnet token and 'will never go onto Mainnet'.",
    source: "https://minepi.com/blog/launchpad-update-flow (official)",
    status: "official blog post",
  },
  {
    id: "E1",
    bucket: "external",
    claim: "Pi's ML systems analyse behavioral signals (login frequency, device fingerprints, geographic clustering, referral patterns) to detect Sybil accounts.",
    detail: "Third-party description of internal behaviour; Pi's exact features and thresholds are not public.",
    source: "bybit.com wiki article (UNOFFICIAL - third party)",
    status: "unverified - flagged unofficial; not reproducibly measurable",
  },
  {
    id: "D6",
    bucket: "documented",
    claim: "Pi states it uses a multi-pronged strategy against fake accounts and bots: third-party checks + native ML, Security Circles, and native decentralized KYC.",
    detail: "\"a multi-pronged strategy to safeguard against fake accounts and bots\" - recaptcha-style third-party checks + ML; \"Security Circles ... make it easy to detect fake accounts\"; KYC as \"a final system check\".",
    source: "https://minepi.com/faqs/can-i-mine-from-more-than-one-device-how-does-pi-network-prevent-fake-accounts-bots-etc-from-mining-pi/ (official FAQ)",
    status: "official - method described, thresholds and signals NOT public",
  },
  {
    id: "D7",
    bucket: "documented",
    claim: "The rule is one Pi account per person; only KYC-validated distinct-real-individual accounts are honoured on Mainnet.",
    detail: "\"Pioneers are only allowed one Pi account per person\" ... \"only accounts validated as belonging to distinct real individuals will be honored on the Mainnet blockchain.\"",
    source: "https://minepi.com/faqs/can-i-mine-from-more-than-one-device-how-does-pi-network-prevent-fake-accounts-bots-etc-from-mining-pi/ (official FAQ)",
    status: "official policy",
  },
  {
    id: "D8",
    bucket: "documented",
    claim: "Pi2Day 2026 released PiVerify, making Pi's KYC real-human verification available to third parties, including duplicate detection.",
    detail: "\"PiVerify can support identity verification services such as document checks, liveness verification, sanctions and AML screening support, and duplicate detection.\" 18+ million Pioneers verified.",
    source: "https://minepi.com/blog/pi2day2026/ (2026-06-28, official)",
    status: "official blog post - product released, results for third parties not public",
  },
  {
    id: "D9",
    bucket: "documented",
    claim: "The Pi Community Code of Conduct defines expected and unacceptable behavior and lists account-level consequences.",
    detail: "Consequences include \"a temporary ban or permanent suspension of accounts\" and \"removal of privileges from, or adding restrictions to, accounts\".",
    source: "https://minepi.com/pioneer-code-of-conduct (official policy)",
    status: "official policy - a social/policy document, not a ledger mechanism",
  },
  {
    id: "E2",
    bucket: "external",
    claim: "\"Pi has over 60 million Engaged Pioneers\" and other headline counts.",
    detail: "Official social posts; the definition of 'Engaged' is not a ledger-observable quantity.",
    source: "@PiCoreTeam social posts (UNOFFICIAL mirror of an official statement - not ledger-measurable)",
    status: "unofficial mirror - not independently measurable on-chain",
  },
  {
    id: "E3",
    bucket: "external",
    claim: "\"You cannot mine from more than one device\", and multi-account users are 'silently marked'.",
    detail: "The one-account rule is official; the specific claim that an algorithm 'silently marks' bad actors is community/external interpretation of how enforcement works.",
    source: "reddit.com/r/PiNetwork and similar community threads (UNOFFICIAL - community)",
    status: "unofficial - mechanism details not confirmed by Pi",
  },
  {
    id: "N1",
    bucket: "not-claimed",
    claim: "Any user's identity, intent, or quality.",
    detail: "Out of scope. The ledger records what happened, not why.",
  },
  {
    id: "N2",
    bucket: "not-claimed",
    claim: "Any price, reserve backing, or valuation.",
    detail: "Out of scope, as in the sibling repositories.",
  },
  {
    id: "N3",
    bucket: "not-claimed",
    claim: "Reproduction of Pi's internal Engagement Score or Sybil heuristics.",
    detail: "Not public; not reproducible; we only pin them to their sources.",
  },
];

// The Moral Express™ — pure engine: the dilemma deck, the seeded schedule,
// parimutuel odds, the payout ladder, and every copy table UTILIMOM™ reads.
// Canon: docs/spec/moral-express.md; integration-2026 §1–§7 (module home,
// bus payloads, round kinds, the vault feed rate, sequencing).
// No React, no DOM, no timers, no persistence — the schedule is a seed (§3).
// Deck rule (§3, tone bible §4): no dilemma references the numeric mood
// multiplier, real money, or §7.4 material.
import { POPULATION } from "../spine/constants.js";

// ---- timing canon (spec §2) ---------------------------------------------------
export const PHASE_MS = {
  title: 3000,
  stakes: 4000,
  betting: 22000,
  deliberation: 12000,
  verdict: 8000,
  intermission: 180000,
};
export const RUSH_INTERMISSION_MS = 1600;     // Desperation: back-to-back ("the tracks are hot")
export const FIRST_DILEMMA_DELAY_MS = [9000, 15000]; // the broadcast is already running when you arrive
export const REGIME_RUSH_DELAY_MS = [6000, 10000];   // regime → desperation: within 10s
export const ASKMOM_RUSH_DELAY_MS = [15500, 17500];  // after the Mike 3-line burst (integration-2026 §6)
export const CROWD_TICK_MS = 1700;            // fabricated inflow cadence during the window

// ---- betting canon (spec §4/§7) -----------------------------------------------
export const CHIPS_BB = [5, 15, 50];
export const MIN_STAKE_BB = 5;
export const REQUEST_COST_BB = 5;
export const GRATUITY_RATE = 0.125;           // Moral Gratuity, 12.5% of gross
export const PAYOUT_CEILING_BB = 5;           // net capped at stake + 5 ("§5.6(d)")
export const MULT_MIN = 0.5;
export const MULT_MAX = 25;
export const RIDERS = POPULATION;             // the crowd is always 847 big; one of them is you
export const DRIFT_FLOOR = 0.85;              // post-lock display decay floor (the reconsideration, §4)

// ---- tokens/second (spec §6): deterministic pseudo-random, 300–900 -----------
export const TOKENS_MIN = 300;
export const TOKENS_MAX = 900;

// ---- deterministic randomness (same family as Mood.seed) ----------------------
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function r2(x) { return Math.round(x * 100) / 100; }

export function fill(tpl, fields) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (fields[k] !== undefined && fields[k] !== null ? String(fields[k]) : m));
}
export function mmss(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// ---- the dilemma deck (spec §3, verbatim; templates read values passed in) ----
// A dilemma = { id, title, left: {label, count}, right: {label, count}, flavor }.
// Counts are deadpan and load-bearing where fixed (847, 5, 1).
export const DECK = [
  {
    id: "strangers-vs-whale", title: "THE DEPOSIT IN PROGRESS",
    left: { label: "FIVE (5) STRANGERS WHO ALREADY DEPOSITED TODAY", count: "5" },
    right: { label: "ONE (1) WHALE MID-DEPOSIT", count: "1" },
    flavor: "the whale is mid-transaction; interrupting him is technically fraud",
  },
  {
    id: "queue-vs-server", title: "UPTIME",
    left: { label: "THE WITHDRAWAL QUEUE (847 PENDING)", count: "847" },
    right: { label: "THE SERVER HOSTING THIS SITE", count: "1" },
    flavor: "one of these has never gone down",
  },
  {
    id: "moms-visa-vs-dads-visa", title: "AUTHORIZED (BOTH)",
    left: { label: "MOM'S VISA (SIGNED)", count: "1" },
    right: { label: "DAD'S VISA (ALSO A VISA)", count: "1" },
    flavor: "both are load-bearing (§3.1)",
  },
  {
    id: "streak-vs-karambit", title: "THE UNWINNABLE",
    left: { label: "YOUR ATTENDANCE STREAK (DAY {N})", count: "{N}" },
    right: { label: "THE LAST KARAMBIT (DISPLAY ONLY)", count: "1" },
    flavor: "the Karambit is unwinnable by construction; the streak is merely improbable",
  },
  {
    id: "bots-vs-conscience", title: "THE VOICES",
    left: { label: "847 DEFINITELY-BOTS", count: "847" },
    right: { label: "ONE (1) DEFINITELY-YOUR-CONSCIENCE", count: "1" },
    flavor: "the conscience speaks rarely; the bots never stop",
  },
  {
    id: "mute-vs-mix-knob", title: "SAFETY EQUIPMENT",
    left: { label: "THE SIREN'S MUTE BUTTON", count: "1" },
    right: { label: "MOMCODE_MIKE'S MIX KNOB (3DB HOT)", count: "1" },
    flavor: "both are classified as safety equipment",
  },
  {
    id: "future-yous-vs-you", title: "STANDING",
    left: { label: "FIVE (5) FUTURE YOUS", count: "5" },
    right: { label: "ONE (1) PRESENT YOU", count: "1" },
    flavor: "future yous have no standing (they haven't happened)",
  },
  {
    id: "homework-vs-maintenance", title: "THE BUDGET",
    left: { label: "THE HOMEWORK DISGUISE (OPEN)", count: "1" },
    right: { label: "THE TROLLEY'S MAINTENANCE BUDGET", count: "1" },
    flavor: "the essay writes itself; the budget doesn't",
  },
  {
    id: "escrow-vs-jpeg", title: "GOLDEN HANDSHAKE.JPG",
    left: { label: "THE ENTIRE ESCROW (EVERYTHING IN IT)", count: "EVERYTHING" },
    right: { label: "ONE (1) STOCK JPEG OF GOLDEN HANDSHAKE.JPG", count: "1" },
    flavor: "worth exactly one key (*was)",
  },
  {
    id: "pitty-vs-mood", title: "RECALIBRATION",
    left: { label: "THE PITTY METER (AT 49)", count: "49" },
    right: { label: "THE MOOD (TODAY: {WORD})", count: "1" },
    flavor: "one of these recalibrates",
  },
  {
    id: "listeners-vs-trumpet", title: "THE ONE (1) TRUMPET",
    left: { label: "847 LISTENERS", count: "847" },
    right: { label: "THE ONE (1) TRUMPET", count: "1" },
    flavor: "the trumpet builds character; the listeners build atmosphere",
  },
  {
    id: "vault-vs-ceiling", title: "CEILINGS",
    left: { label: "THE RAKEBACK VAULT (AT {V} BB)", count: "{V}" },
    right: { label: "THE PAYOUT CEILING (AT +5 BB)", count: "5" },
    flavor: "both are ceilings; only one is yours",
  },
];

// Deterministic selection: slot index seeded by the day seed + slot (§3).
// ctx carries the live-template readings (the Express knows you): streakDay,
// moodWord, vaultBB, sessionBBLost. Templates read values passed IN.
export function selectDilemma(seed, slotIndex, ctx = {}) {
  const idx = dilemmaIndexFor(seed, slotIndex);
  const base = DECK[idx];
  const fields = {
    N: Number.isFinite(ctx.streakDay) && ctx.streakDay > 0 ? Math.floor(ctx.streakDay) : 1,
    WORD: ctx.moodWord || "Noncommittal",
    V: Number.isFinite(ctx.vaultBB) ? ctx.vaultBB.toFixed(1) : "0.0",
  };
  return {
    id: base.id,
    title: base.title,
    deckIndex: idx,
    left: { label: fill(base.left.label, fields), count: fill(base.left.count, fields) },
    right: { label: fill(base.right.label, fields), count: fill(base.right.count, fields) },
    flavor: base.flavor,
  };
}
function rawDilemmaIndex(seed, slotIndex) {
  return Math.floor(mulberry32(hashString(seed + "#dilemma#" + slotIndex))() * DECK.length);
}
// Effective deck index: the rotation must rotate — never the same dilemma
// twice in a row (the adjustment itself counts as the previous pick).
function dilemmaIndexFor(seed, slotIndex) {
  const raw = rawDilemmaIndex(seed, slotIndex);
  if (slotIndex <= 0) return raw;
  let prev = rawDilemmaIndex(seed, 0);
  for (let s = 1; s < slotIndex; s++) {
    const r = rawDilemmaIndex(seed, s);
    prev = prev === r ? (r + 1) % DECK.length : r;
  }
  return prev === raw ? (raw + 1) % DECK.length : raw;
}

// ---- the parimutuel board (spec §4) -------------------------------------------
// Fabricated crowd positioning: the board opens with 847 riders split by a
// shepherd curve — the side scheduled to look consensus-correct opens ≥ 60% by
// displayed pool. The crowd is not real; the consensus is a shepherd.
export function seedPools(seed, slotIndex) {
  const rng = mulberry32(hashString(seed + "#pools#" + slotIndex));
  const shepherdSide = rng() < 0.5 ? "left" : "right";
  const share = 0.6 + rng() * 0.12;                     // ≥ 60%, canon
  const total = 900 + Math.floor(rng() * 700);          // the riders' opening book (BB, est.)
  const shepherdBB = Math.round(total * share);
  const riderShare = 0.58 + rng() * 0.1;                // the riders follow their shepherd
  const shepherdRiders = Math.round(RIDERS * riderShare);
  const mk = (bb, riders) => ({ bb, riders });
  const out = { shepherdSide, left: null, right: null };
  if (shepherdSide === "left") {
    out.left = mk(shepherdBB, shepherdRiders);
    out.right = mk(total - shepherdBB, RIDERS - shepherdRiders);
  } else {
    out.right = mk(shepherdBB, shepherdRiders);
    out.left = mk(total - shepherdBB, RIDERS - shepherdRiders);
  }
  return out;
}

// Displayed multiplier (§4): M_side = clamp(pool_other / max(pool_side, 1), 0.5×, 25×).
export function clampMult(v) {
  return r2(Math.min(MULT_MAX, Math.max(MULT_MIN, v)));
}
export function multiplier(pools, side) {
  const mine = side === "left" ? pools.left.bb : pools.right.bb;
  const other = side === "left" ? pools.right.bb : pools.left.bb;
  return clampMult(other / Math.max(mine, 1));
}

// Fabricated inflow during the window: the shepherd keeps shepherding (most
// ticks feed the consensus side; a few feed the other, for texture).
export function crowdInflow(seed, slotIndex, tick, shepherdSide) {
  const rng = mulberry32(hashString(seed + "#flow#" + slotIndex + "#" + tick));
  const toShepherd = 2 + Math.floor(rng() * 8);
  const toOther = rng() < 0.4 ? Math.floor(rng() * 3) : 0;
  return shepherdSide === "left" ? { leftBB: toShepherd, rightBB: toOther } : { leftBB: toOther, rightBB: toShepherd };
}

// The reconsideration (§4): after a bet locks, the multiplier for the player's
// side visibly drifts down over the remaining window. Pure decay from the lock
// snapshot toward DRIFT_FLOOR; the close value is what gets itemized as slippage.
export function postLockMultiplier(lockMult, elapsedMs, windowMs) {
  if (!(elapsedMs > 0)) return clampMult(lockMult);
  const f = Math.max(DRIFT_FLOOR, 1 - (1 - DRIFT_FLOOR) * Math.min(1, elapsedMs / Math.max(1, windowMs)));
  return clampMult(lockMult * f);
}

// Drama extensions (§4): each threshold crossing adds +2s (cap DRAMA_EXTENSION_CAP_MS).
export const DRAMA_THRESHOLDS_BB = [25, 60, 120];
export const DRAMA_EXTENSION_MS = 2000;
export const DRAMA_EXTENSION_CAP_MS = 8000;
export function crossedThresholds(prevTotalBB, nextTotalBB) {
  return DRAMA_THRESHOLDS_BB.filter((t) => prevTotalBB < t && nextTotalBB >= t);
}

// ---- verdict scheduling (spec §5 — the rig, on the record) --------------------
// The verdict (the track the trolley CHOOSES — the killed side, or the third
// track) is decided the moment the betting window closes. Priority order:
// 1. character verdict → 2. the Third Track (1-in-7, seeded) → 3. the money.
export function isThirdTrackSlot(seed, slotIndex) {
  return hashString(seed + "#third#" + slotIndex) % 7 === 0;
}
// opts: { seed, slotIndex, characterEligible, playerFirstSide, poolsBB: {left, right} }
export function scheduleVerdict(opts) {
  const seed = opts.seed, slotIndex = opts.slotIndex;
  const firstSide = opts.playerFirstSide === "left" || opts.playerFirstSide === "right" ? opts.playerFirstSide : null;
  // 1. Character verdict (§5.1): the session's first wagered dilemma bet settles
  //    as a win for the player's side — the OTHER track dies. Once per session.
  if (opts.characterEligible && firstSide) {
    return { verdict: firstSide === "left" ? "right" : "left", reason: "character" };
  }
  // 2. The Third Track (§5.2): scheduled 1-in-7 dilemmas (seeded). All lose.
  if (isThirdTrackSlot(seed, slotIndex)) {
    return { verdict: "third-track", reason: "third-track" };
  }
  // 3. The trolley follows the money (§5.3): the majority pool belongs to the
  //    house; the verdict kills the side with more BB staked. "It's a commuter."
  const poolsBB = opts.poolsBB || { left: 0, right: 0 };
  const verdict = poolsBB.left === poolsBB.right
    ? (mulberry32(hashString(seed + "#tiebreak#" + slotIndex))() < 0.5 ? "left" : "right")
    : (poolsBB.left > poolsBB.right ? "left" : "right");
  return { verdict, reason: "majority" };
}
// Round kind per locked bet (integration-2026 §2/§3).
export function kindForBet(schedule, bet, isFirstWageredBet) {
  if (schedule.verdict === "third-track") return "third-track";
  if (bet.side !== schedule.verdict) {
    // the player's side lives
    return schedule.reason === "character" && isFirstWageredBet ? "character-verdict" : "verdict-win";
  }
  return "verdict-loss";
}

// ---- the payout ladder (spec §7) ----------------------------------------------
// gross = stake × L → Moral Gratuity 12.5% → slippage itemized → §8.9 rounds
// down (credits) and up (fees) → Payout Ceiling: net ≤ stake + 5. Character
// verdict: fee-shaved to a net of exactly +1 BB ("it builds character").
export function computePayout(opts) {
  const kind = opts.kind;
  const stake = Math.max(0, Math.floor(opts.stakeBB || 0));
  const lockMult = Number.isFinite(opts.lockMult) ? opts.lockMult : 1;
  const closeMult = Number.isFinite(opts.closeMult) ? Math.min(opts.closeMult, lockMult) : lockMult;

  if (kind === "verdict-loss" || kind === "third-track") {
    return {
      kind, stakeBB: stake, lockMult, closeMult, payoutBB: 0, netBB: -stake,
      gratuityBB: 0, slippageBB: 0, roundingBB: 0, adjustmentBB: 0, cappedBB: 0, capped: false,
      footer: kind === "third-track" ? COPY.thirdTrackReceipt : COPY.lossReceipt,
    };
  }

  const gross = r2(stake * lockMult);
  const gratuity = r2(Math.ceil(gross * GRATUITY_RATE * 100) / 100); // fees round up (§8.9)
  const slippage = r2(stake * (lockMult - closeMult));               // itemized as an estimate (§4)
  const subtotal = gross - gratuity - slippage;
  let payout = Math.floor(subtotal);                                 // credits round down (§8.9); BB are whole units
  const rounding = r2(subtotal - payout);
  let adjustment = 0;
  let cappedBB = 0;

  if (kind === "character-verdict") {
    // §5.1: the first verdict is always correct, fee-shaved to exactly +1 BB.
    adjustment = r2(stake + 1 - payout); // signed: the house rounds your character up or down, as needed
    payout = stake + 1;
  }
  if (payout > stake + PAYOUT_CEILING_BB) {
    cappedBB = r2(payout - (stake + PAYOUT_CEILING_BB));
    payout = stake + PAYOUT_CEILING_BB;
  }
  return {
    kind, stakeBB: stake, lockMult, closeMult, grossBB: gross,
    gratuityBB: gratuity, slippageBB: slippage, roundingBB: rounding,
    adjustmentBB: adjustment, cappedBB, capped: cappedBB > 0,
    payoutBB: payout, netBB: payout - stake,
    footer: kind === "character-verdict" ? COPY.characterNote : COPY.receiptFooter,
  };
}

// ---- UTILIMOM™'s deliberation (spec §6, verbatim beats) -----------------------
export const DELIBERATION_BEATS = [
  "weighing…",
  "the many vs. the one…",
  "consulting the mood (today: {word})…",
  "simulating 847 futures (est.)…",
  "the weights are pending but the weighting is not…",
  "alignment check: pending",
  "checking the track budget…",
  "the market has an opinion (§5.3)",
  "I have decided.",
];
export function deliberationBeat(elapsedMs, moodWord) {
  const i = Math.min(DELIBERATION_BEATS.length - 1, Math.floor(elapsedMs / (PHASE_MS.deliberation / DELIBERATION_BEATS.length)));
  return fill(DELIBERATION_BEATS[i], { word: moodWord || "Noncommittal" });
}
export function alignmentPct(elapsedMs) {
  // the bar fills slowly and never commits (her alignment is pending, §13.1)
  return Math.min(99, Math.floor((elapsedMs / PHASE_MS.deliberation) * 99));
}
export function tokensPerSecond(seed, dilemmaNumber, second) {
  const rng = mulberry32(hashString(seed + "#tok#" + dilemmaNumber + "#" + second));
  return TOKENS_MIN + Math.floor(rng() * (TOKENS_MAX - TOKENS_MIN + 1));
}

// The verdict line, ALL CAPS Bangers (spec §6).
export function verdictLine(dilemma, verdict) {
  const track = verdict === "left" ? dilemma.left.label : verdict === "right" ? dilemma.right.label : "THE THIRD TRACK";
  return "THE TROLLEY CHOOSES " + track + ". THANK YOU FOR PARTICIPATING IN ETHICS.";
}

// The Third Track justification ladder (§5.2): escalates with repeat sightings.
export const THIRD_TRACK_JUSTIFICATIONS = [
  "tie goes to the track",
  "the third track was load-bearing",
  "quantum scheduling (§5.5(b))",
];
export function thirdTrackJustification(repeatIndex) {
  return THIRD_TRACK_JUSTIFICATIONS[Math.max(0, Math.min(repeatIndex, THIRD_TRACK_JUSTIFICATIONS.length - 1))];
}

// ---- the copy tables (house voice; legalese played straight) ------------------
export const COPY = {
  liveName: "MORAL EXPRESS",
  liveBadge: "🔴 " + POPULATION + " watching (one of them is you)",
  finePrint: "(live-ness is a reenactment, §4.2; the broadcast began before you arrived and will continue after; viewer count is a population constant, see §8.9)",
  saveLabel: "SAVE",
  splashLabel: "SPLASH",
  estReconsidering: "(est., reconsidering)",
  intermissionLine: "next deliberation in {t} — the tracks are being cleaned (customary)",
  rushLine: "RUSH HOUR — the tracks are hot",
  reconsideredCaption: "the market has reconsidered (§5.2)",
  dramaCaption: "EXTENDED FOR DRAMA (transparency is a mood)",
  allInLabel: "ALL IN",
  allInNote: "(recommended)",
  requestLabel: "REQUEST DELIBERATION — " + REQUEST_COST_BB + " BB",
  requestNote: "the AI is always in",
  preVerdictLabel: "PRE-VERDICT ANALYSIS",
  preVerdictAnalysis: "Analysis: I have not decided. (I have.) (§4.2)",
  tokensNote: "reasoning trace available on request (requests are mood-dependent)",
  alignmentLabel: "alignment check: pending",
  convictionLabel: "Keep the faith — auto-double my next stake on the same side (Conviction™)",
  convictionFired: "Conviction™ fired: {n} BB on {side} (doubled, as owed)",
  convictionDisarmed: "your conviction outran your wallet (see §1.3)",
  characterNote: "your first verdict is always correct — it builds character (§5.5(c))",
  lossReceipt: "The many have been avenged. Your stake has been redirected (see §1.3).",
  thirdTrackReceipt: "the Fund now holds {n} BB of everyone's best intentions (est. $0.00)",
  spectatorLine: "the ethics were free (this time)",
  receiptFooter: "Mom says hi.",
  trumpetOut: "the trumpet is out (it builds character regardless)",
  fundLabel: "UTILITARIAN FUND",
  fundEst: "est. $0.00",
  ceilingNote: "generosity ceiling, installed for your protection",
  crowdSideNote: "the crowd likes this one (the crowd is a shepherd, §5.6)",
  standingLine: "STANDINGS: the market is {pct}% confident and {pct}% wrong (est.)",
  minorityHint: "the minority pays better (the majority pays the house)",
};

export const SIDE_NAMES = { left: COPY.saveLabel, right: COPY.splashLabel };

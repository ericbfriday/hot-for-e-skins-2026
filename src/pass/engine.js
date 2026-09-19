// Mom's Little Helper™ Pass — pure engine: tier math, XP doctrine, the season
// clock, and the quest tables. No React, no DOM, no persistence, no bus.
// Canon: docs/spec/battle-pass.md; integration-2026 §2/§3/§6/§10.6/§10.13.
// Every loss is progress, and progress is load-bearing (§12.3).

import { GAME_PRICES_BB } from "../spine/constants.js";

// ---- §3 the Mom ladder ---------------------------------------------------------
// Rewards verbatim from the spec table. XP never decays, never resets, and
// cannot be spent — it can only accrue, like regret (§2).
export const TIERS = [
  { key: "BRONZE", xp: 0, reward: "Enrollment (automatic; enrollment is also mandatory)" },
  { key: "SILVER", xp: 150, reward: "-0% fees coupon (stacks with nothing; redeemable always; changes nothing)" },
  { key: "GOLD", xp: 400, reward: "Priority withdrawal queue position: 847 of 847 (priority confirmed)" },
  { key: "PLATINUM", xp: 900, reward: "One (1) exclusive Stock JPEG — Clip Art of a Trophy (participation) — plus the right to skip one (1) ceremony (the right is 0 seconds long)" },
  { key: "DIAMOND", xp: 1800, reward: "DIAMOND MOM status — non-transferable, non-refundable, est. priceless (est. $0.00)" },
];
export const MAX_TIER_IDX = TIERS.length - 1;

export function tierIdxForXp(xp) {
  const v = Number.isFinite(xp) && xp > 0 ? xp : 0;
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (v >= TIERS[i].xp) idx = i;
  return idx;
}
export function tierLabel(idx) { return TIERS[clampIdx(idx)].key + " MOM"; }
function clampIdx(idx) {
  const i = Number.isFinite(idx) ? Math.floor(idx) : 0;
  return Math.max(0, Math.min(MAX_TIER_IDX, i));
}
// Progress within the current bracket, for the panel's tier bar and the tab's
// micro strip. DIAMOND holds at 100 ("keep going (there is nothing after this)").
export function tierPctForXp(xp) {
  const v = Number.isFinite(xp) && xp > 0 ? xp : 0;
  const idx = tierIdxForXp(v);
  if (idx >= MAX_TIER_IDX) return 100;
  const lo = TIERS[idx].xp, hi = TIERS[idx + 1].xp;
  return Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
}
// Pure tier-crossing check — the only thing that mints pass.milestone.
export function tierUpsBetween(beforeXp, afterXp) {
  const from = tierIdxForXp(beforeXp);
  const to = tierIdxForXp(afterXp);
  const ups = [];
  for (let i = from + 1; i <= to; i++) ups.push(TIERS[i].key);
  return ups;
}

// ---- §2 XP — every loss is progress --------------------------------------------
// Win kinds mirror the site's WIN_KINDS (identity.js / chat; integration-2026
// §3): a win is a win for silence purposes AND for 0-XP purposes. The trigger
// is the doctrine: a wagered, non-win settle with netBB < 0 pays |netBB| XP.
// House-sit fills never settle a round (they ride mike.win only) — the
// fill-in's losses are not your curriculum (integration-2026 §10.13), so there
// is nothing to exclude here: exclusion is structural.
export const WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win", "verdict-win", "character-verdict"]);
export function isWinKind(kind) { return WIN_KINDS.has(kind); }

export function xpForSettled(p) {
  if (!p || p.wagered === false) return 0; // free rounds move nothing but feelings
  if (isWinKind(p.kind)) return 0;         // wins grant 0 XP (a win teaches nothing)
  const net = typeof p.netBB === "number" && Number.isFinite(p.netBB) ? p.netBB : 0;
  if (net >= 0) return 0;                  // break-even nibbles pay 0 XP (netBB = 0)
  return Math.floor(-net);                 // 1 XP per BB lost; credits round down (§8.9)
}
// Forfeits count (they're losses, §2) — but the forfeit path fires cross-session
// from a persisted key that predates the pass and carries only {surface,
// reason}, never the stake. The pass pays the surface's canonical round price:
// a forfeit costs the house price of the round (§5.3).
export function xpForForfeit(p) {
  if (!p || typeof p.surface !== "string") return 0;
  const price = GAME_PRICES_BB[p.surface];
  return Number.isFinite(price) && price > 0 ? price : 0;
}

// ---- §5 the season (Season 1 of 1) ----------------------------------------------
// The countdown reads "29d 23h" from the moment the season syncs, and whenever
// it would reach zero it resyncs to the full window ("lunar recalibration,
// §8.9") — the pressure of a deadline that never comes, forever.
export const SEASON_WINDOW_MS = (29 * 24 + 23) * 60 * 60 * 1000; // 29d 23h

export function seasonRemaining(nowTs, syncTs) {
  const now = Number.isFinite(nowTs) ? nowTs : 0;
  const sync = Number.isFinite(syncTs) && syncTs > 0 ? syncTs : now;
  const elapsed = Math.max(0, now - sync);
  if (elapsed < SEASON_WINDOW_MS) return { ms: SEASON_WINDOW_MS - elapsed, resynced: false, resyncTs: sync };
  const cycles = Math.floor(elapsed / SEASON_WINDOW_MS);
  const resyncTs = sync + cycles * SEASON_WINDOW_MS;
  return { ms: SEASON_WINDOW_MS - (now - resyncTs), resynced: true, resyncTs };
}
export function formatCountdown(ms) {
  const v = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const days = Math.floor(v / 86400000);
  const hours = Math.floor((v % 86400000) / 3600000);
  return days + "d " + hours + "h";
}

// ---- the local day key (the mood family's convention; pass-local copy so the
// pass never imports another surface's calendar) ---------------------------------
function pad(n) { return String(n).padStart(2, "0"); }
export function dayKeyFor(ts) {
  const d = new Date(Number.isFinite(ts) ? ts : 0);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
export function freshDaily(day) {
  return { day, quests: DAILY_QUESTS.map((q) => ({ id: q.id, progress: 0, done: false })) };
}
// The daily reset rides every event: a state whose day is not today is a state
// whose quests never happened (the mood family resets at local midnight).
export function ensureDaily(state, day) {
  if (state.daily && state.daily.day === day) return state;
  return { ...state, daily: freshDaily(day) };
}

// ---- §4 quests — drawn from the house's real events -----------------------------
// Dailies reset at local midnight (the mood family); seasonals are once each,
// ever. Each pays flat XP (dailies 20, seasonals 100). Quest wiring is
// bus-consumer only (spec §8) — the ids route events to progress.
export const DAILY_XP = 20;
export const SEASONAL_XP = 100;

export const DAILY_QUESTS = [
  { id: "lose-25", target: 25, title: (n) => "Lose 25 BB today (" + Math.min(n, 25) + "/25)" },
  { id: "ask-mom", target: 1, title: () => "Ask Mom (once is enough)" },
  { id: "bet-deliberation", target: 1, title: () => "Bet on one deliberation" },
  { id: "dream-one", target: 1, title: () => "Dream one dream" },
  { id: "check-chain", target: 1, title: () => "Check the chain (the chain won't move)" },
];
export const SEASONAL_QUESTS = [
  { id: "third-track", title: () => "Survive a Third Track" },
  { id: "mod-deleted", title: () => "Get a win deleted by MOD (fake (yours specifically))" },
  { id: "suspicion", title: () => "Reach suspicion: \"Close (she knows)\"" },
  { id: "trade-up", title: () => "Complete a Trade-Up Contract" },
  { id: "coupon", title: () => "Redeem a Mom Coupon™ on a Generous day" },
  { id: "ai-10", title: () => "Receive 10 AI analyses (they conclude)" },
];
export const AI_ANALYSES_TARGET = 10;

export function questTitle(id, progress) {
  const q = DAILY_QUESTS.find((x) => x.id === id);
  if (q) return q.title(progress || 0);
  const s = SEASONAL_QUESTS.find((x) => x.id === id);
  return s ? s.title() : id;
}

// ---- the pure reducer ------------------------------------------------------------
// One normalized event in; the next state + its settled facts out. Pure: no
// persistence, no bus, no clock (the day key arrives with the event).
//
// Event types (state.js normalizes the bus onto these):
//   {type:"settled", p}        round.settled — XP + lose-25 + dream-one + win flag
//   {type:"started", p}        round.started — bet-deliberation
//   {type:"forfeit", p}        round.forfeit — XP (the house price) + lose-25
//   {type:"deposit"}           deposit.completed — ask-mom
//   {type:"chain-view"}        SkinChain views bump — check-chain
//   {type:"dilemma", p}        dilemma.settled — third-track (seasonal)
//   {type:"mod-deleted", tag, playerTag}   mod.deleted — yours specifically
//   {type:"panic-revealed", rung}          panic.revealed — suspicion
//   {type:"market-event", p}   market.event kind trade-up — the contract (additive #46)
//   {type:"coupon-redeemed", mood}         coupon.redeemed — Generous day only
//   {type:"ai-count", n}       StatTrak aiAnalyses counter — they conclude
export function applyPassEvent(prev, ev, dayKey) {
  const state = ensureDaily(prev, dayKey);
  const quests = state.daily.quests.map((q) => ({ ...q }));
  const seasonalDone = [...state.seasonal];
  let xpGained = 0;
  let winSeen = false;
  let completed = []; // {id, xp}

  const bump = (id, delta) => {
    const q = quests.find((x) => x.id === id);
    if (!q || q.done) return;
    q.progress = Math.min(q.progress + delta, DAILY_QUESTS.find((x) => x.id === id).target);
    if (q.progress >= DAILY_QUESTS.find((x) => x.id === id).target) {
      q.done = true;
      completed.push({ id, xp: DAILY_XP });
    }
  };
  const finishSeasonal = (id) => {
    if (seasonalDone.includes(id)) return;
    seasonalDone.push(id);
    completed.push({ id, xp: SEASONAL_XP });
  };

  switch (ev.type) {
    case "settled": {
      const p = ev.p || {};
      if (p.wagered !== false && isWinKind(p.kind)) winSeen = true;
      const xp = xpForSettled(p);
      if (xp > 0) {
        xpGained += xp;
        bump("lose-25", xp);
      }
      if (p.surface === "crates" && p.dreamed === true) bump("dream-one", 1); // wagered or free — a dream is a dream
      break;
    }
    case "forfeit": {
      const xp = xpForForfeit(ev.p);
      if (xp > 0) {
        xpGained += xp;
        bump("lose-25", xp);
      }
      break;
    }
    case "started": {
      const p = ev.p || {};
      if (p.surface === "trolley" && p.wagered !== false) bump("bet-deliberation", 1);
      break;
    }
    case "deposit":
      bump("ask-mom", 1);
      break;
    case "chain-view":
      bump("check-chain", 1);
      break;
    case "dilemma": {
      const p = ev.p || {};
      if (p.verdict === "third-track" && typeof p.playerStakeBB === "number" && p.playerStakeBB > 0) finishSeasonal("third-track");
      break;
    }
    case "mod-deleted":
      if (ev.tag && ev.tag === ev.playerTag) finishSeasonal("mod-deleted");
      break;
    case "panic-revealed":
      if (typeof ev.rung === "number" && ev.rung >= 3) finishSeasonal("suspicion");
      break;
    case "market-event":
      if ((ev.p || {}).kind === "trade-up") finishSeasonal("trade-up");
      break;
    case "coupon-redeemed":
      if (ev.mood === "Generous") finishSeasonal("coupon");
      break;
    case "ai-count":
      if (typeof ev.n === "number" && ev.n >= AI_ANALYSES_TARGET) finishSeasonal("ai-10");
      break;
    default:
      break;
  }

  // quest XP lands with the event XP (§4: quests grant flat XP)
  for (const c of completed) xpGained += c.xp;

  const xp = Math.max(0, Math.floor((state.xp || 0) + xpGained));
  return {
    state: { ...state, xp, tier: TIERS[tierIdxForXp(xp)].key, daily: { day: state.daily.day, quests }, seasonal: seasonalDone },
    xpGained,
    questsCompleted: completed,
    tierUps: xpGained > 0 ? tierUpsBetween(state.xp || 0, xp) : [],
    winSeen,
  };
}

// ---- verbatim copy (spec §1/§5/§6) ------------------------------------------------
export const COPY = {
  title: "MOM'S LITTLE HELPER™ PASS",
  season: "SEASON 1: THE ROAD TO DIAMOND IS PAVED",
  seasonOfOne: "SEASON 1 OF 1 — Season 2 is mood-dependent. Nothing expires, nothing is lost.",
  countdownTip: "lunar recalibration, §8.9 — the countdown resyncs to 29d whenever it would reach zero",
  mascot: "Mom's little helper is watching you improve (est.).",
  mascotSign: "— Management",
  xpAtMax: (n) => n.toLocaleString("en-US") + " XP (keep going (there is nothing after this))",
  xpLine: (n, next) => (next
    ? n.toLocaleString("en-US") + " XP — " + (next.xp - n) + " XP to " + next.key + " MOM"
    : n.toLocaleString("en-US") + " XP (keep going (there is nothing after this))"),
  winToast: "no progress (a win teaches nothing)",
  xpToast: (n) => "+" + n + " XP. Every loss is progress (and progress is load-bearing).",
  tierToast: (tier) => "You reached " + tier + " MOM. Every loss counted (they really counted).",
  questToast: (xp, title) => "+" + xp + " XP — \"" + title + "\" complete (the helper is proud (est.)).",
  premiumFinePrint: "(shininess estimated; estimates are mood-dependent; the premium track is premium)",
  premiumUnlock: "Unlock: 250 OC",
  premiumDisclosure: "thank you for your support (of nothing in particular (§2.1))",
  premiumSuffix: " (Premium)",
};

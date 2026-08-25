// Retention mechanics — Attendance Streak™, VIP Ladder + VIP Host Mom,
// Comeback Key™, Mom Weather™ (docs/spec/retention-shortlist.md; integration.md
// §5/§6/§8). The site's retention program is a family: every mechanic below
// measures volume and calls it love.
//
// Pure state machines + spine bus wiring; no React. The Rakeback Vault's math
// stays in src/spine/vault.js (#20) — this module surfaces it, it never
// recomputes it. Mom Weather's thunder is armed by the Band (#30): emitting
// momweather.event lands the sound.
//
// Persistence (integration §14 + retention spec):
//   hfes_attendance { current, longest, lastDay, lastRoundAt, tombstoneDay,
//                     tombstoneDays, warnDay, warnMask, memorialPending }
//   hfes_vip        { lifetimeBorrowed, weekKey, weekBorrowed, lastWeekBorrowed,
//                     underReview, lastDepositAt }
//   hfes_comeback   { lastGrantedAt }
// Nothing else persists; the weather and the velvet window die with the tab.
import { Bus, EVENTS } from "../spine/bus.js";
import { DESPERATION_THRESHOLD_BB, POPULATION } from "../spine/constants.js";

// ---- injectable clock (acceptance: "clock injectable for testing") -----------
let clockFn = () => Date.now();
export function setClock(fn) { if (typeof fn === "function") clockFn = fn; }
function now() { return clockFn(); }

// ---- local calendar day family (same convention as mood/identity/crates) -----
function pad(n) { return String(n).padStart(2, "0"); }
export function dayKeyFor(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
export function dayKeyBefore(key, days = 1) {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() - days);
  return dayKeyFor(d.getTime());
}
// Monday-based week key (Tier Maintenance resets Monday).
export function weekKeyFor(ts) {
  const d = new Date(ts);
  const mon = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - mon);
  return dayKeyFor(d.getTime());
}

// ---- verbatim copy (retention-shortlist.md) -----------------------------------
export const COPY = {
  honestyStreak: "Streaks measure engagement, not enjoyment (§8.9).",
  warn2000: "Your streak dies in 4 hours. Streaks are like pets. They depend on you.",
  warn2200: "Sweetie. It's late. Your streak dies in 2 hours and funerals are expensive. Deposits help. — Management",
  warn2330: "Your {n}-day streak dies tomorrow. Kevin— the house will not be attending the funeral. (§8.9)",
  deathChat: "STREAK DECEASED: {n} days. In lieu of flowers, the house accepts Ask-Mom deposits. The counter has been preserved for your next of kin.",
  condolence: "I heard about the streak, sweetie. Grief is natural. So is depositing. — Management",
  velvet: "Running low, sweetie? I can advance you lunch money. Love, Management",
  assigned: "You've been assigned a dedicated VIP host: Mom. She has always been your host. (§1.3) — Management",
  rankUpDm: "A new tier, {tier}. The perks are identical. Don't tell the others. — Management",
  mondaySummary: "This week: {x} of {req}. Mom is watching the meter. — Management",
  underReviewDm: "You missed the meter, sweetie. Nothing is ever lost at Hot For E-Skins 2026 except money (§8.9). — Management",
  ladderJoke: "The ladder goes up. The numbers sometimes go down. Both are progress (§8.9).",
  rankUpToast: "You've been awarded 180 Keys*",
  rankUpFootnote: "*Key Points. 180 of 1,000. Points expire with the mood that granted them (§2.3).",
  unranked: "UNRANKED (Mom's Neutral)",
  longestLabel: "Longest streak (unbeaten, like the house)",
  comebackEnvelope: "We kept your seat warm. It cost us nothing. The key's free though.",
  comebackDual: "Welcome back. While you were studying, your streak died and we got you a key. Condolences and congratulations. (§12.0)",
  // #32: {n} = recipients (POPULATION − you-if-covered) — the count renders
  // in chat's [BOT] line (integration §3's `momweather.event {recipients, bb}`).
  momWeatherCovered: "⛈ MOM WEATHER™: 1 BB rains on the faithful ({n} of them). {tag} stays dry (covered).",
  momWeatherSoaked: "⛈ MOM WEATHER™: 1 BB rains on the faithful ({n} of them). {tag} is soaked (1 BB credited).",
  rainHonesty: "Rain is an engagement precipitation event (§8.9).",
  umbrella: "☂ you're covered",
};

// ---- the VIP ladder (§2) --------------------------------------------------------
// Every metal starts at Tier 7; Tiers 1–6 are reserved for staff and Mom's book
// club. Thresholds are lifetime fake-USD borrowed. Bronze 7 = any first deposit;
// Golden Child sits at the ticker's canonical $340.
const VIP_RUNGS = [
  { min: 0.01, tier: "Bronze 7" },
  { min: 25, tier: "Bronze 8" },
  { min: 50, tier: "Bronze 9" },
  { min: 100, tier: "Silver 7" },
  { min: 150, tier: "Silver 8" },
  { min: 200, tier: "Silver 9" },
  { min: 340, tier: "Golden Child" },
  { min: 500, tier: "Platinum Only Child" },
  { min: 750, tier: "Palladium: Mom's Favorite™" },
];
const PALLADIUM_BASE = 750;
const PALLADIUM_STEP = 250;
export function vipRungFor(usd) {
  if (!(usd > 0)) return { idx: -1, tier: null };
  if (usd >= PALLADIUM_BASE + PALLADIUM_STEP) {
    const n = 2 + Math.floor((usd - PALLADIUM_BASE - PALLADIUM_STEP) / PALLADIUM_STEP);
    return { idx: 8 + n, tier: "Palladium " + n };
  }
  let idx = 0;
  for (let i = 0; i < VIP_RUNGS.length; i++) if (usd >= VIP_RUNGS[i].min) idx = i;
  return { idx, tier: VIP_RUNGS[idx].tier };
}
// Perks: identical at every tier, worded progressively grander.
const PERKS = [
  ["Bronze", "Priority loss processing."],
  ["Silver", "Priority loss processing (express)."],
  ["Golden", "Priority loss processing (executive)."],
  ["Platinum", "Priority loss processing (platinum queue)."],
  ["Palladium", "Priority loss processing (platinum queue, emotional)."],
];
export function perkFor(tier) {
  if (!tier) return "Priority loss processing (pending your first deposit).";
  const hit = PERKS.find(([metal]) => tier.startsWith(metal));
  return hit ? hit[1] : PERKS[0][1];
}

// ---- thresholds -----------------------------------------------------------------
const MATTE_AT_DAYS = 7;          // the crate streak gate, reconciled (integration handoffs)
const MILESTONE_DAYS = [7, 30, 100];
const COMEBACK_ABSENCE_MS = 2 * 60 * 60 * 1000;   // ≥2h since the last wagered round
const COMEBACK_COOLDOWN_MS = 24 * 60 * 60 * 1000; // max once per 24h
const MOMWEATHER_FIRST_MS = 12 * 60 * 1000;       // ~12 min of play
const MOMWEATHER_COVER_MS = 6 * 60 * 60 * 1000;   // deposited within 6h = covered
const VELVET_BB = 10;             // velvet pre-nag, ~10 BB, above the locked <6 BB banner
const WARN_HOURS = [20, 22, 23.5]; // the escalating evening ladder (local)

// ---- persistence ------------------------------------------------------------------
const ATT_KEY = "hfes_attendance";
const VIP_KEY = "hfes_vip";
const CB_KEY = "hfes_comeback";

function blankAttendance() {
  // couponDone (#32): the day-30 Mom Coupon™ is once-ever, like the Memorial —
  // a rebuilt streak re-reaches day 30 but the house does not over-honor twice.
  return { current: 0, longest: 0, lastDay: null, lastRoundAt: 0, tombstoneDay: null, tombstoneDays: 0, warnDay: null, warnMask: 0, memorialPending: false, memorialDone: false, couponDone: false };
}
function blankVip() {
  return { lifetimeBorrowed: 0, weekKey: null, weekBorrowed: 0, lastWeekBorrowed: 0, underReview: false, lastDepositAt: 0 };
}
function blankComeback() { return { lastGrantedAt: 0 }; }
function loadObj(key, blank) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    if (!v || typeof v !== "object") return blank();
    return { ...blank(), ...v };
  } catch (e) { return blank(); }
}
function saveObj(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

let att = loadObj(ATT_KEY, blankAttendance);
let vip = loadObj(VIP_KEY, blankVip);
let comeback = loadObj(CB_KEY, blankComeback);

// ---- session state (dies with the tab) ---------------------------------------------
let started = false;
let startedAt = 0;
let clockTimer = null;
let balanceBB = Infinity;
let prevBalanceBB = Infinity;
let velvetFired = false;
let velvetStartLow = false;
let weather12Fired = false;
let weatherLowFired = false;
let comebackPending = false;
let comebackDual = false;
let hiddenSince = 0;
let deathWhileHidden = false;
let lastEvalDay = null;
const listeners = new Set();
const pendingEvents = [];

function notify(events = []) {
  const snap = { ...Retention.get(), events };
  for (const fn of [...listeners]) {
    try { fn(snap); } catch (e) {}
  }
}
function flush() { if (pendingEvents.length) notify(pendingEvents.splice(0)); }
function pushEvent(ev) { pendingEvents.push(ev); }

// ---- attendance (§1): days you LOST --------------------------------------------
function noteWageredRound() {
  const t = now();
  const today = dayKeyFor(t);
  if (att.lastDay === today) {
    att.lastRoundAt = t;
    saveObj(ATT_KEY, att);
    return;
  }
  // A gap of ≥1 full empty day kills the streak the moment play resumes —
  // the house notices at the door, never sooner.
  if (att.current > 0 && att.lastDay !== null && att.lastDay < dayKeyBefore(today)) {
    die(dayKeyBefore(today));
  }
  att.current = att.lastDay === dayKeyBefore(today) ? att.current + 1 : 1;
  att.lastDay = today;
  att.lastRoundAt = t;
  att.tombstoneDay = null;
  if (att.current > att.longest) att.longest = att.current;
  saveObj(ATT_KEY, att);
  if (MILESTONE_DAYS.includes(att.current)) {
    Bus.emit(EVENTS.STREAK_MILESTONE, { days: att.current, field: "attendanceStreak", value: att.current });
    pushEvent({ kind: "milestone", days: att.current });
  }
  flush();
}

function die(day) {
  if (att.current <= 0) return;
  const days = att.current;
  pushEvent({ kind: "death", days });
  Bus.emit(EVENTS.STREAK_DIED, { days });
  if (days > att.longest) att.longest = days;
  att.tombstoneDay = day;
  att.tombstoneDays = days;
  att.current = 0;
  if (hiddenSince) deathWhileHidden = true;
  saveObj(ATT_KEY, att);
}

// The evening ladder: only when today is still empty and something can die.
function atRisk(today) {
  return att.current > 0 && att.lastDay !== today && att.tombstoneDay === null;
}
export function warningStageFor(ts) {
  const d = new Date(ts);
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= WARN_HOURS[2]) return 3;
  if (h >= WARN_HOURS[1]) return 2;
  if (h >= WARN_HOURS[0]) return 1;
  return 0;
}

function dayFlip() {
  const t = now();
  const today = dayKeyFor(t);
  if (lastEvalDay === today) return;
  const yesterday = dayKeyBefore(today);
  lastEvalDay = today;
  att.warnDay = null; att.warnMask = 0; // the ladder re-arms each day
  // The streak died during any fully-empty day(s) before today.
  if (att.current > 0 && att.lastDay !== null && att.lastDay < yesterday) {
    die(yesterday);
  }
  weekRollover();
  saveObj(ATT_KEY, att);
}

// ---- VIP (§2) -----------------------------------------------------------------------
function fmtUsd(n) { return "$" + (Math.round(n * 100) / 100).toFixed(2); }
function weekRequirement() { return Math.round(vip.lastWeekBorrowed * 1.1 * 100) / 100; }

function weekRollover() {
  const wk = weekKeyFor(now());
  if (vip.weekKey === wk) return;
  const req = Math.ceil(weekRequirement() * 100) / 100; // owed by you rounds up (§8.9)
  const missed = vip.weekKey !== null && vip.weekKey === dayKeyBefore(wk, 7)
    && vip.lastWeekBorrowed > 0 && vip.weekBorrowed < req;
  vip.lastWeekBorrowed = vip.weekBorrowed;
  vip.weekBorrowed = 0;
  vip.weekKey = wk;
  if (missed) vip.underReview = true;
  saveObj(VIP_KEY, vip);
  pushEvent({ kind: "monday", summary: COPY.mondaySummary.replace("{x}", fmtUsd(0)).replace("{req}", fmtUsd(weekRequirement())), underReview: vip.underReview });
}

function noteDeposit(usd) {
  const before = vipRungFor(vip.lifetimeBorrowed);
  weekRollover();
  vip.lastDepositAt = now();
  vip.underReview = false; // money fixes the meter's opinion
  vip.weekBorrowed = Math.round((vip.weekBorrowed + (usd || 0)) * 100) / 100;
  vip.lifetimeBorrowed = Math.round((vip.lifetimeBorrowed + (usd || 0)) * 100) / 100;
  saveObj(VIP_KEY, vip);
  const after = vipRungFor(vip.lifetimeBorrowed);
  if (before.idx < 0 && after.idx >= 0) pushEvent({ kind: "assigned", tier: after.tier });
  if (after.idx > before.idx) pushEvent({ kind: "rank-up", tier: after.tier, rung: after.idx });
  flush();
}

// ---- the velvet pre-nag (§2b): ~10 BB, above the locked <6 BB banner ---------------
function onBalance(bb) {
  if (!Number.isFinite(bb)) return;
  if (!velvetFired && Number.isFinite(prevBalanceBB) && prevBalanceBB > VELVET_BB && bb <= VELVET_BB) {
    velvetFired = true;
    pushEvent({ kind: "velvet", copy: COPY.velvet });
    flush();
  }
  prevBalanceBB = bb;
  balanceBB = bb;
}

// ---- Comeback Key™ (§3) ---------------------------------------------------------
function comebackEligible() {
  const t = now();
  return att.lastRoundAt > 0
    && t - att.lastRoundAt >= COMEBACK_ABSENCE_MS
    && t - comeback.lastGrantedAt >= COMEBACK_COOLDOWN_MS;
}
function checkComeback() {
  if (comebackPending || !comebackEligible()) return;
  comebackPending = true;
  comebackDual = !!deathWhileHidden;
  pushEvent({ kind: "comeback", dual: comebackDual });
}

// ---- Mom Weather™ (§6): rain falls only on the lapsed ---------------------------
// Once at ~12 min of play, plus once more if balance drops <6 BB (the shared
// DESPERATION_THRESHOLD_BB constant — one threshold, one owner). Each window
// fires at most once per session, so the max is twice, per spec.
function momWeatherMaybe() {
  if (weather12Fired && weatherLowFired) return;
  const t = now();
  let fire = false;
  if (!weather12Fired && t - startedAt >= MOMWEATHER_FIRST_MS) { weather12Fired = true; fire = true; }
  else if (!weatherLowFired && Number.isFinite(balanceBB) && balanceBB < DESPERATION_THRESHOLD_BB) { weatherLowFired = true; fire = true; }
  if (!fire) return;
  const covered = vip.lastDepositAt > 0 && t - vip.lastDepositAt < MOMWEATHER_COVER_MS;
  Bus.emit(EVENTS.MOMWEATHER_EVENT, { recipients: POPULATION - (covered ? 1 : 0), bb: 1, covered });
}

// ---- the clock (one interval: ladder, weather, midnight) --------------------------
function ensureStarted() {
  if (started) return;
  started = true;
  startedAt = now();
  if (Number.isFinite(balanceBB)) prevBalanceBB = balanceBB;
  clockTimer = setInterval(() => {
    dayFlip();
    const today = dayKeyFor(now());
    // The escalating evening ladder — only the highest newly-reached stage
    // fires (a 21:00 arrival gets one warning, not two stacked).
    if (atRisk(today)) {
      const stage = warningStageFor(now());
      if (stage > att.warnMask) {
        att.warnMask = stage;
        att.warnDay = today;
        saveObj(ATT_KEY, att);
        pushEvent({ kind: "warning", stage });
      }
    }
    // A session that opens already low gets the velvet DM on the first tick.
    if (!velvetFired && velvetStartLow && balanceBB <= VELVET_BB) {
      velvetFired = true;
      velvetStartLow = false;
      pushEvent({ kind: "velvet", copy: COPY.velvet });
    } else if (velvetStartLow && balanceBB > VELVET_BB) {
      velvetStartLow = false;
    }
    momWeatherMaybe();
    flush();
  }, 20000);
}

// ---- public API ---------------------------------------------------------------------
export const Retention = {
  setClock,
  init(opts = {}) {
    if (Number.isFinite(opts.balanceBB)) {
      balanceBB = opts.balanceBB;
      prevBalanceBB = opts.balanceBB;
      velvetStartLow = opts.balanceBB <= VELVET_BB;
    }
    ensureStarted();
    // Session-start checks (integration §3 seats retention at session.started —
    // the bus listener below covers any import-order variant).
    dayFlip();
    checkComeback();
    flush();
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  get() {
    const t = now();
    const today = dayKeyFor(t);
    const run = vipRungFor(vip.lifetimeBorrowed);
    const attendance = {
      current: att.current,
      longest: att.longest,
      lastDay: att.lastDay,
      atRiskToday: atRisk(today),
      pulseEvening: atRisk(today) && warningStageFor(t) > 0,
      tombstoneDay: att.tombstoneDay,
      tombstoneDays: att.tombstoneDays,
      matte: att.current >= MATTE_AT_DAYS,
    };
    const vipView = {
      ranked: run.idx >= 0,
      tier: run.tier || COPY.unranked,
      chip: vip.underReview ? "UNDER REVIEW" : (run.idx >= 0 ? "VIP " + run.tier.toUpperCase() : COPY.unranked),
      perk: perkFor(run.tier),
      underReview: vip.underReview,
      lifetimeBorrowed: vip.lifetimeBorrowed,
      weekBorrowed: vip.weekBorrowed,
      weekRequirement: weekRequirement(),
      ladderJoke: COPY.ladderJoke,
    };
    return { attendance, vip: vipView, comebackPending, comebackDual };
  },
  // App calls this when the Comeback envelope is claimed (grants the Rebound key).
  consumeComeback() {
    comebackPending = false;
    comebackDual = false;
    comeback.lastGrantedAt = now();
    saveObj(CB_KEY, comeback);
    notify([{ kind: "comeback-claimed" }]);
  },
  // The day-100 Memorial rename (#27 left the consumer seat unclaimed; the
  // rename vocabulary belongs to retention): exactly once ever. If no Stock
  // JPEG is held at the moment, the rename is owed, not lost.
  oweMemorial() { att.memorialPending = true; saveObj(ATT_KEY, att); },
  claimMemorial() {
    if (att.memorialDone) return false;
    att.memorialDone = true;
    att.memorialPending = false;
    saveObj(ATT_KEY, att);
    return true;
  },
  memorialOwed() { return !!att.memorialPending && !att.memorialDone; },
  // #32: the day-30 coupon mints once ever (mirrors the Memorial gate) — a
  // rebuilt streak re-crosses day 30 without a second coupon.
  claimCoupon() {
    if (att.couponDone) return false;
    att.couponDone = true;
    saveObj(ATT_KEY, att);
    return true;
  },
  // exposed for verification; production traffic rides the bus listeners below
  noteWageredRound,
  __state: () => ({ att, vip, comeback }),
};

// ---- bus wiring (module lifetime, like the spine's own subscriptions) ---------------
Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || p.wagered !== true) return;
  noteWageredRound();
});
// A forfeit spent real BB (the round never settled — the house kept it); the
// streak never asked whether the round finished, only whether it cost.
Bus.on(EVENTS.ROUND_FORFEIT, () => noteWageredRound());
// House-sit fills are wagered rounds under your name (integration §5) — the
// streak never asked who wagered them. (The vault accrues for these in
// spine/vault.js, same event.)
Bus.on(EVENTS.MIKE_WIN, (p) => {
  if (p && p.class === "house-sat") noteWageredRound();
});
Bus.on(EVENTS.DEPOSIT_COMPLETED, (p) => {
  noteDeposit(p && typeof p.usdFace === "number" ? p.usdFace : 0);
});
Bus.on(EVENTS.BB_SPENT, (p) => { if (p) onBalance(p.balanceBB); });
Bus.on(EVENTS.BB_CREDITED, (p) => { if (p) onBalance(p.balanceBB); });
Bus.on(EVENTS.SESSION_STARTED, (p) => {
  if (p && Number.isFinite(p.balanceBB)) {
    if (!Number.isFinite(balanceBB)) { balanceBB = p.balanceBB; prevBalanceBB = p.balanceBB; }
  }
  ensureStarted();
  dayFlip();
  checkComeback();
  flush();
});
// MOM'S HOME time is absence (integration §5): disguise time counts toward the
// 2h, and a death that lands while hidden makes the welcome-back dual.
Bus.on(EVENTS.PANIC_HIDDEN, () => { hiddenSince = now(); });
Bus.on(EVENTS.PANIC_REVEALED, () => {
  hiddenSince = 0;
  checkComeback();
  if (comebackPending) comebackDual = comebackDual || !!deathWhileHidden;
  deathWhileHidden = false;
  flush();
});
Bus.on(EVENTS.MOOD_CHANGED, (p) => {
  if (!p || !p.crossedMidnight) return;
  dayFlip();
});

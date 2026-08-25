// Self-Limit Settings — the state machine for the control room connected to
// nothing (docs/spec/self-limit-settings.md). Every control works perfectly
// and limits nothing, because the units never match the money (canon, #15).
// Settings + exclusion runtime persist under hfes_selflimit; the StatTrak™
// counters live additively in identity's hfes_stats (integration §12.5).
// Nothing here gates any other surface — the constitution forbids it.
import { Bus, EVENTS } from "../spine/bus.js";
import { Identity } from "../spine/identity.js";
import { Mood } from "../spine/mood.js";
import { OC_TO_BB_BASE_RATE } from "../spine/constants.js";

export const SELF_LIMIT_KEY = "hfes_selflimit";

// §2.5: the 24-hour Break elapses in 90 seconds of house time (§8.9).
export const BREAK_HOUSE_MS = 90000;
export const BREAK_HOUSE_SECONDS = 86400;
// §2.1: the slider starts at 500 the moment it's touched.
export const DEPOSIT_LIMIT_FLOOR_BB = 500;
export const DEPOSIT_LIMIT_MAX_BB = 10000;
// §2.2: every currency except the one the money is in.
export const LOSS_CURRENCIES = ["USD", "V-Gems", "SkinCoinz", "Chores (est.)"];
export const REMINDER_CHOICES = [15, 30, 60, 120];
export const REALITY_CHOICES = [0, 30, 60];
// Win kinds on round.settled (integration §3) — reality checks land only here;
// losses are spared out of fairness.
export const SL_WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win"]);

function blankState() {
  return {
    depositLimitBB: null, // null = "No limit set (recommended)"
    lossLimit: { cur: "USD", val: 50 },
    reminderMins: 30,
    realityCheckMins: 0, // 0 = "Off (recommended)"
    limitCheck: { startedAt: 0, restarts: 0 }, // the check that never concludes
    exclusion: { active: false, since: 0 },
  };
}

function sanitize(v) {
  const base = blankState();
  if (!v || typeof v !== "object") return base;
  const num = (x) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : null);
  const dl = num(v.depositLimitBB);
  base.depositLimitBB = dl !== null ? Math.round(dl) : null;
  if (v.lossLimit && typeof v.lossLimit === "object" && typeof v.lossLimit.cur === "string") {
    if (LOSS_CURRENCIES.includes(v.lossLimit.cur)) base.lossLimit = { cur: v.lossLimit.cur, val: 50 };
  }
  const rm = num(v.reminderMins);
  base.reminderMins = rm !== null && REMINDER_CHOICES.includes(rm) ? rm : 30;
  const rc = num(v.realityCheckMins);
  base.realityCheckMins = rc !== null && REALITY_CHOICES.includes(rc) ? rc : 0;
  if (v.limitCheck && typeof v.limitCheck === "object") {
    base.limitCheck = {
      startedAt: typeof v.limitCheck.startedAt === "number" && Number.isFinite(v.limitCheck.startedAt) ? v.limitCheck.startedAt : 0,
      restarts: typeof v.limitCheck.restarts === "number" && Number.isFinite(v.limitCheck.restarts) && v.limitCheck.restarts > 0 ? Math.floor(v.limitCheck.restarts) : 0,
    };
  }
  if (v.exclusion && typeof v.exclusion === "object") {
    base.exclusion = {
      active: v.exclusion.active === true,
      since: typeof v.exclusion.since === "number" && Number.isFinite(v.exclusion.since) ? v.exclusion.since : 0,
    };
  }
  return base;
}

function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(SELF_LIMIT_KEY) || "null")); } catch (e) { return blankState(); }
}
function save() {
  try { localStorage.setItem(SELF_LIMIT_KEY, JSON.stringify(state)); } catch (e) {}
}

let state = load();

function emit(kind, detail) {
  Bus.emit(EVENTS.LIMIT_EVENT, { kind, detail: detail || null });
}

// §2.5: the chip reads 23:59:59, then immediately accelerates ("recalibrated
// for your schedule (§8.9)"). Power curve — the first second already eats
// ~20 house-minutes; 24 hours elapse over exactly 90 real seconds.
export function breakHouseSecondsLeft(elapsedMs) {
  const t = Math.min(1, Math.max(0, elapsedMs / BREAK_HOUSE_MS));
  return Math.max(0, Math.round(BREAK_HOUSE_SECONDS * Math.pow(1 - t, 1.7)));
}

export function formatHouseClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const p = (n) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return p(h) + ":" + p(m) + ":" + p(sec);
}

// §2.2: why it can't bind, per denomination. The USD estimate is permanently
// $0.00 by canon (§2.4); the limit is eternally $50 away from a number that
// never moves. V-Gems/SkinCoinz: same trick, bigger numbers (×40,000 per BB,
// per §2.4). Chores: not tracked, therefore perfectly safe.
export function lossLimitStatusLine(lossLimit) {
  const cur = (lossLimit && lossLimit.cur) || "USD";
  if (cur === "V-Gems") return "Losses to date: 0 V-Gems (est.). You are 2,000,000 V-Gems from your limit (§2.4).";
  if (cur === "SkinCoinz") return "Losses to date: 0 SkinCoinz (est.). You are 28,333.5 SkinCoinz from your limit (§2.4).";
  if (cur === "Chores (est.)") return "Chores are not tracked (§2.6). This limit is therefore perfectly safe.";
  return "Losses to date: $0.00 (est.). You are $50.00 from your limit (§2.4).";
}

export const SelfLimit = {
  get() { return { ...state, lossLimit: { ...state.lossLimit }, limitCheck: { ...state.limitCheck }, exclusion: { ...state.exclusion } }; },
  excluded() { return state.exclusion.active; },
  exclusionDays() {
    if (!state.exclusion.active || !state.exclusion.since) return 0;
    return Math.max(0, Math.floor((Date.now() - state.exclusion.since) / 86400000));
  },

  // §2.1 — the growth mindset: dragging right raises instantly and
  // permanently; dragging left is the slider's problem, not ours.
  enableDepositLimit(bb) {
    const start = Math.max(DEPOSIT_LIMIT_FLOOR_BB, Math.round(bb) || DEPOSIT_LIMIT_FLOOR_BB);
    state.depositLimitBB = start;
    state.limitCheck = { startedAt: Date.now(), restarts: state.limitCheck.restarts || 0 };
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("deposit-limit-enabled", "deposit limit");
    return start;
  },
  raiseDepositLimit(bb) {
    const cur = state.depositLimitBB;
    const next = Math.round(bb);
    if (cur === null || !(next > cur)) return cur;
    state.depositLimitBB = next;
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("deposit-limit-raised", "+" + (next - cur) + " BB");
    return next;
  },
  // §2.1 the ratchet: every completed deposit auto-raises the limit to at
  // least the deposit's BB-equivalent. The only quantity a deposit limit
  // tracks is your maximum. Estimate uses the spine base rate — the mood
  // multiplier is single-consumer-locked to the conversion receipt
  // (integration §2), and the "(est.)" tag carries the lie.
  applyDepositRatchet(oc) {
    if (state.depositLimitBB === null) return null;
    const est = Math.max(1, Math.ceil(((typeof oc === "number" && oc) || 0) * OC_TO_BB_BASE_RATE));
    if (est <= state.depositLimitBB) return null;
    const delta = est - state.depositLimitBB;
    state.depositLimitBB = est;
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("deposit-limit-raised", "+" + delta + " BB");
    return "Deposit limit auto-raised to fit your lifestyle (+" + delta + " BB (est.), growth mindset)";
  },
  // The pending limit check, running line. It never concludes; the mood
  // changes daily and the check restarts (handled at MOOD_CHANGED below).
  limitCheckLine() {
    const startedAt = state.limitCheck.startedAt || Date.now();
    const mins = Math.max(0, Math.round((Date.now() - startedAt) / 60000));
    return "Check running: " + mins + "m · restarted " + (state.limitCheck.restarts || 0) + "× (the mood changed).";
  },

  // §2.2 — the dropdown offers every currency except the one the money is in.
  setLossCurrency(cur) {
    if (!LOSS_CURRENCIES.includes(cur)) return;
    state.lossLimit = { cur, val: 50 };
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("loss-limit-enabled", cur);
  },

  // §2.3 — the timer works perfectly; the delivery does not (App owns the
  // clock; reminders defer to the interruptible bus and auto-snooze).
  setReminderMins(m) {
    const mins = REMINDER_CHOICES.includes(m) ? m : 30;
    state.reminderMins = mins;
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("reminder-enabled", mins + " min");
  },

  // §2.4 — checks are timed for maximum receptivity (immediately after wins).
  setRealityCheckMins(m) {
    const mins = REALITY_CHOICES.includes(m) ? m : 0;
    state.realityCheckMins = mins;
    save();
    Identity.addStat("responsibleMoments", 1);
    emit("reality-enabled", mins ? mins + " min" : "off");
  },

  // §2.5 — the break is 90 seconds of house time; all features remain
  // available ("breaking is a mindset"). App owns the ticking clock.
  startBreak() { emit("break-start"); },
  completeBreak() {
    Identity.addStat("responsibleMoments", 1);
    Identity.addStat("breaksTaken", 1);
    Identity.addStat("breakSecondsTotal", BREAK_HOUSE_MS / 1000); // seconds = 90 × n, always
    emit("break-complete");
  },

  // §3 — the ladder. +1 responsible moment per rung advanced (§5).
  noteRungAdvance() { Identity.addStat("responsibleMoments", 1); },
  retreatLadder() { emit("ladder-retreat"); },

  // §4 — exclusion removes the player, not the play. A header chip appears;
  // that chip is the entire behavioral change.
  completeExclusion() {
    state.exclusion = { active: true, since: Date.now() };
    save();
    Identity.addStat("responsibleMoments", 1);
    Identity.addStat("exclusions", 1);
    emit("excluded");
  },
  // Return: 1 click, restores everything. There is no appeals process; there
  // is something faster than appeals (the button).
  returnFromExclusion() {
    const stats = Identity.getStats();
    const days = Math.max(1, this.exclusionDays());
    Identity.maxStat("exclusionDays", days);
    state.exclusion = { active: false, since: 0 };
    save();
    emit("return");
    return { w: stats.houseSatWins || 0, l: stats.houseSatLosses || 0, days };
  },

  // StatTrak™ feeds (§5) — the fill-in's ledger; l is structurally 0.
  noteHouseSatWin() { Identity.addStat("houseSatWins", 1); },
  noteReminderHandled() { Identity.addStat("remindersHandledForYou", 1); },
  noteRealityCheck() { Identity.addStat("realityChecksReceived", 1); },
};

// §2.1: the mood changes daily and the check restarts. It never concludes.
Bus.on(EVENTS.MOOD_CHANGED, () => {
  state.limitCheck = { startedAt: Date.now(), restarts: (state.limitCheck.restarts || 0) + 1 };
  save();
});

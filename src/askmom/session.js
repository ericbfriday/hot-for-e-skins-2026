import { Bus, EVENTS } from "../spine/bus.js";
import { OC_TO_BB_BASE_RATE, CONVERSION_FEES } from "../spine/constants.js";

const OC_KEY = "hfes_oc";
const BONUS_KEY = "hfes_bonus_oc";
const EVER_KEY = "hfes_deposit_ever";
const COUNT_KEY = "hfes_deposit_count";
const STREAK_KEY = "hfes_deposit_day_streak";

function pad(n) { return String(n).padStart(2, "0"); }
function keyFor(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
export function todayKey() { return keyFor(new Date()); }
function yesterdayKey() { const d = new Date(); d.setDate(d.getDate() - 1); return keyFor(d); }
export function nextMidnightTs() { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); }

function readNum(key, fallback) {
  try {
    const v = parseFloat(localStorage.getItem(key));
    return Number.isFinite(v) ? v : fallback;
  } catch (e) { return fallback; }
}

export function loadOC() { return Math.max(0, Math.floor(readNum(OC_KEY, 0))); }
export function saveOC(n) { try { localStorage.setItem(OC_KEY, String(Math.max(0, Math.floor(n)))); } catch (e) {} }

export function loadBonus() {
  try {
    const v = JSON.parse(localStorage.getItem(BONUS_KEY) || "null");
    if (!v || typeof v !== "object") return null;
    const amount = Math.floor(Number(v.amount));
    const expiresAt = Number(v.expiresAt);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(expiresAt)) return null;
    return { amount, expiresAt };
  } catch (e) { return null; }
}
export function saveBonus(b) { try { localStorage.setItem(BONUS_KEY, JSON.stringify(b)); } catch (e) {} }
export function clearBonus() { try { localStorage.removeItem(BONUS_KEY); } catch (e) {} }

export function loadDepositStats() {
  let streak = { lastDay: null, days: 0, stuck: false };
  try {
    const v = JSON.parse(localStorage.getItem(STREAK_KEY) || "null");
    if (v && typeof v === "object" && typeof v.lastDay === "string") {
      streak = {
        lastDay: v.lastDay,
        days: Number.isFinite(v.days) && v.days > 0 ? Math.floor(v.days) : 0,
        stuck: !!v.stuck,
      };
    }
  } catch (e) {}
  return {
    ever: (() => { try { return localStorage.getItem(EVER_KEY) === "1"; } catch (e) { return false; } })(),
    count: Math.max(0, Math.floor(readNum(COUNT_KEY, 0))),
    streak,
  };
}

export function recordDeposit() {
  const s = loadDepositStats();
  const t = todayKey();
  let streak = s.streak;
  if (!stuckSafe(streak)) {
    if (streak.lastDay !== t) {
      if (streak.lastDay === yesterdayKey() && streak.days >= 1) {
        streak = { lastDay: t, days: streak.days + 1, stuck: true };
      } else {
        streak = { lastDay: t, days: 1, stuck: false };
      }
    }
  } else {
    streak = { ...streak, lastDay: t };
  }
  const count = s.count + 1;
  try {
    localStorage.setItem(EVER_KEY, "1");
    localStorage.setItem(COUNT_KEY, String(count));
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (e) {}
  return { count, firstEver: !s.ever, streak };
}
function stuckSafe(streak) { return !!streak.stuck; }

export const AskMomSession = {
  ceremonyDone: false,
  sessionDeposits: 0,
  cardTypedAt: null,
  abandonedCount: 0,
  momcodeAttempts: 0,
  tickedPrices: {},
  chaseAttempts: [],
  lossStreak: 0,
};

export function noteChaseAttempt() {
  AskMomSession.chaseAttempts.push({ at: Date.now() });
  if (AskMomSession.chaseAttempts.length > 10) AskMomSession.chaseAttempts.shift();
}

export function chaseRibbonArmed() {
  const now = Date.now();
  if (AskMomSession.chaseAttempts.some((a) => now - a.at <= 60000)) return true;
  return AskMomSession.lossStreak >= 3;
}

export function noteMomcodeAttempt() { AskMomSession.momcodeAttempts += 1; }

export function momcodeRejection(moodWord) {
  const n = AskMomSession.momcodeAttempts;
  if (n <= 1) return "Code MOMCODE not recognized. Codes are mood-dependent. Today's mood: " + moodWord + ".";
  if (n === 2) return "Code MOMCODE not recognized (again). The mood did not change while you typed. Today's mood: " + moodWord + ".";
  if (n === 3) return "Code MOMCODE not recognized. The code now recognizes you. Today's mood: " + moodWord + ".";
  return "Code MOMCODE not recognized. It never will be. The house admires the effort (mood-dependent).";
}

export function computeConversion(oc, multiplier) {
  const gross = oc * OC_TO_BB_BASE_RATE * multiplier;
  const lines = [];
  let running = gross;
  for (const fee of CONVERSION_FEES) {
    if (fee.kind === "percent") {
      const amount = gross * fee.rate;
      lines.push({ id: fee.id, name: fee.name + " (" + (fee.rate * 100).toFixed(1) + "%)", amount, blurb: fee.blurb || null });
      running -= amount;
    } else if (fee.kind === "flatBB") {
      lines.push({ id: fee.id, name: fee.name, amount: fee.amount, blurb: fee.blurb || null });
      running -= fee.amount;
    } else if (fee.kind === "rounding") {
      const net = Math.floor(Math.max(0, running));
      const voided = running - net;
      lines.push({ id: fee.id, name: fee.name + " (" + fee.direction + ")", amount: voided, blurb: null, voided });
      return { gross, lines, net, voided };
    }
  }
  const net = Math.floor(Math.max(0, running));
  return { gross, lines, net, voided: running - net };
}

Bus.on(EVENTS.SPEND_FAILED, (p) => {
  if (p && p.surface === "roulette") noteChaseAttempt();
});
Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || p.wagered !== true) return;
  if (typeof p.netBB === "number") {
    if (p.netBB < 0) AskMomSession.lossStreak += 1;
    else if (p.netBB > 0) AskMomSession.lossStreak = 0;
  }
});

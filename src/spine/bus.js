import { DESPERATION_THRESHOLD_BB } from "./constants.js";

export const EVENTS = {
  GATE_ACCEPTED: "gate.accepted",
  SESSION_STARTED: "session.started",
  MOOD_CHANGED: "mood.changed",
  BB_SPENT: "bb.spent",
  BB_CREDITED: "bb.credited",
  SPEND_FAILED: "spend.failed",
  ROUND_STARTED: "round.started",
  ROUND_BEAT: "round.beat",
  ROUND_SETTLED: "round.settled",
  ROUND_FORFEIT: "round.forfeit",
  ASKMOM_OPENED: "askmom.opened",
  ASKMOM_ABANDONED: "askmom.abandoned",
  DEPOSIT_COMPLETED: "deposit.completed",
  WITHDRAWAL_CREATED: "withdrawal.created",
  IDENTITY_ASSIGNED: "identity.assigned",
  IDENTITY_RENAMED: "identity.renamed",
  STATS_MILESTONE: "stats.milestone",
  REGIME_CHANGED: "regime.changed",
  MIKE_WIN: "mike.win",
  PANIC_HIDDEN: "panic.hidden",
  PANIC_REVEALED: "panic.revealed",
  STREAK_DIED: "streak.died",
  STREAK_MILESTONE: "streak.milestone",
  MARKET_EVENT: "market.event",
  LIMIT_EVENT: "limit.event",
  RAIN_EVENT: "rain.event",
  MOMWEATHER_EVENT: "momweather.event",
};

const listeners = new Map();

export const Bus = {
  on(name, fn) {
    if (typeof fn !== "function") return () => {};
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(fn);
    return () => { const set = listeners.get(name); if (set) set.delete(fn); };
  },
  emit(name, payload) {
    const set = listeners.get(name);
    if (!set) return;
    for (const fn of [...set]) {
      try { fn(payload); } catch (e) {}
    }
  },
};

let currentRegime = "normal";

function transition(to) {
  if (to !== currentRegime) {
    const from = currentRegime;
    currentRegime = to;
    Bus.emit(EVENTS.REGIME_CHANGED, { to, from });
  }
  return currentRegime;
}

export const Regime = {
  current: () => currentRegime,
  evaluate(balanceBB) {
    const desperate = typeof balanceBB === "number" && Number.isFinite(balanceBB) && balanceBB < DESPERATION_THRESHOLD_BB;
    return transition(desperate ? "desperation" : "normal");
  },
  set(to) {
    return transition(to);
  },
};

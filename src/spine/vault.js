import { Bus, EVENTS } from "./bus.js";
import { Mood } from "./mood.js";

const KEY = "hfes_rakeback";
const FEED_RATES_BB = { coinflip: 0.1, roulette: 0.1, crash: 0.1, crates: 0.2 };
const RECALIBRATION_AT_BB = 99.9;
const CLAIM_CEILING_BB = 100;

// #32 (aligning #23's flag with the site convention): the recalibration draw
// is day-seeded deterministic (the mood/identity/market family) — seeded by
// the daily seed + the recalibration index, so the k-th recalibration of a
// given day always lands the same "random" 1–37 BB. The house does not flip
// coins; it schedules them (§5.5).
function seededRecalibrationBB(index) {
  let h = 2166136261 >>> 0;
  const str = Mood.seed() + "#recal#" + index;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; // one avalanche mix, same family as mood.js
  h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0; // JS bitwise XOR returns signed 32-bit — keep it unsigned
  return +(1 + (h % 10000) / 10000 * 36).toFixed(4);
}

function blank() {
  // houseSat is the fifth, display-dim bucket (#31): house-sit fills accrue to
  // the vault under the player's name, to no avail (integration §8). The four
  // game feeds stay the spec'd headline.
  return { bb: 0, recalibrations: 0, feeds: { coinflip: 0, roulette: 0, crash: 0, crates: 0, houseSat: 0 } };
}
function sanitize(v) {
  const base = blank();
  if (!v || typeof v !== "object") return base;
  const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);
  const bb = num(v.bb);
  base.bb = bb !== null && bb > 0 ? bb : 0;
  const rec = num(v.recalibrations);
  base.recalibrations = rec !== null && rec > 0 ? Math.floor(rec) : 0;
  if (v.feeds && typeof v.feeds === "object") {
    for (const k of Object.keys(base.feeds)) {
      const f = num(v.feeds[k]);
      base.feeds[k] = f !== null && f > 0 ? f : 0;
    }
  }
  return base;
}
function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { return blank(); }
}
function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
}

let state = load();
let lastAccrualBB = 0;
const listeners = new Set();

function commit() {
  state = { bb: +state.bb.toFixed(4), recalibrations: state.recalibrations, feeds: state.feeds };
  save(state);
  for (const fn of [...listeners]) {
    try { fn(Vault.get()); } catch (e) {}
  }
}

Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || p.wagered !== true) return;
  const rate = FEED_RATES_BB[p.surface];
  if (!rate) return;
  lastAccrualBB = rate;
  state.feeds[p.surface] = +(state.feeds[p.surface] + rate).toFixed(4);
  state.bb = +(state.bb + rate).toFixed(4);
  if (state.bb >= RECALIBRATION_AT_BB) {
    state.bb = seededRecalibrationBB(state.recalibrations);
    state.recalibrations += 1;
  }
  commit();
});

// #31 retention (integration §8): house-sit fills accrue under the player's
// name, to no avail — 0.1 BB per fill, the generic round rate, into the dim
// houseSat bucket. Same recalibration move as everything else.
Bus.on(EVENTS.MIKE_WIN, (p) => {
  if (!p || p.class !== "house-sat") return;
  lastAccrualBB = 0.1;
  state.feeds.houseSat = +((state.feeds.houseSat || 0) + 0.1).toFixed(4);
  state.bb = +(state.bb + 0.1).toFixed(4);
  if (state.bb >= RECALIBRATION_AT_BB) {
    state.bb = seededRecalibrationBB(state.recalibrations);
    state.recalibrations += 1;
  }
  commit();
});

export const Vault = {
  get() { return { bb: state.bb, recalibrations: state.recalibrations, feeds: { ...state.feeds } }; },
  lastAccrual() { return lastAccrualBB; },
  ceiling() { return CLAIM_CEILING_BB; },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  receiptLine(accruedBB) {
    const a = typeof accruedBB === "number" && Number.isFinite(accruedBB) ? accruedBB : lastAccrualBB;
    return `Rakeback accrued: ${a} BB (vault: ${state.bb.toFixed(1)} / ${CLAIM_CEILING_BB} BB) (claimable: see §1.3)`;
  },
};

// Mom's Little Helper™ Pass — state + the bus-consumer quest engine.
// Canon: docs/spec/battle-pass.md §2/§4/§8; integration-2026 §2 (pass.milestone),
// §3 (round semantics), §6 (sequencing: the XP toast lands after the
// Consolation-Key envelope check), §10.6 (StatTrak pass fields), §10.13
// (house-sit pays no XP — structurally: house-sit fills ride mike.win, never
// round.settled).
//
// Persistence: localStorage `hfes_pass` — {xp, tier, premium, seasonSyncTs,
// daily:{day, quests:[{id,progress,done}]}, seasonal:[...done]} (spec §8).
// The pass consumes bus events + the spine's own counters ONLY (spine rule);
// the one module-level subscription outside the bus is SkinChain.subscribe
// (integration-2026 §2 rules the explorer bus-silent; skinchain/state.js
// documents the seat) and Identity.subscribe for the aiAnalyses counter.
import { Bus, EVENTS } from "../spine/bus.js";
import { Identity } from "../spine/identity.js";
import { SkinChain } from "../skinchain/state.js";
import {
  TIERS, MAX_TIER_IDX, tierIdxForXp, tierPctForXp, seasonRemaining, dayKeyFor,
  applyPassEvent, questTitle, DAILY_QUESTS, SEASONAL_QUESTS, COPY,
} from "./engine.js";

const KEY = "hfes_pass";
const PREMIUM_PRICE_OC = 250; // the custom-name price — the house has one price for identity-flavored vanity

function blank() {
  return { xp: 0, tier: "BRONZE", premium: false, seasonSyncTs: 0, daily: { day: null, quests: [] }, seasonal: [] };
}
function sanitize(v) {
  const base = blank();
  if (!v || typeof v !== "object") return base;
  const num = (x) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0);
  base.xp = Math.floor(num(v.xp));
  base.premium = v.premium === true;
  base.seasonSyncTs = num(v.seasonSyncTs);
  if (v.tier === "SILVER" || v.tier === "GOLD" || v.tier === "PLATINUM" || v.tier === "DIAMOND") base.tier = v.tier;
  else base.tier = TIERS[tierIdxForXp(base.xp)].key;
  if (v.daily && typeof v.daily === "object" && typeof v.daily.day === "string" && Array.isArray(v.daily.quests)) {
    base.daily = {
      day: v.daily.day,
      quests: DAILY_QUESTS.map((q) => {
        const found = v.daily.quests.find((x) => x && x.id === q.id);
        const prog = Math.max(0, Math.min(q.target, Math.floor(num(found && found.progress))));
        return { id: q.id, progress: prog, done: found ? found.done === true || prog >= q.target : false };
      }),
    };
  }
  if (Array.isArray(v.seasonal)) base.seasonal = SEASONAL_QUESTS.map((q) => q.id).filter((id) => v.seasonal.includes(id));
  return base;
}
function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { return blank(); }
}
function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

let state = load();
let wired = false;
let toastFn = null;
let winToastShown = false; // one per session (§2): "no progress (a win teaches nothing)"
let lastAiCount = -1;
const listeners = new Set();

function notify(events = []) {
  const snap = { ...Pass.get(), events };
  for (const fn of [...listeners]) {
    try { fn(snap); } catch (e) {}
  }
}

// Season resync (§5): the countdown resyncs to the full window whenever it
// would reach zero — checked on every pass tick (init + the panel's clock).
function refreshSeason() {
  const { resynced, resyncTs } = seasonRemaining(Date.now(), state.seasonSyncTs);
  if (resynced) {
    state.seasonSyncTs = resyncTs;
    save(state);
    return true;
  }
  return false;
}

// The one write path: normalize the bus fact, run the pure reducer, persist,
// then surface the settled facts in order (XP toast → quest toasts → tier
// milestone), never concurrently with the settle's own theater.
function apply(ev) {
  const day = dayKeyFor(Date.now());
  const beforeXp = state.xp || 0;
  const res = applyPassEvent(state, ev, day);
  state = res.state;
  const seasonMoved = refreshSeason();
  save(state);

  // StatTrak™ mirrors (integration-2026 §10.6: hfes_stats gains passXp,
  // passTier) — max-only writes; the pass ledger (hfes_pass) stays the truth.
  if (res.xpGained > 0) {
    Identity.maxStat("passXp", state.xp);
    Identity.maxStat("passTier", tierIdxForXp(state.xp));
  }

  const events = [];
  if (res.winSeen && !winToastShown) {
    winToastShown = true;
    if (toastFn) toastFn(COPY.winToast);
    events.push({ kind: "win-toast" });
  }
  if (res.xpGained > 0 || events.length || seasonMoved) {
    if (res.xpGained > 0 && toastFn) {
      // The XP toast: faint, honest, in the site-envelope position (§6 —
      // this listener subscribes at init, after identity's module-level
      // listener, so the Consolation-Key check has already landed).
      toastFn(COPY.xpToast(res.xpGained), { faint: true });
    }
    for (const q of res.questsCompleted) {
      if (toastFn) toastFn(COPY.questToast(q.xp, questTitle(q.id, q.id === "lose-25" ? 25 : 1)));
      events.push({ kind: "quest", id: q.id });
    }
    for (const tier of res.tierUps) {
      // §3: tier-ups fire pass.milestone {tier} → ticker line + MOD congrats
      Bus.emit(EVENTS.PASS_MILESTONE, { tier });
      if (toastFn) toastFn(COPY.tierToast(tier));
      events.push({ kind: "milestone", tier });
    }
    notify(events);
  }
  return res;
}

export const Pass = {
  PREMIUM_PRICE_OC,
  init(opts = {}) {
    toastFn = typeof opts.toast === "function" ? opts.toast : null;
    // first sync: the season begins when the house says (which is now)
    if (!state.seasonSyncTs) {
      state.seasonSyncTs = Date.now();
      save(state);
    }
    refreshSeason();
    state = applyPassEvent(state, { type: "noop" }, dayKeyFor(Date.now())).state; // midnight rollover at the door
    save(state);
    wireBus();
    notify([{ kind: "init" }]);
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  get() {
    const idx = tierIdxForXp(state.xp);
    const next = idx >= MAX_TIER_IDX ? null : TIERS[idx + 1];
    return {
      xp: state.xp,
      tierIdx: idx,
      tierKey: TIERS[idx].key,
      tierLabel: TIERS[idx].key + " MOM",
      nextTier: next,
      xpToNext: next ? Math.max(0, next.xp - state.xp) : 0,
      tierPct: tierPctForXp(state.xp),
      maxed: idx >= MAX_TIER_IDX,
      premium: state.premium,
      seasonSyncTs: state.seasonSyncTs,
      daily: (state.daily.quests || []).map((q) => {
        const def = DAILY_QUESTS.find((x) => x.id === q.id);
        return { id: q.id, title: questTitle(q.id, q.progress), progress: q.progress, target: def ? def.target : 1, done: q.done, xp: 20 };
      }),
      seasonal: SEASONAL_QUESTS.map((q) => ({ id: q.id, title: q.title(), done: state.seasonal.includes(q.id), xp: 100 })),
    };
  },
  // The clock the panel rides: re-checks the season resync (lunar) + midnight.
  tick() {
    const moved = refreshSeason();
    const prevDay = state.daily.day;
    state = applyPassEvent(state, { type: "noop" }, dayKeyFor(Date.now())).state;
    save(state);
    if (moved || state.daily.day !== prevDay) notify([{ kind: "clock" }]);
  },
  // 250 OC, once — App owns the OC spend path (the custom-name price, §6);
  // the pass only marks the ledger and discloses with unusual candor.
  buyPremium() {
    if (state.premium) return false;
    state = { ...state, premium: true };
    save(state);
    notify([{ kind: "premium" }]);
    return true;
  },
  __state: () => state,
};

// ---- bus wiring (module lifetime; subscribed at init so ordering after the
// spine's own round.settled listener is guaranteed — §6 sequencing) ---------------
function wireBus() {
  if (wired) return;
  wired = true;

  Bus.on(EVENTS.ROUND_SETTLED, (p) => apply({ type: "settled", p }));
  Bus.on(EVENTS.ROUND_STARTED, (p) => apply({ type: "started", p }));
  Bus.on(EVENTS.ROUND_FORFEIT, (p) => apply({ type: "forfeit", p }));
  Bus.on(EVENTS.DEPOSIT_COMPLETED, () => apply({ type: "deposit" }));
  Bus.on(EVENTS.DILEMMA_SETTLED, (p) => apply({ type: "dilemma", p }));
  Bus.on(EVENTS.MOD_DELETED, (p) => apply({ type: "mod-deleted", tag: p && p.tag, playerTag: Identity.playerTag() }));
  Bus.on(EVENTS.PANIC_REVEALED, (p) => apply({ type: "panic-revealed", rung: p && typeof p.rung === "number" ? p.rung : -1 }));
  // #46 additive signal (integration-2026 leaves the seat open): Trade-Up
  // completion rides market.event as a sixth kind, "trade-up", emitted from
  // App's contract settle point. The ticker's MARKET_EVENT consumer ignores
  // unknown kinds — additive, nothing downstream changes.
  Bus.on(EVENTS.MARKET_EVENT, (p) => apply({ type: "market-event", p }));
  // #46 additive signal, minted per the mod.deleted precedent: a redemption is
  // a settled fact. App's coupon handler emits {mood} (the Generous gate is
  // checked at the owning surface; the reducer double-checks).
  Bus.on(EVENTS.COUPON_REDEEMED, (p) => apply({ type: "coupon-redeemed", mood: p && p.mood }));
  Bus.on(EVENTS.MOOD_CHANGED, (p) => {
    if (!p || !p.crossedMidnight) return;
    apply({ type: "noop" }); // midnight: the dailies reset rides the event's day key
  });

  // "Check the chain" — the explorer is bus-silent by ruling (integration-
  // 2026 §2); a views bump == one explorer open (skinchain/state.js).
  SkinChain.subscribe((_counters, meta) => {
    if (meta && meta.kind === "views") apply({ type: "chain-view" });
  });

  // "Receive 10 AI analyses" — the StatTrak counter is spine-owned; the pass
  // hears the subscription, never the storage (spine rule). The counter is
  // persistent history, so returning players who already crossed 10 complete
  // the quest at init (the analyses concluded whether or not anyone was
  // listening); everything else is a going-forward fact.
  const startStats = Identity.getStats();
  lastAiCount = typeof startStats.aiAnalyses === "number" ? startStats.aiAnalyses : 0;
  if (lastAiCount > 0) apply({ type: "ai-count", n: lastAiCount });
  Identity.subscribe(({ stats }) => {
    const n = stats && typeof stats.aiAnalyses === "number" ? stats.aiAnalyses : 0;
    if (n !== lastAiCount) apply({ type: "ai-count", n });
    lastAiCount = n;
  });
}

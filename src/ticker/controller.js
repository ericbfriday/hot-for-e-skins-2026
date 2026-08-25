// Live-Wins ticker — controller: cadence, regime ownership, event reactions,
// backlog, MARKET/winners furniture. In-memory only (spec §11: the ticker
// persists nothing — seed-derived counters recompute on load).
import { Bus, EVENTS, Regime } from "../spine/bus.js";
import { Mood } from "../spine/mood.js";
import { Identity, RESERVED_CAST, YOU_COLOR } from "../spine/identity.js";
import { DESPERATION_THRESHOLD_BB } from "../spine/constants.js";
import * as E from "./engine.js";
import { createMikeController } from "./mike.js";
import { hfes10, HFES10_FOOTNOTE } from "../games/marketplace.js";

const CAST = Object.fromEntries(RESERVED_CAST.map((c) => [c.name, c]));
const GRACE_COOLDOWN_MS = 60000; // integration §9: one owner (ticker), 60s cooldown, last-wins
const ABANDON_MAX_MS = 30000;    // §5: stranger line within 30s
const PRE_NAG_BAND = 12;         // pre-pressure watch band: 6 < BB ≤ 12
const REARM_MS = 60000;          // §8: re-arms after 60s if BB still < 6

let seq = 0;
let entries = [];
let listeners = new Set();
let balanceBB = 0;
let hidden = false;
let hiddenCount = 0;
let lastPlayerEventAt = Date.now();
let ambientTimer = null;
let nextAmbientAt = 0;
let marketTimer = null;
let marketShown = 0;
let marketLastRaw = 0;
let lastGraceAt = 0;
let graceSuppressed = false;
let sessionDeposit = false;
let prevBalance = Infinity;
let preNagArmed = true;
let rearmTimer = null;
let pendingWhileHidden = [];
let mike = null;

function notify() {
  const snap = Ticker.snapshot();
  for (const fn of [...listeners]) {
    try { fn(snap); } catch (e) {}
  }
}

function addEntry(partial) {
  const entry = { id: ++seq, ts: Date.now(), isYou: false, ...partial };
  entries = [entry, ...entries].slice(0, E.BACKLOG_CAP);
  if (hidden) hiddenCount += 1;
  notify();
  return entry;
}

function castEntry(castName, text, extra = {}) {
  const c = CAST[castName];
  return { text, name: c.name, badge: c.badge, color: c.color, isYou: false, ...extra };
}

function playerTag() { return Identity.playerTag() || "you"; }

// §6: laundering / re-attribution queue-jump ahead of the next ambient slot,
// never within 8s of the player's own line, and never while MOM'S HOME is
// active (the backlog collects them, §9).
function scheduleReaction(fn) {
  if (hidden) { pendingWhileHidden.push(fn); return; }
  setTimeout(fn, E.reattributionDelayMs());
}

// ---- ambient scheduler (§2: one jittered scheduler) ---------------------------
function nextAmbientDelay() {
  const desperate = Regime.current() === "desperation";
  let min, max;
  if (desperate) {
    min = E.CADENCE.desperateMin; max = E.CADENCE.desperateMax;
  } else {
    min = E.CADENCE.baseMin; max = E.CADENCE.baseMax;
    const mood = Mood.word();
    if (mood === "Generous") { min *= E.CADENCE.generousFactor; max *= E.CADENCE.generousFactor; }
    else if (mood === "Vindictive") { min *= E.CADENCE.vindictiveFactor; max *= E.CADENCE.vindictiveFactor; }
  }
  if (hidden) { min *= E.CADENCE.hiddenFactor; max *= E.CADENCE.hiddenFactor; } // §9: doubles while hidden
  let delay = min + Math.random() * (max - min);
  const now = Date.now();
  if (nextAmbientAt > now) delay = Math.max(delay, nextAmbientAt - now + 500); // player pushback
  nextAmbientAt = now + delay;
  return delay;
}

function scheduleAmbient() {
  clearTimeout(ambientTimer);
  ambientTimer = setTimeout(() => {
    try {
      const avoidNames = entries.slice(0, 8).map((e) => e.name).filter(Boolean);
      const entry = E.buildAmbientEntry(Math.random, {
        balanceBB,
        mood: Mood.word(),
        desperate: Regime.current() === "desperation",
        playerTag: playerTag(),
        idleMs: Date.now() - lastPlayerEventAt,
        avoidNames,
      });
      addEntry(entry);
    } finally {
      scheduleAmbient();
    }
  }, nextAmbientDelay());
}

function notePlayerEvent() { lastPlayerEventAt = Date.now(); }

// ---- regime ownership (integration §6: ticker owns the rules, spine stores) ---
function refreshRegime() {
  const desperate = balanceBB < DESPERATION_THRESHOLD_BB;
  const desired = desperate ? "desperation" : (Mood.word() === "Generous" ? "flood" : "normal");
  Regime.set(desired);
}

function onBalance(bb) {
  if (!Number.isFinite(bb)) return;
  prevBalance = balanceBB;
  balanceBB = bb;
  refreshRegime();
  if (!mike) return;
  // Pre-pressure watch: descending into the band above the nag threshold arms
  // Mike's 30–45s pre-pressure cluster (one loss early — the clock can't read
  // minds, only balances).
  if (bb > DESPERATION_THRESHOLD_BB && bb <= PRE_NAG_BAND && prevBalance > PRE_NAG_BAND && preNagArmed && !hidden) {
    preNagArmed = false;
    mike.prePressureCluster();
  }
  if (bb >= 15) preNagArmed = true;
}

// §8: exits on refill completion; re-arms after 60s if BB is still < 6.
function onDepositCompleted(p) {
  sessionDeposit = true;
  preNagArmed = true;
  const wasDesperate = Regime.current() === "desperation";
  clearTimeout(rearmTimer);
  if (wasDesperate) {
    // Exit unconditionally — even if BB is still < 6 (the 60s re-arm covers that);
    // recomputing from balance would re-arm instantly and never exit at all.
    Regime.set(Mood.word() === "Generous" ? "flood" : "normal");
  }
  rearmTimer = setTimeout(() => { if (balanceBB < DESPERATION_THRESHOLD_BB) refreshRegime(); }, REARM_MS);
  return wasDesperate;
}

// Grace line: one owner (the ticker), 60s cooldown, last-trigger-wins. A refill
// completing while excluded suppresses the Desperation-exit grace line; the
// return's line renders alone (integration §9).
function graceLine(force) {
  const now = Date.now();
  if (!force && now - lastGraceAt < GRACE_COOLDOWN_MS) return;
  lastGraceAt = now;
  addEntry({ text: E.bindName(E.LINES.grace, { n: playerTag() }), name: playerTag(), color: YOU_COLOR, isYou: true });
}

// ---- MARKET (HFES-10) + winners counter (§10) ----------------------------------
// #27: the real composite (mean of currentEst/baselineEst across the ten
// catalog skins, indexed from 1,000.00). The displayed index is the running
// max, so it has never gone down; down-ticks render as display errors (§8.9).
function marketTick() {
  const raw = hfes10();
  marketLastRaw = raw;
  if (raw > marketShown) marketShown = raw;
  notify();
}

export const Ticker = {
  init(opts = {}) {
    if (Number.isFinite(opts.balanceBB)) balanceBB = opts.balanceBB;
    mike = createMikeController({
      emitEntry: (e) => addEntry(e),
      isDesperate: () => Regime.current() === "desperation",
      hasSessionDeposit: () => sessionDeposit,
    });
    // Seed the feed so the panel is never empty (nothing survives reload).
    for (let i = 0; i < 3; i++) {
      const entry = E.buildAmbientEntry(Math.random, { balanceBB, mood: Mood.word(), playerTag: playerTag(), idleMs: 0, avoidNames: [] });
      entry.ts = Date.now() - (3 - i) * 5000;
      entry.id = ++seq;
      entries.push(entry);
    }
    entries.reverse();
    refreshRegime();
    marketTick();
    mike.start();
    scheduleAmbient();
    marketTimer = setInterval(marketTick, 45000);
  },

  // §5 emit API: one function. Unset name/color default to a fresh ambient tag;
  // isYou defaults gold + the player tag. The ticker owns cadence, timestamps,
  // caps, styling.
  emitTicker(partial = {}) {
    let entry = { ...partial };
    if (!entry.name || !entry.color) {
      if (entry.isYou) {
        entry.name = entry.name || playerTag();
        entry.color = entry.color || YOU_COLOR;
      } else {
        entry.name = entry.name || E.ambientName(entries.slice(0, 8).map((e) => e.name).filter(Boolean));
        entry.color = entry.color || E.ambientColor();
      }
    }
    const out = addEntry(entry);
    if (entry.isYou) {
      notePlayerEvent();
      // §2: the house lets you read about yourself.
      nextAmbientAt = Math.max(nextAmbientAt, Date.now()) + E.CADENCE.playerPushbackMs;
    }
    return out;
  },

  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },

  snapshot() {
    const shown = Math.max(1000, marketShown);
    const downTick = marketLastRaw < shown;
    return {
      entries,
      desperate: Regime.current() === "desperation",
      marketLabel: "MARKET (HFES-10): " + shown.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ▲",
      marketDelta: downTick ? "▲ −0.4% (display error, §8.9)" : null, // the index has never gone down
      marketFootnote: HFES10_FOOTNOTE,
      winnersToday: E.winnersToday(Mood.seed()),
      winnersHover: E.LINES.winnersHover,
      footer: E.LINES.footer,
      hiddenCount,
    };
  },

  // For #28 (panic): the welcome-back modal's missed-summary fabricates from
  // seed + elapsed time (panic §6); the feed is fiction either way.
  missedSummary(hiddenMs) { return E.missedTickerSummary(Mood.seed(), hiddenMs); },

  balance() { return balanceBB; },
};

// ---- bus wiring (module lifetime, like the spine's own subscriptions) ---------
Bus.on(EVENTS.SESSION_STARTED, (p) => {
  if (p && Number.isFinite(p.balanceBB)) onBalance(p.balanceBB);
});

Bus.on(EVENTS.IDENTITY_ASSIGNED, () => {
  notePlayerEvent();
  Ticker.emitTicker({ text: E.bindName(E.LINES.join, { n: playerTag() }), isYou: true });
});

Bus.on(EVENTS.BB_SPENT, (p) => { if (p && Number.isFinite(p.balanceBB)) onBalance(p.balanceBB); });
Bus.on(EVENTS.BB_CREDITED, (p) => { if (p && Number.isFinite(p.balanceBB)) onBalance(p.balanceBB); });

// Regime transitions re-render the panel (Desperation subtitle owns its slot,
// integration §6) even when no feed entry lands at the same moment.
Bus.on(EVENTS.REGIME_CHANGED, () => notify());

Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p) return;
  notePlayerEvent();
  const tag = playerTag();
  const line = E.playerLineForSettled(p, tag);
  if (line) Ticker.emitTicker(line);

  // §6 win laundering: your losses are recycled into the feed as other people's
  // wins — the exact amount lost, footnote (coincidence).
  const net = typeof p.netBB === "number" ? p.netBB : 0;
  if (p.wagered !== false && net <= -1) {
    const amount = Math.abs(net);
    scheduleReaction(() => {
      const stranger = E.ambientName(entries.slice(0, 8).map((e) => e.name).filter(Boolean));
      addEntry({ text: E.clipLine(E.bindName(E.LINES.laundering, { n: stranger, bb: amount, game: p.surface || "the house" })), name: stranger, color: E.ambientColor(), isYou: false, note: E.LINES.launderingNote });
    });
  }
  // §6 near-miss re-attribution: the exact item you just nearly won, won by
  // someone else while you watch. The player can never nearly win the Karambit
  // (it appears on no reel); only strangers nearly win it.
  if (p.kind === "near-miss" && p.nearMissItem) {
    const item = p.nearMissItem;
    scheduleReaction(() => {
      const stranger = E.ambientName(entries.slice(0, 8).map((e) => e.name).filter(Boolean));
      addEntry({ text: E.clipLine(E.bindName(E.LINES.reattribution, { n: stranger, item })), name: stranger, color: E.ambientColor(), isYou: false });
    });
  }
});

Bus.on(EVENTS.ASKMOM_OPENED, () => {
  notePlayerEvent();
  mike.depositCluster(); // §7: the Karambit bursts the moment the flow opens
});

Bus.on(EVENTS.ASKMOM_ABANDONED, () => {
  notePlayerEvent();
  setTimeout(() => {
    if (hidden) return;
    const stranger = E.ambientName(entries.slice(0, 8).map((e) => e.name).filter(Boolean));
    addEntry({ text: E.clipLine(E.bindName(E.LINES.abandonedStranger, { n: stranger })), name: stranger, color: E.ambientColor(), isYou: false });
  }, 12000 + Math.random() * (ABANDON_MAX_MS - 13000));
});

Bus.on(EVENTS.DEPOSIT_COMPLETED, (p) => {
  notePlayerEvent();
  // §5: the old ambient lie, now literally true — plus MOM's proud line.
  Ticker.emitTicker({ text: E.bindName(E.DEPOSIT_TRIUMPH_TEMPLATES[0], { n: playerTag() }), isYou: true });
  addEntry(castEntry("MOM", "is proud of " + playerTag() + " (maternally)"));
  if (p && p.firstEver) {
    addEntry({ ...castEntry("MOMCODE_MIKE", "just 47x'd Mom's Visa — you're next (code MOM)"), note: E.MIKE_DISCLOSURE });
    Bus.emit(EVENTS.MIKE_WIN, { class: "streak", k: mike.k() });
  }
  if (p && p.packageId === "moms-max") {
    Ticker.emitTicker({ text: E.bindName(E.LINES.momsMaxPurchased, { n: playerTag() }), isYou: true });
    addEntry({ ...castEntry("MOMCODE_MIKE", playerTag() + " went Max. Respect. (code MOM)"), note: E.MIKE_DISCLOSURE });
  }
  const wasDesperate = onDepositCompleted(p);
  if (wasDesperate) {
    if (hidden) graceSuppressed = true; // integration §9: the return's line renders alone
    else graceLine();
  }
});

Bus.on(EVENTS.STATS_MILESTONE, (p) => {
  if (!p) return;
  if (p.field === "usdBorrowed") {
    addEntry(castEntry("MOM", "noticed " + playerTag() + " crossed $" + p.value + " of her money (VIP review requested)"));
  } else {
    addEntry(castEntry("MOM", "noticed " + playerTag() + " (statistically)"));
  }
});

Bus.on(EVENTS.MOOD_CHANGED, (p) => {
  if (!p || !p.crossedMidnight) return;
  addEntry({ system: true, text: E.fill(E.LINES.moodSystem, { mood: p.word }), color: E.SYSTEM_COLOR });
  // Mom Coupon day-flip pre-pressure moment (the #26-flagged clock).
  if (balanceBB < 15) mike.prePressureCluster();
});

// ---- panic backlog (§9): the feed keeps accumulating, timestamps on everything.
Bus.on(EVENTS.PANIC_HIDDEN, () => {
  hidden = true;
  hiddenCount = 0;
  graceSuppressed = false;
  nextAmbientAt = 0; // the +6s "read about yourself" pushback dies with visibility
  scheduleAmbient(); // re-arm the clock at the doubled hidden cadence
});

Bus.on(EVENTS.PANIC_REVEALED, () => {
  hidden = false;
  if (hiddenCount > 0) {
    addEntry({ system: true, divider: true, text: E.fill(E.LINES.divider, { k: hiddenCount }), color: E.SYSTEM_COLOR });
  }
  const flush = pendingWhileHidden;
  pendingWhileHidden = [];
  for (const fn of flush) fn();
  if (graceSuppressed) { graceSuppressed = false; graceLine(true); }
  scheduleAmbient();
});

// ---- marketplace settlement lines (#27 owns this copy; marketplace spec §5–6/§9)
Bus.on(EVENTS.MARKET_EVENT, (p) => {
  if (!p) return;
  if (p.kind === "rollback") {
    // §9 verbatim.
    addEntry({ system: true, text: "Scheduled maintenance: 1 (one) item was never yours.", color: E.SYSTEM_COLOR });
  } else if (p.kind === "sold") {
    // §6: listing "sold" at full asking — proceeds credited to Escrow, never BB.
    Ticker.emitTicker({ text: "sold " + (p.item || "an item") + " — credited to Escrow (converts to withdrawal queue)", isYou: true });
    addEntry(castEntry("AdminTradeBot_69", "settlement complete. the BB were always conceptual (§6.1)"));
  } else if (p.kind === "instant-sold") {
    // §5 receipt family.
    Ticker.emitTicker({ text: "Instant Sell™: " + (p.item || "an item") + " → " + (p.bb || 1) + " BB. The difference covers administrative realism.", isYou: true });
  } else if (p.kind === "lowball") {
    // §6: the one offer, ever.
    Ticker.emitTicker({ text: "received an offer: 0.02 BB + exposure. Final offer.", isYou: true });
    addEntry(castEntry("AdminTradeBot_69", "acquired " + (p.item || "an item") + " (0.02 BB + exposure)"));
  } else if (p.kind === "listed") {
    Ticker.emitTicker({ text: "listed " + (p.item || "an item") + " (0 views and holding)", isYou: true });
  }
});

// #28 panic: forfeit line (panic §5 verbatim family).
Bus.on(EVENTS.ROUND_FORFEIT, () => {
  notePlayerEvent();
  Ticker.emitTicker({ text: E.bindName(E.LINES.forfeit, { n: playerTag() }), isYou: true });
});

// #31 retention: streak obituary + the ±30min Mike heater window.
Bus.on(EVENTS.STREAK_DIED, (p) => {
  addEntry({ system: true, text: E.fill(E.LINES.obituary, { n: playerTag(), days: (p && p.days) || 1 }), color: E.SYSTEM_COLOR });
  mike.onStreakDied();
});

// #29 self-limit: ticker reactions per the spec §6 table + integration §3.
// System lines dim; the exclusion burst's lines 2–3 wear gold with the
// "(you, excluded)" suffix (cast-scripted entries, §9 — the ratio holds).
Bus.on(EVENTS.LIMIT_EVENT, (p) => {
  if (!p) return;
  const tag = playerTag();
  if (p.kind === "deposit-limit-enabled") {
    addEntry({ system: true, text: E.fill(E.LINES.limitEnabled, { n: tag, limit: p.detail || "limit" }), color: E.SYSTEM_COLOR });
  } else if (p.kind === "reminder-enabled") {
    addEntry({ system: true, text: E.fill(E.LINES.reminderEnabled, { n: tag }), color: E.SYSTEM_COLOR });
  } else if (p.kind === "break-complete") {
    addEntry({ system: true, text: E.fill(E.LINES.breakComplete, { n: tag }), color: E.SYSTEM_COLOR });
  } else if (p.kind === "excluded") {
    // §4 verbatim: the moment exclusion completes, a 3-line house-sit burst.
    // The name field renders first (identity §9), so gold lines 2–3 lead with
    // the verb — the tag comes from the entry's name, suffixed (you, excluded).
    addEntry({ ...castEntry("MOMCODE_MIKE", "will be filling in for " + tag + " (the code is MOM)"), note: E.MIKE_DISCLOSURE });
    setTimeout(() => {
      Ticker.emitTicker({ text: "won " + E.anchorBB(999) + " BB (house-sat) (withdrawal pending)", isYou: true, youLabel: "(you, excluded)" });
    }, 700);
    setTimeout(() => {
      Ticker.emitTicker({ text: "deposited Mom's Max (house-sat) (excluded players deposit 40% more)", isYou: true, youLabel: "(you, excluded)" });
    }, 1400);
  } else if (p.kind === "return") {
    // Integration §9: the grace line has one owner (the ticker), 60s cooldown,
    // last-trigger-wins — the return's line renders alone.
    graceLine();
  }
});

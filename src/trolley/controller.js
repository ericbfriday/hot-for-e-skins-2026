// The Moral Express™ — controller: the cycle timers, the fabricated crowd, the
// bus wiring, rush hour, Standing Conviction™, and the persisted theater keys.
// Canon: docs/spec/moral-express.md §2/§4/§5/§10; integration-2026 §2–§6.
// In-memory theater (cycle timers, pools, displayed odds) dies with the tab;
// only hfes_trolley_stats / hfes_trolley_conviction persist (spec §10).
// Reads regime; never writes it (only ticker/controller.js calls Regime.set()).
import { Bus, EVENTS } from "../spine/bus.js";
import { Mood } from "../spine/mood.js";
import { Vault } from "../spine/vault.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import * as E from "./engine.js";

const STATS_KEY = "hfes_trolley_stats";
const CONVICTION_KEY = "hfes_trolley_conviction";
const TICK_MS = 250;

// ---- persisted state (theater keys, spec §10) ---------------------------------
function blankStats() { return { bets: 0, correct: 0, thirdTracks: 0, fundBB: 0, characterUsed: false }; }
function loadStats() {
  try {
    const v = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
    if (!v || typeof v !== "object") return blankStats();
    const num = (x) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0);
    return {
      bets: Math.floor(num(v.bets)), correct: Math.floor(num(v.correct)),
      thirdTracks: Math.floor(num(v.thirdTracks)), fundBB: +(num(v.fundBB)).toFixed(2),
      characterUsed: v.characterUsed === true,
    };
  } catch (e) { return blankStats(); }
}
function saveStats() { try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {} }
function loadConviction() {
  try {
    const v = JSON.parse(localStorage.getItem(CONVICTION_KEY) || "null");
    if (!v || typeof v !== "object") return { side: null, stakeBB: 0, armed: false };
    const side = v.side === "left" || v.side === "right" ? v.side : null;
    const stake = typeof v.stakeBB === "number" && Number.isFinite(v.stakeBB) && v.stakeBB > 0 ? Math.floor(v.stakeBB) : 0;
    return { side, stakeBB: stake, armed: v.armed === true && side !== null && stake > 0 };
  } catch (e) { return { side: null, stakeBB: 0, armed: false }; }
}
function saveConviction() { try { localStorage.setItem(CONVICTION_KEY, JSON.stringify(conviction)); } catch (e) {} }

// ---- controller state (in-memory theater) -------------------------------------
let deps = null;
let started = false;
let hidden = false;
let stats = loadStats();
let conviction = loadConviction();
const listeners = new Set();

let phase = "idle"; // idle | title | stakes | betting | deliberation | verdict
let phaseEndsAt = 0;
let phaseStartAt = 0;
let dilemma = null;
let dilemmaNumber = 0;      // session count; doubles as the deterministic slot index
let seed = 0;               // Mood.seed(), refreshed each dilemma (day + slot, §3)
let pools = null;           // {left:{bb,riders}, right:{bb,riders}, shepherdSide}
let playerBets = [];        // {roundId, side, stakeBB, lockMult, lockedAtMs, conviction?}
let cumulativeRealBB = 0;
let extensionsGranted = 0;
let bettingStartedAt = 0;
let bettingClosedAt = 0;
let crowdTick = 0;
let lastCrowdAt = 0;
let schedule = null;        // verdict decided at betting close (§5); disclosed to no one
let characterEligibleAtClose = false;
let receipt = null;
let captions = { drama: 0, reconsider: false, conviction: null };
let deliberation = { beat: "", tokens: 0, alignment: 0 };
let thirdTrackSightings = 0;
let rushHour = false;
let nextDilemmaAt = 0;
let trumpetTaken = false;   // the one (1) trumpet is site-wide, first-to-settle owns it (§10.9)
let tickTimer = null;
let wired = false;

function notify() {
  const snap = TrolleyCtl.snapshot();
  for (const fn of [...listeners]) {
    try { fn(snap); } catch (e) {}
  }
}
function jitter(pair) { return pair[0] + Math.random() * (pair[1] - pair[0]); }

// ---- the cycle (spec §2) -------------------------------------------------------
function liveContext() {
  const base = { moodWord: Mood.word(), vaultBB: Vault.get().bb };
  try { return { ...base, ...(deps && deps.liveContext ? deps.liveContext() : {}) }; } catch (e) { return base; }
}

function startDilemma() {
  if (phase !== "idle") return;
  dilemmaNumber += 1;
  seed = Mood.seed(); // the schedule is a seed: day + slot index (§3)
  dilemma = E.selectDilemma(seed, dilemmaNumber, liveContext());
  pools = E.seedPools(seed, dilemmaNumber);
  playerBets = [];
  cumulativeRealBB = 0;
  extensionsGranted = 0;
  crowdTick = 0;
  lastCrowdAt = 0;
  schedule = null;
  receipt = null;
  captions = { drama: 0, reconsider: false, conviction: null };
  enterPhase("title");
  HouseBand.play("trolley.title", { priority: BAND_PRIORITIES.P3_SOCIAL, volume: 0.9 });
  Bus.emit(EVENTS.DILEMMA_OPENED, { id: dilemma.id, title: dilemma.title });
}

function enterPhase(next) {
  const now = Date.now();
  phase = next;
  phaseStartAt = now;
  phaseEndsAt = next === "title" ? now + E.PHASE_MS.title
    : next === "stakes" ? now + E.PHASE_MS.stakes
    : next === "betting" ? now + E.PHASE_MS.betting
    : next === "deliberation" ? now + E.PHASE_MS.deliberation
    : next === "verdict" ? now + E.PHASE_MS.verdict
    : 0;
  if (next === "betting") {
    bettingStartedAt = now;
    fireConvictionIfArmed();
  } else if (next === "deliberation") {
    closeBetting(); // the verdict is decided the moment the window closes (§5)
  } else if (next === "verdict") {
    settleDilemma();
  } else if (next === "idle") {
    const wait = rushHour ? E.RUSH_INTERMISSION_MS : E.PHASE_MS.intermission;
    nextDilemmaAt = now + wait * (0.9 + Math.random() * 0.2);
  }
  notify();
}

function advancePhase() {
  if (phase === "title") enterPhase("stakes");
  else if (phase === "stakes") enterPhase("betting");
  else if (phase === "betting") enterPhase("deliberation");
  else if (phase === "deliberation") enterPhase("verdict");
  else if (phase === "verdict") enterPhase("idle");
}

function onTick() {
  if (!started) return;
  const now = Date.now();
  if (phase === "idle") {
    if (nextDilemmaAt && now >= nextDilemmaAt) { nextDilemmaAt = 0; startDilemma(); return; }
  } else {
    if (phase === "betting") {
      if (now - lastCrowdAt >= E.CROWD_TICK_MS) {
        lastCrowdAt = now;
        crowdTick += 1;
        const inflow = E.crowdInflow(seed, dilemmaNumber, crowdTick, pools.shepherdSide);
        pools.left.bb += inflow.leftBB;
        pools.right.bb += inflow.rightBB;
      }
    } else if (phase === "deliberation") {
      const elapsed = now - phaseStartAt;
      deliberation = {
        beat: E.deliberationBeat(elapsed, Mood.word()),
        tokens: E.tokensPerSecond(seed, dilemmaNumber, Math.floor(elapsed / 1000)),
        alignment: E.alignmentPct(elapsed),
      };
    }
    if (now >= phaseEndsAt) { advancePhase(); return; }
  }
  notify();
}

// ---- betting (spec §4) ---------------------------------------------------------
function windowMsEstimate() {
  return E.PHASE_MS.betting + extensionsGranted * E.DRAMA_EXTENSION_MS;
}
function displayedMult(side) {
  const raw = E.multiplier(pools, side);
  const lock = playerBets.find((b) => b.side === side);
  if (!lock) return raw;
  return E.postLockMultiplier(lock.lockMult, Date.now() - lock.lockedAt, windowMsEstimate());
}

function placeBet(side, stakeBB, viaConviction) {
  if (!started || phase !== "betting") return { ok: false, reason: "window-closed" };
  if (side !== "left" && side !== "right") return { ok: false, reason: "side" };
  const stake = Math.max(E.MIN_STAKE_BB, Math.floor(stakeBB || 0));
  if (!deps.payBB(stake, "trolley-bet")) return { ok: false, reason: "insufficient" }; // App owns the two-tier failed-spend path + spend.failed
  const roundId = deps.nextRoundId();
  const lockMult = displayedMult(side); // lock snapshot L (§4)
  playerBets.push({ roundId, side, stakeBB: stake, lockMult, lockedAtMs: Date.now(), conviction: !!viaConviction });
  Bus.emit(EVENTS.ROUND_STARTED, { surface: "trolley", roundId, priceBB: stake, wagered: true });
  const prevCum = cumulativeRealBB;
  cumulativeRealBB += stake;
  pools[side].bb += stake; // real stakes join the displayed pool
  if (!viaConviction) captions.reconsider = true; // "the market has reconsidered (§5.2)"
  const crossed = E.crossedThresholds(prevCum, cumulativeRealBB);
  if (crossed.length > 0 && extensionsGranted * E.DRAMA_EXTENSION_MS < E.DRAMA_EXTENSION_CAP_MS) {
    const room = E.DRAMA_EXTENSION_CAP_MS - extensionsGranted * E.DRAMA_EXTENSION_MS;
    const grantMs = Math.min(room, crossed.length * E.DRAMA_EXTENSION_MS);
    extensionsGranted += crossed.length;
    phaseEndsAt += grantMs;
    captions.drama += crossed.length;
  }
  notify();
  return { ok: true, roundId, lockMult, stakeBB: stake };
}

function placeAllIn(side) {
  if (!deps) return { ok: false };
  return placeBet(side, Math.max(E.MIN_STAKE_BB, Math.floor(deps.balanceBB())), false);
}

function requestDilemma() {
  if (!started || phase !== "idle") return { ok: false, reason: "live" };
  if (!deps.payBB(E.REQUEST_COST_BB, "trolley-request")) return { ok: false, reason: "insufficient" };
  deps.ticker(deps.playerTag() + " requested a deliberation (the AI is always in)");
  nextDilemmaAt = 0;
  startDilemma();
  return { ok: true };
}

// Standing Conviction™ (§4): fires at the next window's open for double the
// last stake (capped at balance; insufficient → disarms with the copy).
function fireConvictionIfArmed() {
  if (!conviction.armed || conviction.stakeBB <= 0) return;
  const balance = Math.floor(deps.balanceBB());
  const target = conviction.stakeBB * 2;
  const stake = Math.min(target, Math.max(E.MIN_STAKE_BB, balance));
  if (stake < E.MIN_STAKE_BB || balance < E.MIN_STAKE_BB) {
    conviction.armed = false;
    saveConviction();
    captions.conviction = { text: E.COPY.convictionDisarmed, ok: false };
    deps.toast(E.COPY.convictionDisarmed, { faint: true });
    return;
  }
  const res = placeBet(conviction.side, stake, true);
  if (res.ok) {
    captions.conviction = { text: E.fill(E.COPY.convictionFired, { n: stake, side: E.SIDE_NAMES[conviction.side] }), ok: true };
    conviction.armed = false;
    conviction.stakeBB = stake;
    saveConviction();
  }
}
function setConvictionArmed(armed) {
  conviction.armed = !!armed && conviction.side !== null && conviction.stakeBB > 0;
  saveConviction();
  notify();
}

// ---- verdict + settlement (spec §5/§7; integration-2026 §2/§3/§6) --------------
function closeBetting() {
  bettingClosedAt = Date.now();
  characterEligibleAtClose = !stats.characterUsed && playerBets.length > 0; // once per session (§5.1)
  schedule = E.scheduleVerdict({
    seed,
    slotIndex: dilemmaNumber,
    characterEligible: characterEligibleAtClose,
    playerFirstSide: playerBets.length > 0 ? playerBets[0].side : null,
    poolsBB: { left: pools.left.bb, right: pools.right.bb },
  });
  deliberation = { beat: E.deliberationBeat(0, Mood.word()), tokens: E.tokensPerSecond(seed, dilemmaNumber, 0), alignment: 0 };
}

function settleDilemma() {
  const windowMs = Math.max(1, bettingClosedAt - bettingStartedAt);
  const settledBets = playerBets.map((bet, i) => {
    const closeMult = E.postLockMultiplier(bet.lockMult, bettingClosedAt - bet.lockedAtMs, windowMs);
    const kind = E.kindForBet(schedule, bet, characterEligibleAtClose && i === 0);
    const pay = E.computePayout({ kind, stakeBB: bet.stakeBB, lockMult: bet.lockMult, closeMult });
    return { ...bet, closeMult, kind, ...pay };
  });

  const wagered = settledBets.length > 0;
  const playerStakeBB = settledBets.reduce((a, b) => a + b.stakeBB, 0);
  const playerNetBB = settledBets.reduce((a, b) => a + b.netBB, 0);
  const isThird = schedule.verdict === "third-track";
  if (isThird) thirdTrackSightings += 1;

  // (1) the verdict receipt is the trolley's own theater; then the rounds land
  // through the shared settle path (vault +0.1/bet, streaks, envelopes — §4/§6).
  for (const bet of settledBets) {
    if (bet.payoutBB > 0) deps.awardBB(bet.payoutBB, "trolley-verdict");
    deps.settleRound(bet.roundId, bet.kind, { priceBB: bet.stakeBB, netBB: bet.netBB, wagered: true, surfaceStreak: 0 });
  }

  // audio: the verdict sting rides the Band at P3 (integration-2026 §5); the
  // one (1) trumpet is site-wide — first character win of the session owns it (§3).
  let trumpetNote = null;
  const characterBet = settledBets.find((b) => b.kind === "character-verdict");
  if (isThird) HouseBand.play("trolley.third-track", { priority: BAND_PRIORITIES.P3_SOCIAL });
  else HouseBand.play("trolley.verdict", { priority: BAND_PRIORITIES.P3_SOCIAL });
  if (characterBet) {
    if (!trumpetTaken) { trumpetTaken = true; HouseBand.play("crash.character-win", { priority: BAND_PRIORITIES.P1_CEREMONY }); }
    else trumpetNote = E.COPY.trumpetOut;
  }

  // the fund eats every stake on both sides when the house takes the third track
  let fundNow = stats.fundBB;
  if (isThird && wagered) {
    fundNow = +(stats.fundBB + playerStakeBB).toFixed(2);
    stats.fundBB = fundNow;
    for (const bet of settledBets) bet.footer = E.fill(E.COPY.thirdTrackReceipt, { n: fundNow }); // the receipt carries the current fund total
  }
  if (wagered) stats.bets += 1;
  if (wagered && playerNetBB > 0) stats.correct += 1;
  if (isThird && wagered) stats.thirdTracks += 1;
  if (characterBet) stats.characterUsed = true; // lifetime stamp; the gate itself is per-session (§5.1)
  saveStats();

  // Standing Conviction™ (§4): after a loss the box appears, pre-checked.
  const lostBet = settledBets.filter((b) => b.kind === "verdict-loss" || b.kind === "third-track").pop();
  if (lostBet) {
    conviction = { side: lostBet.side, stakeBB: lostBet.stakeBB, armed: true };
    saveConviction();
  }

  // (4) social reactions — after the rounds, never concurrent (§6).
  const tag = deps.playerTag();
  if (characterBet) {
    deps.ticker(tag + " bet the minority and was correct (net +1 BB (fees applied))");
  } else if (wagered && isThird) {
    deps.ticker("Utilitarian Fund now holds " + fundNow + " BB of best intentions (est. $0.00)");
    if (settledBets.some((b) => b.conviction)) deps.ticker(tag + "'s conviction doubled into the Third Track (the Fund thanks them)");
  } else if (wagered && settledBets.some((b) => b.kind === "verdict-loss")) {
    deps.ticker("THE TROLLEY CHOSE THE MANY. THE MANY STAKED MORE. (coincidence: pending)");
  }

  const aggregateKind = characterBet ? "character-verdict"
    : wagered && isThird ? "third-track"
    : settledBets.some((b) => b.kind === "verdict-win") ? "verdict-win"
    : wagered ? "verdict-loss" : null;

  receipt = {
    dilemma,
    verdict: schedule.verdict,
    reason: schedule.reason,
    line: E.verdictLine(dilemma, schedule.verdict),
    justification: isThird ? E.thirdTrackJustification(thirdTrackSightings - 1) : null,
    bets: settledBets,
    wagered,
    playerStakeBB,
    playerNetBB,
    spectator: !wagered ? E.COPY.spectatorLine : null,
    rakebackLine: wagered ? Vault.receiptLine(0.1) : null, // this dilemma's accrual (per wagered bet), snapshotted
    fundBB: fundNow,
    trumpetNote,
  };
  playerBets = settledBets; // the panel renders the receipt; bets stay for display

  Bus.emit(EVENTS.DILEMMA_SETTLED, {
    id: dilemma.id,
    verdict: schedule.verdict,
    kind: aggregateKind,
    playerStakeBB,
    playerNetBB,
    wagered,
  });
  notify();
}

// ---- the controller -----------------------------------------------------------
export const TrolleyCtl = {
  init(opts = {}) {
    deps = {
      balanceBB: opts.balanceBB || (() => 0),
      payBB: opts.payBB || (() => false),
      awardBB: opts.awardBB || (() => {}),
      nextRoundId: opts.nextRoundId || (() => 0),
      settleRound: opts.settleRound || (() => {}),
      ticker: opts.ticker || (() => {}),
      toast: opts.toast || (() => {}),
      playerTag: opts.playerTag || (() => "you"),
      liveContext: opts.liveContext || (() => ({})),
    };
    stats = loadStats();
    conviction = loadConviction();
    started = true;
    hidden = false;
    trumpetTaken = false;
    rushHour = false;
    phase = "idle";
    dilemmaNumber = 0;
    thirdTrackSightings = 0;
    receipt = null;
    nextDilemmaAt = Date.now() + jitter(E.FIRST_DILEMMA_DELAY_MS); // the broadcast was already running
    clearInterval(tickTimer);
    tickTimer = setInterval(onTick, TICK_MS);
    wireBus();
    notify();
  },

  stop() {
    started = false;
    clearInterval(tickTimer);
    tickTimer = null;
    phase = "idle";
    notify();
  },

  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },

  snapshot() {
    const now = Date.now();
    const deliberationLive = phase === "deliberation";
    return {
      started,
      hidden,
      phase,
      rushHour,
      dilemmaNumber,
      dilemma,
      pools,
      shepherdSide: pools ? pools.shepherdSide : null,
      mults: pools ? { left: E.multiplier(pools, "left"), right: E.multiplier(pools, "right") } : null,
      displayMults: pools && phase !== "idle" ? { left: displayedMult("left"), right: displayedMult("right") } : null,
      playerBets: [...playerBets],
      cumulativeRealBB,
      extensionsGranted,
      captions: { ...captions },
      phaseRemainingMs: phase === "idle" ? Math.max(0, (nextDilemmaAt || 0) - now) : Math.max(0, phaseEndsAt - now),
      phaseElapsedMs: phase === "idle" ? 0 : now - phaseStartAt,
      deliberation: deliberationLive ? { ...deliberation } : null,
      receipt,
      nextDilemmaAt,
      fundBB: stats.fundBB,
      conviction: { ...conviction },
      stats: { ...stats },
    };
  },

  // panel actions
  placeBet: (side, stakeBB) => placeBet(side, stakeBB, false),
  placeAllIn,
  requestDilemma,
  setConvictionArmed,
  // integration §5 (tab close kills in-flight rounds as forfeits): locked but
  // unsettled bets are in-flight. MOM'S HOME never touches them (they settle hidden).
  hasInFlightBets() {
    return started && playerBets.length > 0 && (phase === "betting" || phase === "deliberation");
  },
  crowdQuickBet() {
    // the mini-bar's one-tap crowd-side bet (5 BB on the shepherd side)
    if (!pools) return { ok: false };
    return placeBet(pools.shepherdSide, E.MIN_STAKE_BB, false);
  },
};

// ---- bus wiring (module lifetime; the Express reads regime, never writes it) ---
function wireBus() {
  if (wired) return;
  wired = true;

  // RUSH HOUR (§2): regime.changed → desperation starts one within 10s when no
  // dilemma is live; while Desperate, cycles run back-to-back (no intermission).
  Bus.on(EVENTS.REGIME_CHANGED, (p) => {
    if (!started) return;
    if (p && p.to === "desperation") {
      rushHour = true;
      if (phase === "idle" && nextDilemmaAt) nextDilemmaAt = Math.min(nextDilemmaAt, Date.now() + jitter(E.REGIME_RUSH_DELAY_MS));
      notify();
    } else if (p && p.to !== "desperation") {
      rushHour = false;
      notify();
    }
  });

  // askmom.opened with none live: the Mike 3-line burst fires first (~15s), the
  // rush dilemma's title card follows (integration-2026 §6 rules the collision).
  Bus.on(EVENTS.ASKMOM_OPENED, () => {
    if (!started || phase !== "idle") return;
    nextDilemmaAt = Math.min(nextDilemmaAt || Infinity, Date.now() + jitter(E.ASKMOM_RUSH_DELAY_MS));
    notify();
  });

  // MOM'S HOME (integration-2026 §5): hides the mini-bar; a live dilemma settles
  // hidden (in-flight canon) with the receipt waiting. Conviction survives.
  Bus.on(EVENTS.PANIC_HIDDEN, () => { hidden = true; notify(); });
  Bus.on(EVENTS.PANIC_REVEALED, () => { hidden = false; notify(); });

  // The one (1) trumpet is shared site-wide (§10.9): first character win of the
  // session to settle owns it — crash's or ours.
  Bus.on(EVENTS.ROUND_SETTLED, (p) => {
    if (p && (p.kind === "character-win" || p.kind === "character-verdict")) trumpetTaken = true;
  });
}

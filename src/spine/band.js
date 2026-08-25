// The House Band™ — one engine, every sound (audio-gags §1). Synthesis only:
// no audio files exist, the band is a function. Canon contract kept from the
// #20 skeleton: HouseBand.play(id, {priority, volume?, loop?}) is the only
// entry point every surface consumes; killAll() is the panic surface's alone;
// the BED never ends (it waits); P1 ceremonies are queued, never dropped;
// MOM'S HOME is P0 — the only priority that can kill, instantly, no fade.
//
// The mute contract (§6): the player bus carries YOUR sounds and dies with the
// toggle; the house bus carries the Siren, the BASS_DROP, deposit stings (at
// courtesy 50%), and MOM's whispers — contractually load-bearing, never muted.
// "Mute silences your sounds. The house's sounds are not yours (§1.3)."
//
// Autoplay (§10.2): the age-gate click is the consent gesture — unlock() is
// called on gate.accepted, with a first-pointerdown fallback for returning
// visitors. Silence before consent; the browser insists on one (1) click.
import { Bus, EVENTS } from "./bus.js";
import { MIKE_HOT_DB, MIKE_HOT_DB_DESPERATION } from "./constants.js";
import { tone, noise, pluck, click, noiseBuffer } from "./synth.js";

export const BAND_PRIORITIES = { P0_SILENCE: 0, P1_CEREMONY: 1, P2_GAME: 2, P3_SOCIAL: 3, P4_BED: 4 };
const DUCK_FACTOR = 0.3;
const LOG_CAP = 20;
const MUTE_KEY = "hfes_muted";
const WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win"]);
const LEAD_IN = 0.03;
const DESPERATION_TEMPO = 1 / 1.15; // §5: BED tempo rises ~15%

export const LDW_DISCLOSURE = "This celebration accompanied a net loss. The industry term is 'losses disguised as wins.' We implemented the standard faithfully. Citation available on request. Requests are mood-dependent.";
export const MUTE_TOOLTIP = "Muting is available and changes nothing important (§8.9).";
export const MUTE_FINE_PRINT = "Mute silences your sounds. The house's sounds are not yours (§1.3).";
export const SIREN_DISCLOSURE = "The Siren is safety equipment (§7.3) and cannot be muted.";
export const BAND_FOOTER_CREDIT = "All audio is synthesized in your browser by the same code that computes your odds (§11.1). The orchestra is code. So are the odds.";
export const AUTOPLAY_NOTE = "The band starts after your first click. Consent starts the music (§10.2).";
export const RESTORE_TOAST = "Audio restored automatically. The house insists.";

function loadMuted() {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { return false; }
}

// ---- engine state -------------------------------------------------------------
let muted = loadMuted();
let killed = false;
let unlocked = false;
let moodWord = null;
let regime = "normal";
let ldwPending = false;
let ctx = null;
let master = null, playerBus = null, houseBus = null;
let layers = null;         // {1:gain,2:gain,3:gain,4:gain} — ducking, player bus
let bedLevel = null;       // bed voices -> bedLevel -> layers[4]
const playedLog = [];
let ceremony = null;       // {id, endsAt} — P1s serialize, never drop
const ceremonyQueue = [];
const activeByPriority = { 1: 0, 2: 0, 3: 0 };
let crateTick = null;      // managed defusal tick loop (P2 voices)
let murmur = null;         // Desperation crowd-murmur layer (§5)
let sprinkleTimer = null;  // Generous-flood demo-siren sprinkles (§5)

function log(id, priority) {
  playedLog.unshift({ id, priority, at: Date.now() });
  if (playedLog.length > LOG_CAP) playedLog.length = LOG_CAP;
}

// ---- audio graph --------------------------------------------------------------
// buildGraph() is also the P0 hard-kill mechanism: killAll() rebuilds the bus
// tree, orphaning the old one. A gain blip cannot un-sound an oscillator that
// is already sounding — mid-flight voices must be severed from the destination,
// instantly, no fade (§1 P0). Missed sounds are not backlogged.
function buildGraph() {
  const oldMaster = master;
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  houseBus = ctx.createGain(); houseBus.gain.value = 1; houseBus.connect(master);
  playerBus = ctx.createGain(); playerBus.gain.value = muted ? 0 : 1; playerBus.connect(master);
  layers = {};
  for (const p of [1, 2, 3, 4]) {
    layers[p] = ctx.createGain(); layers[p].gain.value = 1; layers[p].connect(playerBus);
  }
  bedLevel = ctx.createGain(); bedLevel.gain.value = 0; bedLevel.connect(layers[4]);
  if (oldMaster) { try { oldMaster.disconnect(); } catch (e) { /* already severed */ } }
}

function unlock() {
  const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
  if (!AC) return false;
  if (!ctx) {
    try { ctx = new AC(); } catch (e) { return false; }
    buildGraph();
    unlocked = true;
    if (!killed) startBed(0.8);
  }
  if (ctx.state === "suspended") { try { ctx.resume().catch(() => {}); } catch (e) { /* retry on next gesture */ } }
  return ctx.state === "running";
}

// First-gesture fallback: returning visitors skip the age gate, and the copy
// says "the band starts after your first click" — so the first click it is.
let gestureWired = false;
function wireGesture() {
  if (gestureWired || typeof window === "undefined") return;
  gestureWired = true;
  const onGesture = () => { if (unlock()) {
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
  } };
  window.addEventListener("pointerdown", onGesture);
  window.addEventListener("keydown", onGesture);
}

// ---- ducking (§1: when a layer speaks, everything below ducks to 30%) --------
function refreshDuck() {
  if (!ctx || !layers) return;
  const now = ctx.currentTime;
  const p1 = activeByPriority[1] > 0 || ceremony !== null;
  const p2 = activeByPriority[2] > 0;
  const p3 = activeByPriority[3] > 0;
  const target = (p) => (p1 && p >= 2) || (p2 && p >= 3) || (p3 && p === 4) ? DUCK_FACTOR : 1;
  for (const p of [1, 2, 3, 4]) {
    try { layers[p].gain.setTargetAtTime(target(p), now, 0.045); } catch (e) {}
  }
}

function bump(priority, seconds) {
  if (!(priority >= 1 && priority <= 3)) return;
  activeByPriority[priority] += 1;
  refreshDuck();
  setTimeout(() => {
    activeByPriority[priority] = Math.max(0, activeByPriority[priority] - 1);
    refreshDuck();
  }, seconds * 1000 + 120);
}

// ---- shared instruments -------------------------------------------------------
const SIREN_DUR = 2.3;
function sirenBurst(t, vol = 1) {
  // The Siren (one (1), shared site-wide): safety equipment; cannot be muted.
  const out = houseBus;
  for (let i = 0; i < 3; i++) {
    const t0 = t + i * 0.74;
    tone(ctx, out, { t: t0, type: "sawtooth", f0: 660, f1: 1320, glide: 0.34, gain: 0.11 * vol, decay: 0.34, attack: 0.015, lp: 2600 });
    tone(ctx, out, { t: t0 + 0.36, type: "sawtooth", f0: 1320, f1: 660, glide: 0.34, gain: 0.11 * vol, decay: 0.34, attack: 0.015, lp: 2600 });
  }
  noise(ctx, out, { t, gain: 0.045 * vol, attack: 0.15, decay: SIREN_DUR, bp: 2400, q: 1.4 });
  tone(ctx, out, { t, f0: 523, gain: 0.05 * vol, attack: 0.1, decay: SIREN_DUR, lp: 3200 });
  tone(ctx, out, { t: t + 0.05, f0: 784, gain: 0.045 * vol, attack: 0.12, decay: SIREN_DUR, lp: 3200 });
}

function comfortWhump(t, vol = 1) {
  // §2.2: a soft whump (a pillow receiving money), a gentle downward gliss
  // (a balloon conceding politely), and a distant, filtered thank you.
  tone(ctx, layers[2], { t, f0: 110, f1: 55, glide: 0.4, gain: 0.1 * vol, attack: 0.02, decay: 0.45, lp: 300 });
  tone(ctx, layers[2], { t: t + 0.12, f0: 500, f1: 250, glide: 0.9, gain: 0.035 * vol, attack: 0.04, decay: 0.9 });
  tone(ctx, layers[2], { t: t + 0.55, type: "sawtooth", f0: 320, f1: 255, glide: 0.2, gain: 0.028 * vol, attack: 0.04, decay: 0.22, bp: 520, q: 6 });
  tone(ctx, layers[2], { t: t + 0.82, type: "sawtooth", f0: 390, f1: 295, glide: 0.24, gain: 0.028 * vol, attack: 0.04, decay: 0.26, bp: 610, q: 6 });
}

function confettiPops(t, n = 4, vol = 1) {
  for (let i = 0; i < n; i++) {
    noise(ctx, layers[1], { t: t + i * 0.16 + Math.random() * 0.05, gain: 0.07 * vol, attack: 0.002, decay: 0.09, bp: 1600 + Math.random() * 900, q: 1 });
  }
}

function fanfareChords(t, vol = 1) {
  const chords = [[262, 330, 392], [349, 440, 523], [392, 494, 587], [523, 659, 784]];
  chords.forEach((ch, i) => {
    const t0 = t + i * 0.3;
    for (const f of ch) tone(ctx, layers[1], { t: t0, type: "sawtooth", f0: f, gain: 0.045 * vol, attack: 0.02, decay: 0.32, lp: 2200, vibratoHz: 5, vibratoDepth: 3 });
    pluck(ctx, layers[1], { t: t0, freq: ch[2] * 2, gain: 0.04 * vol, dur: 0.5 });
  });
}

function harpGliss(t, vol = 1) {
  const notes = [262, 330, 392, 523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => pluck(ctx, layers[3], { t: t + i * 0.045, freq: f, gain: 0.05 * vol, dur: 0.7 }));
}

function mikeHotGain() {
  const db = regime === "desperation" ? MIKE_HOT_DB_DESPERATION : MIKE_HOT_DB; // one constant, one owner
  return Math.pow(10, db / 20);
}

// ---- sound inventory (§3) — id -> {dur, house?, courtesy?, make} --------------
// make(t, vol) builds voices; t is an absolute ctx time; vol multiplies.
const CUES = {
  // Roulette
  "roulette.spin": { dur: 4.8, make(t, v) {
    // 5s rising ratchet-whoosh: the clicks accelerate as the reel approaches
    // the outcome it already knows (ToS §4.2).
    let t0 = t;
    for (let i = 0; i < 18; i++) {
      const prog = i / 17;
      click(ctx, layers[2], { t: t0, f0: 900 + prog * 1500, gain: (0.05 + prog * 0.05) * v });
      t0 += 0.42 - prog * 0.32;
    }
    noise(ctx, layers[2], { t, gain: 0.06 * v, attack: 1.2, decay: 3.6, lp: 400, filterSweepTo: 3200, glide: 4.5 });
  } },
  "roulette.jackpot": { dur: 2.6, make(t, v) {
    sirenBurst(t, 1); // house bus — public safety
    fanfareChords(t + 0.1, v);
    confettiPops(t + 0.3, 5, v);
  } },
  // Coinflip
  "coinflip.flip": { dur: 2.8, make(t, v) {
    const base = 820;
    [1, 2.76, 5.4, 8.93].forEach((p, i) => tone(ctx, layers[2], { t, f0: base * p, gain: (0.09 / (1 + i)) * v, attack: 0.003, decay: 1.3 - i * 0.25, vibratoHz: 6, vibratoDepth: 9 / (1 + i) }));
    tone(ctx, layers[2], { t: t + 1.2, f0: 700, f1: 560, glide: 1.4, gain: 0.03 * v, attack: 0.3, decay: 1.4 }); // doppler settle
    noise(ctx, layers[2], { t, gain: 0.018 * v, attack: 0.2, decay: 2.5, hp: 5500 });
  } },
  "coinflip.legendary": { dur: 3.0, make(t, v) {
    tone(ctx, layers[1], { t, type: "sawtooth", f0: 700, f1: 170, glide: 0.3, gain: 0.08 * v, attack: 0.005, decay: 0.3, lp: 2000 }); // vinyl brake
    noise(ctx, layers[1], { t, gain: 0.04 * v, attack: 0.005, decay: 0.28, bp: 2100, q: 2 });
    sirenBurst(t + 0.34, 1);
    harpGliss(t + 0.4, v);
    confettiPops(t + 0.6, 4, v);
  } },
  // College Fund Crash
  "crash.round": { dur: 7.2, make(t, v) {
    tone(ctx, layers[2], { t, type: "sawtooth", f0: 72, f1: 190, glide: 6.6, gain: 0.1 * v, attack: 2.4, decay: 4.6, lp: 520, tremoloHz: 4.5, tremoloDepth: 0.4 });
    tone(ctx, layers[2], { t, f0: 55, f1: 96, glide: 6.6, gain: 0.045 * v, attack: 2.6, decay: 4.4, lp: 300 });
  } },
  "crash.crashed": { dur: 1.6, make(t, v) {
    tone(ctx, layers[2], { t, f0: 95, f1: 48, glide: 0.5, gain: 0.12 * v, attack: 0.015, decay: 0.5, lp: 250 });   // distant womp — no explosion
    tone(ctx, layers[2], { t: t + 0.2, f0: 420, f1: 110, glide: 0.85, gain: 0.04 * v, attack: 0.03, decay: 0.85 }); // balloon concedes
    comfortWhump(t + 0.55, v * 0.8);
  } },
  "crash.cashout": { dur: 0.6, make(t, v) {
    tone(ctx, layers[1], { t, f0: 350, gain: 0.06 * v, attack: 0.01, hold: 0.3, decay: 0.06 });
    tone(ctx, layers[1], { t, f0: 440, gain: 0.06 * v, attack: 0.01, hold: 0.3, decay: 0.06 });
  } },
  "crash.character-win": { dur: 1.3, make(t, v) { // One (1) Trumpet. It builds character.
    [[392, 0], [523, 0.38], [659, 0.76]].forEach(([f, dt]) => {
      tone(ctx, layers[1], { t: t + dt, type: "sawtooth", f0: f, gain: 0.085 * v, attack: 0.04, decay: 0.3, lp: 1300, vibratoHz: 5.5, vibratoDepth: 4 });
    });
  } },
  "crash.tremble": { dur: 0.6, make(t, v) { // the stick: the drone holds and trembles
    tone(ctx, layers[2], { t, f0: 240, gain: 0.045 * v, attack: 0.03, decay: 0.5, lp: 800, vibratoHz: 9, vibratoDepth: 14 });
  } },
  // Loot Crate Defuser
  "crates.open": { dur: 0.5, make(t, v) { // launch sting; the defusal tick is a managed P2 loop below
    click(ctx, layers[1], { t, f0: 700, gain: 0.1 * v });
    tone(ctx, layers[1], { t: t + 0.06, f0: 300, f1: 900, glide: 0.3, gain: 0.05 * v, attack: 0.01, decay: 0.3 });
    startCrateTick(t + 0.35);
  } },
  "crates.reveal": { dur: 0.9, make(t, v) { // Consumer Grade Trash gets one sad trombone note (§3)
    tone(ctx, layers[1], { t, type: "sawtooth", f0: 233, f1: 196, glide: 0.5, gain: 0.07 * v, attack: 0.03, decay: 0.5, lp: 900, vibratoHz: 5, vibratoDepth: 6 });
    click(ctx, layers[1], { t: t + 0.5, f0: 500, gain: 0.05 * v });
  } },
  "crates.legendary": { dur: 2.6, make(t, v) { // Covert Extravagance gets the Siren
    sirenBurst(t, 1);
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => pluck(ctx, layers[1], { t: t + 0.05 + i * 0.07, freq: f, gain: 0.055 * v, dur: 0.8 }));
    confettiPops(t + 0.4, 5, v);
  } },
  "crates.drop": { dur: 2.2, house: true, make(t, v) { // BASS_DROP_FINAL_v3_REAL.mp3, synthesized live. It has never been final.
    [52, 57.5, 47].forEach((f, i) => tone(ctx, houseBus, { t, f0: f, f1: f * 0.52, glide: 1.7, gain: (i === 0 ? 0.3 : 0.12) * v, attack: 0.015, hold: 1.2, decay: 0.7, lp: 160 }));
    click(ctx, houseBus, { t, f0: 300, gain: 0.14 * v });
    tone(ctx, houseBus, { t: t + 1.75, f0: 60, f1: 30, glide: 0.35, gain: 0.14 * v, attack: 0.005, decay: 0.35, lp: 120 });
  } },
  "crates.stall": { dur: 0.4, make(t, v) { // one nervous tap
    click(ctx, layers[2], { t, f0: 1600, gain: 0.06 * v });
    click(ctx, layers[2], { t: t + 0.17, f0: 1400, gain: 0.045 * v });
  } },
  "crates.recalibration": { dur: 1.2, make(t, v) { // a prize-wheel wind-up played backwards
    let t0 = t;
    for (let i = 0; i < 12; i++) {
      click(ctx, layers[2], { t: t0, f0: 1700 - i * 90, gain: 0.05 * v });
      t0 += 0.14 - i * 0.0075;
    }
    noise(ctx, layers[2], { t, gain: 0.02 * v, attack: 0.6, decay: 0.5, bp: 1200, filterSweepTo: 2600, glide: 1.0 });
  } },
  // Ticker
  "mike.stinger": { dur: 0.35, make(t, v) { // MOMCODE_MIKE's personal riff — mixed 3dB hot. He asked. He owns the board.
    const hot = v * mikeHotGain();
    [523, 659, 880].forEach((f, i) => tone(ctx, layers[3], { t: t + i * 0.07, type: "square", f0: f, gain: 0.045 * hot, attack: 0.005, decay: 0.11, lp: 2400 }));
    noise(ctx, layers[3], { t: t + 0.2, gain: 0.02 * hot, attack: 0.005, decay: 0.15, hp: 6000 });
  } },
  "demo.sparkle": { dur: 0.4, make(t, v) { // the demo-size Siren (P3 sparkle) — full sirens are reserved for winners
    pluck(ctx, layers[3], { t, freq: 1568, gain: 0.03 * v, dur: 0.3 });
    pluck(ctx, layers[3], { t: t + 0.06, freq: 2093, gain: 0.025 * v, dur: 0.3 });
    noise(ctx, layers[3], { t, gain: 0.012 * v, attack: 0.01, decay: 0.3, hp: 7000 });
  } },
  "thunder": { dur: 3.0, make(t, v) { // the thunder, however, was free
    noise(ctx, layers[3], { t, gain: 0.16 * v, attack: 0.5, hold: 0.7, decay: 1.8, lp: 140 });
    tone(ctx, layers[3], { t: t + 0.1, f0: 58, f1: 36, glide: 2.2, gain: 0.12 * v, attack: 0.4, decay: 2.2, lp: 120 });
  } },
  // Header & economy (§2)
  "bb.debit": { dur: 0.35, make(t, v) { // polite debit: one muffled coin-swallow + soft whump. Almost kind.
    tone(ctx, layers[2], { t, f0: 210, f1: 150, glide: 0.09, gain: 0.05 * v, attack: 0.005, decay: 0.1, lp: 500 });
    tone(ctx, layers[2], { t: t + 0.1, f0: 150, f1: 105, glide: 0.1, gain: 0.04 * v, attack: 0.005, decay: 0.12, lp: 420 });
    tone(ctx, layers[2], { t: t + 0.18, f0: 100, f1: 62, glide: 0.16, gain: 0.045 * v, attack: 0.01, decay: 0.18, lp: 260 });
  } },
  "bb.credit": { dur: 0.7, make(t, v) { // every credit chimes. The chime doesn't do math.
    pluck(ctx, layers[3], { t, freq: 1318, gain: 0.06 * v, dur: 0.6 });
    tone(ctx, layers[3], { t: t + 0.02, f0: 2637, gain: 0.02 * v, attack: 0.004, decay: 0.35 });
  } },
  "oc.funeral": { dur: 1.6, make(t, v) { // three descending notes. It is survived by nothing (§2.3).
    [[330, 0], [262, 0.4], [220, 0.8]].forEach(([f, dt]) => tone(ctx, layers[2], { t: t + dt, f0: f, gain: 0.05 * v, attack: 0.03, decay: 0.7, lp: 900 }));
  } },
  // Age gate & identity (§3)
  "welcome.sting": { dur: 1.6, make(t, v) { // the first loud thing you hear, and the last unbiased one
    fanfareChords(t, v * 1.2);
    confettiPops(t + 0.5, 6, v);
    noise(ctx, layers[1], { t, gain: 0.03 * v, attack: 0.8, decay: 0.7, bp: 5200, q: 1.2 });
  } },
  "tag.stamp": { dur: 0.4, make(t, v) { // one rubber-stamp thunk
    click(ctx, layers[3], { t, f0: 900, gain: 0.09 * v });
    tone(ctx, layers[3], { t, f0: 130, f1: 58, glide: 0.12, gain: 0.12 * v, attack: 0.003, decay: 0.14, lp: 400 });
  } },
  // Comfort mix (§2)
  "loss.whump": { dur: 1.3, make(t, v) { comfortWhump(t, v); } },
  "heartbeat": { dur: 1.8, make(t, v) { // accelerando, then stops dead. Cardiologically, this is fine (§4.2).
    const beats = [0, 0.62, 1.12, 1.5];
    beats.forEach((dt, i) => {
      const g = (0.13 + i * 0.015) * v;
      tone(ctx, layers[2], { t: t + dt, f0: 58, f1: 40, glide: 0.09, gain: g, attack: 0.004, decay: 0.1, lp: 200 });
      tone(ctx, layers[2], { t: t + dt + 0.14, f0: 52, f1: 38, glide: 0.08, gain: g * 0.7, attack: 0.004, decay: 0.09, lp: 190 });
    });
  } },
  "ldw.fanfare": { dur: 2.6, make(t, v) { // the complete Siren-plus-confetti package. The sirens do not know the difference. That is the feature.
    sirenBurst(t, 1);
    confettiPops(t + 0.25, 6, v);
    harpGliss(t + 0.35, v);
    fanfareChords(t + 0.2, v);
  } },
  // Regimes (§5)
  "desperation.entry": { dur: 1.4, make(t, v) { // one soft canned aww and a warm harp gliss — a candle store
    [[392, 0], [330, 0.22], [262, 0.46]].forEach(([f, dt]) => tone(ctx, layers[3], { t: t + dt, f0: f, gain: 0.035 * v, attack: 0.08, decay: 0.4, lp: 700 }));
    noise(ctx, layers[3], { t, gain: 0.03 * v, attack: 0.15, decay: 0.8, bp: 480, q: 1.2 });
    harpGliss(t + 0.55, v * 0.8);
  } },
  "desperation.exit": { dur: 2.6, make(t, v) { // the biggest legal sound on the site: {n} is back. The house missed {n} (financially).
    fanfareChords(t, v * 1.25);
    noise(ctx, layers[1], { t, gain: 0.13 * v, attack: 0.35, hold: 0.8, decay: 1.1, bp: 750, q: 0.8 }); // crowd eruption
    for (let i = 0; i < 6; i++) {
      const t0 = t + 0.4 + Math.random() * 1.1;
      tone(ctx, layers[1], { t: t0, f0: 500 + Math.random() * 500, f1: 300, glide: 0.18, gain: 0.03 * v, attack: 0.03, decay: 0.18, bp: 900, q: 3 });
    }
    [[659, 0.9], [784, 1.05], [988, 1.2]].forEach(([f, dt]) => pluck(ctx, layers[1], { t: t + dt, freq: f, gain: 0.06 * v, dur: 0.9 })); // MOM's proud sting
    tone(ctx, layers[4], { t: t + 1.3, f0: 220, f1: 440, glide: 1.1, gain: 0.05 * v, attack: 0.5, decay: 0.9, lp: 900 }); // welcome-back swell
  } },
  // Chat
  "mom.whisper": { dur: 0.8, house: true, make(t, v) { // close-mic'd breath-chime. For your ears only. It bypasses the mute.
    noise(ctx, houseBus, { t, gain: 0.05 * v, attack: 0.14, decay: 0.5, hp: 1200 });
    pluck(ctx, houseBus, { t: t + 0.08, freq: 1975, gain: 0.022 * v, dur: 0.6 });
    tone(ctx, houseBus, { t: t + 0.02, f0: 340, f1: 300, glide: 0.35, gain: 0.018 * v, attack: 0.1, decay: 0.4, lp: 900 });
  } },
  // #32 (audio-gags §3, the chat micro-texture #26/#30 left unwired):
  "chat.tap": { dur: 0.35, make(t, v) { // crowd taps: quiet typewriter taps, persona-typed (hype kids slightly louder — the caller scales v)
    for (let i = 0; i < 3; i++) {
      click(ctx, layers[3], { t: t + i * 0.07 + Math.random() * 0.02, f0: 2100 + Math.random() * 700, gain: (0.02 + Math.random() * 0.012) * v });
    }
  } },
  "chat.botbeep": { dur: 0.3, make(t, v) { // definitely-bots get a flat monotone beep. Bots beep. This is disclosure.
    tone(ctx, layers[3], { t, f0: 620, gain: 0.028 * v, attack: 0.004, hold: 0.12, decay: 0.05 });
    tone(ctx, layers[3], { t: t + 0.16, f0: 620, gain: 0.024 * v, attack: 0.004, hold: 0.08, decay: 0.05 });
  } },
  "chat.who": { dur: 0.4, make(t, v) { // the quiet window's flat beep ("who?") — the loudest thing on the site, said once
    tone(ctx, layers[3], { t, f0: 880, gain: 0.05 * v, attack: 0.004, hold: 0.22, decay: 0.08 });
  } },
  "chat.thud": { dur: 0.5, make(t, v) { // timeout: one muffled ban-hammer. Modesty is a mixing choice.
    tone(ctx, layers[3], { t, f0: 120, f1: 55, glide: 0.12, gain: 0.1 * v, attack: 0.004, decay: 0.22, lp: 320 });
    noise(ctx, layers[3], { t, gain: 0.03 * v, attack: 0.002, decay: 0.18, lp: 500 });
  } },
  "rain.drip": { dur: 0.5, make(t, v) { // #32 (audio-gags §3): each rain persona's 1 BB drips as a tiny coin-drip. Your chip gets no drip.
    tone(ctx, layers[3], { t, f0: 1450, f1: 880, glide: 0.08, gain: 0.03 * v, attack: 0.003, decay: 0.12, lp: 2600 });
    click(ctx, layers[3], { t: t + 0.16, f0: 1200, gain: 0.014 * v });
  } },
  // Ask-Mom (§18.1: the most professionally mixed surface on the site)
  "askmom.beat": { dur: 0.7, make(t, v) { // soft footsteps
    tone(ctx, layers[1], { t, f0: 92, f1: 68, glide: 0.09, gain: 0.07 * v, attack: 0.004, decay: 0.1, lp: 350 });
    tone(ctx, layers[1], { t: t + 0.35, f0: 86, f1: 64, glide: 0.09, gain: 0.06 * v, attack: 0.004, decay: 0.1, lp: 330 });
    noise(ctx, layers[1], { t: t + 0.33, gain: 0.012 * v, attack: 0.01, decay: 0.09, lp: 900 });
  } },
  "askmom.turbo": { dur: 0.6, house: true, courtesy: true, make(t, v) { // One-Click™ charge whine -> terminal beep
    tone(ctx, houseBus, { t, f0: 320, f1: 2900, glide: 0.4, gain: 0.07 * v, attack: 0.05, decay: 0.4, lp: 5000 });
    tone(ctx, houseBus, { t: t + 0.42, f0: 880, gain: 0.06 * v, attack: 0.005, hold: 0.07, decay: 0.05 });
  } },
  "askmom.decline": { dur: 0.5, make(t, v) { // two polite terminal beeps. Declines are conversations.
    tone(ctx, layers[1], { t, f0: 520, gain: 0.06 * v, attack: 0.005, hold: 0.1, decay: 0.06 });
    tone(ctx, layers[1], { t: t + 0.26, f0: 520, gain: 0.06 * v, attack: 0.005, hold: 0.1, decay: 0.08 });
  } },
  "askmom.fridge": { dur: 1.7, make(t, v) { // the canon fridge: compressor hum + a faint muffled kitchen TV
    tone(ctx, layers[1], { t, type: "sawtooth", f0: 60, gain: 0.05 * v, attack: 0.08, hold: 1.2, decay: 0.3, lp: 220, tremoloHz: 7, tremoloDepth: 0.35 });
    tone(ctx, layers[1], { t, type: "sawtooth", f0: 120, gain: 0.02 * v, attack: 0.08, hold: 1.2, decay: 0.3, lp: 300 });
    noise(ctx, layers[1], { t: t + 0.2, gain: 0.012 * v, attack: 0.3, decay: 1.0, bp: 950, q: 3 });
  } },
  "askmom.click": { dur: 0.3, make(t, v) { click(ctx, layers[1], { t, f0: 1000, gain: 0.07 * v }); } },
  "askmom.success": { dur: 2.0, house: true, courtesy: true, make(t, v) { // rich ka-ching + swelling major chord + distant crowd ooh
    click(ctx, houseBus, { t, f0: 1800, gain: 0.08 * v });
    pluck(ctx, houseBus, { t: t + 0.04, freq: 1568, gain: 0.06 * v, dur: 0.9 });
    pluck(ctx, houseBus, { t: t + 0.14, freq: 2093, gain: 0.05 * v, dur: 1.0 });
    [523, 659, 784, 1047].forEach((f) => tone(ctx, houseBus, { t: t + 0.1, f0: f, gain: 0.035 * v, attack: 0.5, decay: 1.2, lp: 3000 }));
    noise(ctx, houseBus, { t: t + 0.25, gain: 0.05 * v, attack: 0.4, decay: 0.9, bp: 520, q: 1.1 });
  } },
  "askmom.lasttime": { dur: 1.6, make(t, v) { // "this is the last time" (it resets, §10.3) — one solemn bell
    pluck(ctx, layers[1], { t, freq: 220, gain: 0.07 * v, dur: 1.3 });
    tone(ctx, layers[1], { t, f0: 98, f1: 60, glide: 0.3, gain: 0.07 * v, attack: 0.01, decay: 0.35, lp: 300 });
  } },
};

function cueDuration(id) {
  const c = CUES[id];
  return c ? c.dur : 0.15;
}

// ---- defusal tick (managed loop — P2 voices, stopped by the drop/reveal/kill)
function startCrateTick(t) {
  stopCrateTick();
  if (!ctx) return;
  const startedAt = Date.now();
  let nextAt = Math.max(t, ctx.currentTime + LEAD_IN);
  crateTick = {
    timer: setInterval(() => {
      if (!crateTick || !ctx || killed) { stopCrateTick(); return; }
      if (Date.now() - startedAt > 30000) { stopCrateTick(); return; } // defuse cap is 28s
      while (nextAt < ctx.currentTime + 0.4) {
        click(ctx, layers[2], { t: nextAt, f0: 1500, gain: 0.038 });
        tone(ctx, layers[2], { t: nextAt, f0: 1500, f1: 1200, glide: 0.03, gain: 0.012, attack: 0.002, decay: 0.03 });
        bump(2, 0.2);
        nextAt += 0.34;
      }
    }, 120),
  };
}
function stopCrateTick() {
  if (!crateTick) return;
  clearInterval(crateTick.timer);
  crateTick = null;
}

// ---- the BED (P4, §4) — five loops, one per mood word; the adjective, never the rate
const bed = { running: false, timer: null, step: 0, nextAt: 0, nodes: [], timers: new Set() };
const PETTY_LOOP = [659.3, 784, 987.8, 1318.5, 1174.7, 987.8, 784, 466.16]; // last note wrong by design
const NONCOMMITTAL_SCALE = [294, 330, 370, 392, 440, 494]; // no tonic in the pool: it never resolves
const BOSSA_CHORDS = [[392, 494, 587], [349, 440, 523], [330, 392, 494], [392, 494, 587]];

function bedTempo() { return regime === "desperation" ? DESPERATION_TEMPO : 1; }

function bedStepDur(word) {
  const base = { Vindictive: 0.5, Petty: 0.32, Noncommittal: 0.4, "Benevolent-ish": 0.45, Generous: 0.34 }[word] || 0.4;
  return base * bedTempo();
}

function scheduleBedStep(word, t, i) {
  if (word === "Vindictive") {
    if (i % 24 === 12) { // a distant lawnmower, every so often
      tone(ctx, bedLevel, { t, type: "sawtooth", f0: 86, f1: 97, glide: 1.4, gain: 0.028, attack: 0.3, decay: 1.2, lp: 340, tremoloHz: 11, tremoloDepth: 0.5 });
    }
    if (i % 80 === 79) { // one floorboard creak. The house sighs.
      tone(ctx, bedLevel, { t, f0: 1400, f1: 880, glide: 0.4, gain: 0.02, attack: 0.05, decay: 0.4, bp: 1100, q: 9 });
      tone(ctx, bedLevel, { t: t + 0.45, f0: 1200, f1: 700, glide: 0.3, gain: 0.012, attack: 0.04, decay: 0.3, bp: 950, q: 9 });
    }
  } else if (word === "Petty") {
    const f = PETTY_LOOP[i % PETTY_LOOP.length];
    pluck(ctx, bedLevel, { t, freq: f, gain: f === 466.16 ? 0.035 : 0.05, dur: 0.8 });
  } else if (word === "Noncommittal") {
    if (i % 8 === 0) [262, 330, 392, 494].forEach((f) => tone(ctx, bedLevel, { t, f0: f, gain: 0.018, attack: 0.8, decay: 2.2, lp: 1200 }));
    const idx = Math.floor(Math.random() * NONCOMMITTAL_SCALE.length);
    pluck(ctx, bedLevel, { t, freq: NONCOMMITTAL_SCALE[idx], gain: 0.03, dur: 0.6 });
  } else if (word === "Benevolent-ish") {
    if (i % 9 === 0) [220, 277, 330].forEach((f) => tone(ctx, bedLevel, { t, f0: f, gain: 0.02, attack: 0.7, decay: 2.4, lp: 1100 }));
    if (i % 11 === 5) { // a cautious optimistic pluck appears, then apologizes
      [[440, 0], [494, 0.12], [554, 0.24], [494, 0.48], [440, 0.6]].forEach(([f, dt]) =>
        pluck(ctx, bedLevel, { t: t + dt, freq: f, gain: dt >= 0.48 ? 0.02 : 0.038, dur: 0.7 }));
    }
  } else if (word === "Generous") {
    const bar = Math.floor(i / 8) % BOSSA_CHORDS.length;
    if (i % 2 === 0) tone(ctx, bedLevel, { t, f0: bar % 2 === 0 ? 98 : 123.5, gain: 0.03, attack: 0.01, decay: 0.4, lp: 400 });
    if (i % 4 === 1) BOSSA_CHORDS[bar].forEach((f) => pluck(ctx, bedLevel, { t, freq: f, gain: 0.024, dur: 0.6 }));
    if (i % 8 === 6) { // sleigh bells — the sound of a sale
      for (let k = 0; k < 5; k++) pluck(ctx, bedLevel, { t: t + k * 0.03, freq: 2637 + k * 180, gain: 0.012, dur: 0.25 });
    }
  }
}

function startBedDrone() { // Vindictive only: a low minor drone, slow
  if (!ctx || moodWord !== "Vindictive") return;
  const mk = (f) => {
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = f;
    const flt = ctx.createBiquadFilter(); flt.type = "lowpass"; flt.frequency.value = 240;
    const g = ctx.createGain(); g.gain.value = 0;
    g.gain.setTargetAtTime(0.02, ctx.currentTime, 1.2);
    osc.connect(flt); flt.connect(g); g.connect(bedLevel); osc.start();
    return { osc, g };
  };
  bed.nodes.push(mk(55), mk(82.4));
}

function stopBedNodes(fade = 0.15) {
  for (const n of bed.nodes) {
    try {
      n.g.gain.cancelScheduledValues(ctx.currentTime);
      n.g.gain.setTargetAtTime(0.0001, ctx.currentTime, fade);
      n.osc.stop(ctx.currentTime + fade * 4 + 0.1);
    } catch (e) { /* already stopped */ }
  }
  bed.nodes = [];
}

function startBed(fade = 0.8) {
  if (!ctx || killed || bed.running || !moodWord) return;
  bed.running = true;
  bed.step = 0;
  bed.nextAt = ctx.currentTime + 0.15;
  bedLevel.gain.cancelScheduledValues(ctx.currentTime);
  bedLevel.gain.setValueAtTime(0.0001, ctx.currentTime);
  bedLevel.gain.setTargetAtTime(1, ctx.currentTime, fade / 3);
  startBedDrone();
  bed.timer = setInterval(() => {
    if (!bed.running || !ctx || killed) return;
    const horizon = ctx.currentTime + 0.7;
    while (bed.nextAt < horizon) {
      scheduleBedStep(moodWord, bed.nextAt, bed.step);
      bed.nextAt += bedStepDur(moodWord);
      bed.step += 1;
    }
  }, 200);
}

function stopBed(fade = 0.1) {
  bed.running = false;
  if (bed.timer) { clearInterval(bed.timer); bed.timer = null; }
  for (const t of bed.timers) clearTimeout(t);
  bed.timers.clear();
  stopBedNodes(fade);
  if (ctx && bedLevel) {
    try {
      bedLevel.gain.cancelScheduledValues(ctx.currentTime);
      bedLevel.gain.setTargetAtTime(0.0001, ctx.currentTime, Math.max(0.03, fade / 3));
    } catch (e) {}
  }
}

// Desperation murmur (§5): the room leans in.
function startMurmur() {
  if (!ctx || murmur) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx); src.loop = true;
  const flt = ctx.createBiquadFilter(); flt.type = "lowpass"; flt.frequency.value = 420;
  const g = ctx.createGain(); g.gain.value = 0;
  g.gain.setTargetAtTime(0.045, ctx.currentTime, 1.6);
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.37;
  const lg = ctx.createGain();
  lg.gain.setValueAtTime(0.0001, ctx.currentTime);
  lg.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.5);
  lfo.connect(lg); lg.connect(g.gain); lfo.start();
  src.connect(flt); flt.connect(g); g.connect(bedLevel); src.start();
  murmur = { src, g, lfo };
}
function stopMurmur() {
  if (!murmur || !ctx) { murmur = null; return; }
  try {
    murmur.g.gain.cancelScheduledValues(ctx.currentTime);
    murmur.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
    murmur.src.stop(ctx.currentTime + 1.6);
    murmur.lfo.stop(ctx.currentTime + 1.6);
  } catch (e) { /* already stopped */ }
  murmur = null;
}

// Generous-day flood (§5): sparkle-stingers sprinkle constantly (demo-size only).
function startSprinkles() {
  if (sprinkleTimer || !ctx) return;
  const tickFn = () => {
    sprinkleTimer = setTimeout(() => {
      if (killed || regime !== "flood" || !ctx) { sprinkleTimer = null; return; }
      playCue("demo.sparkle", BAND_PRIORITIES.P3_SOCIAL, 1);
      tickFn();
    }, 1400 + Math.random() * 1800);
  };
  tickFn();
}
function stopSprinkles() {
  if (sprinkleTimer) { clearTimeout(sprinkleTimer); sprinkleTimer = null; }
}

// ---- playback -----------------------------------------------------------------
function houseGainFactor(cue) {
  if (!cue || !cue.house) return 1;
  return cue.courtesy && muted ? 0.5 : 1; // courtesy is 50% (§3.4)
}

function soundCue(id, priority, volume) {
  const cue = CUES[id];
  if (!ctx) return;
  const t = ctx.currentTime + LEAD_IN;
  if (!cue) {
    click(ctx, layers[Math.min(3, Math.max(1, priority))], { t, gain: 0.03 * volume }); // unknown id: a blip, logged, forgotten
    bump(priority, 0.15);
    return;
  }
  const vol = volume * houseGainFactor(cue);
  try { cue.make(t, vol); } catch (e) { return; }
  bump(priority, cue.dur);
}

function pumpCeremony() {
  if (killed || !ctx || ceremony) return;
  const next = ceremonyQueue.shift();
  if (!next) return;
  const dur = cueDuration(next.id);
  ceremony = { id: next.id, endsAt: ctx.currentTime + LEAD_IN + dur };
  soundCue(next.id, BAND_PRIORITIES.P1_CEREMONY, next.volume);
  refreshDuck();
  setTimeout(() => {
    ceremony = null;
    refreshDuck();
    pumpCeremony();
  }, (LEAD_IN + dur) * 1000 + 90);
}

function playCue(id, priority, volume = 1) {
  if (killed || !ctx) return;
  if (priority === BAND_PRIORITIES.P1_CEREMONY) {
    ceremonyQueue.push({ id, volume, at: Date.now() });
    if (ceremonyQueue.length > 12) ceremonyQueue.shift();
    pumpCeremony();
  } else {
    soundCue(id, priority, volume);
  }
}

// ---- the public House Band ------------------------------------------------------
export const HouseBand = {
  play(id, opts = {}) {
    if (killed) return false;
    const priority = opts.priority ?? BAND_PRIORITIES.P3_SOCIAL;
    if (priority === BAND_PRIORITIES.P0_SILENCE) { HouseBand.killAll(); return false; }
    log(id, priority);
    playCue(id, priority, opts.volume ?? 1);
    return true;
  },
  flush() {
    // Drop queued one-shots without sounding them (kept from the skeleton).
    while (ceremonyQueue.length > 0) {
      const e = ceremonyQueue.shift();
      log(e.id, BAND_PRIORITIES.P1_CEREMONY);
    }
  },
  killAll() {
    // P0: instantly discards all playing and queued audio, no fade. Not a
    // sound — the enforced absence of sound. Panic surface only.
    stopBed(0.03);
    stopMurmur();
    stopSprinkles();
    stopCrateTick();
    ceremonyQueue.length = 0;
    ceremony = null;
    activeByPriority[1] = activeByPriority[2] = activeByPriority[3] = 0;
    killed = true;
    // Sever the graph: every mid-flight voice runs out into a disconnected
    // master (instant, no fade), and the post-restore mix is parented to a
    // fresh, silent lineage. Mid-flight voices are never resumed, only missed.
    if (ctx) buildGraph();
  },
  restore() {
    // Panic canon §4: the BED fades back in over 0.8s at prior volume, unasked
    // — mute state included. Missed sounds are not backlogged.
    if (!killed) return;
    killed = false;
    if (ctx) {
      startBed(0.8);
      if (regime === "desperation") startMurmur();
      if (regime === "flood") startSprinkles();
    }
    refreshDuck();
  },
  setMood(word) {
    if (word === moodWord) return;
    moodWord = word;
    if (!ctx || killed) return;
    if (!bed.running) { startBed(2.0); return; } // first word after consent (unlock raced Mood.init)
    // §4: crossfade at the daily boundary with a vinyl-rewind transition (3s).
    tone(ctx, layers[3], { type: "sawtooth", f0: 880, f1: 90, glide: 0.5, gain: 0.04, attack: 0.01, decay: 0.5, lp: 1800 });
    noise(ctx, layers[3], { gain: 0.03, attack: 0.01, decay: 0.5, bp: 1400, q: 2, filterSweepTo: 300, glide: 0.5 });
    stopBed(1.0);
    const t = setTimeout(() => {
      bed.timers.delete(t);
      if (killed || !ctx || bed.running) return;
      if (moodWord === word) startBed(2.0);
    }, 1000);
    bed.timers.add(t);
  },
  setRegime(r) {
    const from = regime;
    regime = r;
    if (!ctx || r === from) return;
    if (r === "desperation") {
      // §5: scored like a candle store. The house wants you calm while you're poor.
      playCue("desperation.entry", BAND_PRIORITIES.P3_SOCIAL, 1);
      startMurmur();
      stopSprinkles();
    } else {
      if (from === "desperation") {
        // Refill completion: the biggest legal sound on the site.
        playCue("desperation.exit", BAND_PRIORITIES.P1_CEREMONY, 1);
      }
      stopMurmur();
      if (r === "flood") startSprinkles(); else stopSprinkles();
    }
  },
  setMuted(m) {
    const next = !!m;
    if (next === muted && ctx) return;
    if (next && ctx) {
      // One last click. Muting the click is not possible. The house buys this one.
      click(ctx, houseBus, { t: ctx.currentTime + 0.005, f0: 1700, gain: 0.09 });
    }
    muted = next;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    if (ctx) {
      const now = ctx.currentTime;
      try {
        playerBus.gain.cancelScheduledValues(now);
        // Un-mute: the BED returns with a welcoming swell. It missed you.
        playerBus.gain.setTargetAtTime(muted ? 0 : 1, now, muted ? 0.012 : 0.28);
      } catch (e) {}
    }
  },
  isMuted() { return muted; },
  isKilled() { return killed; },
  isUnlocked() { return unlocked && ctx !== null && ctx.state === "running"; },
  unlock() { return unlock(); },
  ocFuneral() { playCue("oc.funeral", BAND_PRIORITIES.P2_GAME, 1); },
  takeLDWDisclosure() {
    if (!ldwPending) return null;
    ldwPending = false;
    return LDW_DISCLOSURE;
  },
  snapshot() {
    return {
      killed,
      muted,
      unlocked,
      mood: moodWord,
      regime,
      sounding: ceremony ? { id: ceremony.id, priority: BAND_PRIORITIES.P1_CEREMONY, loop: false } : (bed.running && moodWord ? { id: "bed." + moodWord, priority: BAND_PRIORITIES.P4_BED, loop: true } : null),
      waiting: ceremonyQueue.map((e) => ({ id: e.id, priority: BAND_PRIORITIES.P1_CEREMONY, loop: false, effectiveVolume: e.volume })),
      played: [...playedLog],
    };
  },
};

// ---- bus wiring (the spine's nervous system; module lifetime) -------------------
// The gesture chain (integration §12.10): the age-gate continue click starts the
// Band; the welcome sting is the only sound in the welcome sequence.
Bus.on(EVENTS.GATE_ACCEPTED, () => {
  unlock();
  playCue("welcome.sting", BAND_PRIORITIES.P1_CEREMONY, 1);
});
Bus.on(EVENTS.IDENTITY_ASSIGNED, () => {
  // (3) tag stamp thunk after the sting clears.
  setTimeout(() => playCue("tag.stamp", BAND_PRIORITIES.P3_SOCIAL, 1), 1800);
});
Bus.on(EVENTS.MOOD_CHANGED, (p) => { if (p && p.word) HouseBand.setMood(p.word); });
Bus.on(EVENTS.REGIME_CHANGED, (p) => { if (p && p.to) HouseBand.setRegime(p.to); });
Bus.on(EVENTS.PANIC_HIDDEN, () => { HouseBand.killAll(); });
Bus.on(EVENTS.PANIC_REVEALED, () => {
  HouseBand.restore();
  // The Hush Gratuity lands as one muffled coin-swallow while you read the receipt.
  setTimeout(() => { if (!killed) playCue("bb.debit", BAND_PRIORITIES.P2_GAME, 0.7); }, 900);
});
Bus.on(EVENTS.MIKE_WIN, () => { /* stinger enqueued by the ticker at P3; the Band applies the shared hotness */ });

// The comfort mix (§2): losses lullabied; net-loss wins get the full Siren.
Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || killed) return;
  const net = typeof p.netBB === "number" ? p.netBB : 0;
  const win = WIN_KINDS.has(p.kind);
  if (win && net < 0) {
    ldwPending = true; // the 4pt disclosure lands with the first full fanfare
    if (p.kind === "junk-win") {
      // roulette/coinflip junk fake wins have no game-side cue — the Band
      // delivers the complete Siren-plus-confetti package itself. jackpot/
      // legendary-win/character-win carry their own P1 cues (Siren included).
      playCue("ldw.fanfare", BAND_PRIORITIES.P1_CEREMONY, 1);
    }
    return;
  }
  if (p.kind === "near-miss") {
    // The Heartbeat (one (1)): accelerando, then stops dead; the soothing
    // whump follows. (Rides the settle event — see resolution deviations.)
    playCue("heartbeat", BAND_PRIORITIES.P2_GAME, 1);
    setTimeout(() => { if (!killed) playCue("loss.whump", BAND_PRIORITIES.P2_GAME, 0.9); }, 1500);
    return;
  }
  if (p.wagered !== false && net < 0 && !win) {
    // Every loss sting: low-passed, warm, quiet — mixed like a bedtime podcast.
    // (crash.crashed carries its own comfort package; every other loss gets the whump.)
    playCue("loss.whump", BAND_PRIORITIES.P2_GAME, 0.85);
  }
});
Bus.on(EVENTS.ROUND_BEAT, (p) => {
  if (!p || killed) return;
  if (p.surface === "crates") {
    if (p.beat === "drop") { stopCrateTick(); playCue("crates.drop", BAND_PRIORITIES.P1_CEREMONY, 1); }
    else if (p.beat === "stall") playCue("crates.stall", BAND_PRIORITIES.P2_GAME, 1);
    else if (p.beat === "recalibration") playCue("crates.recalibration", BAND_PRIORITIES.P2_GAME, 1);
  } else if (p.surface === "crash" && p.beat === "stick") {
    playCue("crash.tremble", BAND_PRIORITIES.P2_GAME, 0.9);
  }
});
// The house says thank you, softly, on every debit (§2) — except the Hush
// Gratuity, whose single coin-swallow is scheduled by panic.revealed (900ms,
// "while you read the receipt"). #28: charge the Hush with reason:"panic-hush"
// so it doesn't also fire the immediate polite debit (one swallow, not two).
Bus.on(EVENTS.BB_SPENT, (p) => {
  if (killed) return;
  if (p && typeof p.reason === "string" && p.reason.indexOf("hush") !== -1) return;
  playCue("bb.debit", BAND_PRIORITIES.P2_GAME, 0.7);
});
Bus.on(EVENTS.BB_CREDITED, () => { if (!killed) playCue("bb.credit", BAND_PRIORITIES.P3_SOCIAL, 0.8); });
// Rain / Mom Weather™ share thunder (integration §13.7); the thunder was free.
Bus.on(EVENTS.RAIN_EVENT, () => { if (!killed) playCue("thunder", BAND_PRIORITIES.P3_SOCIAL, 1); });
Bus.on(EVENTS.MOMWEATHER_EVENT, () => { if (!killed) playCue("thunder", BAND_PRIORITIES.P3_SOCIAL, 1); });

// The crates reveal ends the defusal tick one way or another.
for (const id of ["crates.reveal", "crates.legendary"]) {
  const orig = CUES[id];
  CUES[id] = { ...orig, make(t, v) { stopCrateTick(); orig.make(t, v); } };
}

wireGesture();

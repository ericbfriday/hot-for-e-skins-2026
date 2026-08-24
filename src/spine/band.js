import { Bus, EVENTS } from "./bus.js";

export const BAND_PRIORITIES = { P0_SILENCE: 0, P1_CEREMONY: 1, P2_GAME: 2, P3_SOCIAL: 3, P4_BED: 4 };
const DUCK_FACTOR = 0.3;
const LOG_CAP = 20;

function loadMuted() {
  try { return localStorage.getItem("hfes_muted") === "1"; } catch (e) { return false; }
}

let muted = loadMuted();
let killed = false;
let waiting = [];
let sounding = null;
let playedLog = [];
let moodWord = null;
let regime = "normal";

function byPriority(a, b) { return a.priority - b.priority || a.at - b.at; }

function advance() {
  if (killed) return;
  while (!sounding && waiting.length > 0) {
    waiting.sort(byPriority);
    const next = waiting.shift();
    if (next.loop) { sounding = next; return; }
    playedLog.unshift({ id: next.id, priority: next.priority, at: next.at });
  }
  if (playedLog.length > LOG_CAP) playedLog.length = LOG_CAP;
}

function duckedVolume(entry) {
  const active = sounding ? [sounding, ...waiting] : [...waiting];
  if (entry.priority >= 3 && active.some(e => e.priority <= 2)) return +(entry.volume * DUCK_FACTOR).toFixed(3);
  if (entry.priority === 4 && active.some(e => e.priority === 3)) return +(entry.volume * DUCK_FACTOR).toFixed(3);
  return entry.volume;
}

export const HouseBand = {
  play(id, opts = {}) {
    if (killed) return false;
    const priority = opts.priority ?? BAND_PRIORITIES.P3_SOCIAL;
    if (priority === BAND_PRIORITIES.P0_SILENCE) { HouseBand.killAll(); return false; }
    const entry = { id, priority, volume: opts.volume ?? 1, loop: !!opts.loop, at: Date.now() };
    if (sounding && sounding.loop && priority < sounding.priority) {
      waiting.push(sounding);
      sounding = null;
    }
    waiting.push(entry);
    advance();
    return true;
  },
  flush() {
    if (killed) return;
    const loops = [];
    for (const e of waiting) {
      if (e.loop) { loops.push(e); continue; }
      playedLog.unshift({ id: e.id, priority: e.priority, at: e.at });
    }
    waiting = loops;
    if (playedLog.length > LOG_CAP) playedLog.length = LOG_CAP;
  },
  killAll() {
    waiting = [];
    sounding = null;
    killed = true;
  },
  restore() {
    if (!killed) return;
    killed = false;
    if (moodWord !== null) {
      waiting.push({ id: "bed." + moodWord, priority: BAND_PRIORITIES.P4_BED, volume: 1, loop: true, at: Date.now() });
      advance();
    }
  },
  setMood(word) { moodWord = word; },
  setRegime(r) { regime = r; },
  setMuted(m) {
    muted = !!m;
    try { localStorage.setItem("hfes_muted", muted ? "1" : "0"); } catch (e) {}
  },
  isMuted() { return muted; },
  isKilled() { return killed; },
  snapshot() {
    return {
      killed,
      muted,
      mood: moodWord,
      regime,
      sounding: sounding ? { id: sounding.id, priority: sounding.priority, loop: sounding.loop } : null,
      waiting: waiting.sort(byPriority).map(e => ({ id: e.id, priority: e.priority, loop: e.loop, effectiveVolume: duckedVolume(e) })),
      played: [...playedLog],
    };
  },
};

Bus.on(EVENTS.MOOD_CHANGED, (p) => { if (p && p.word) HouseBand.setMood(p.word); });
Bus.on(EVENTS.REGIME_CHANGED, (p) => { if (p && p.to) HouseBand.setRegime(p.to); });
Bus.on(EVENTS.PANIC_HIDDEN, () => { HouseBand.killAll(); });
Bus.on(EVENTS.PANIC_REVEALED, () => { HouseBand.restore(); });

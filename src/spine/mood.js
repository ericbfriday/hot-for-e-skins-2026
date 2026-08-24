import { Bus, EVENTS } from "./bus.js";

const BANDS = [
  { word: "Vindictive", min: 0.5, max: 0.7, weight: 32, favorable: false },
  { word: "Petty", min: 0.7, max: 0.9, weight: 28, favorable: false },
  { word: "Noncommittal", min: 0.9, max: 1.1, weight: 25, favorable: false },
  { word: "Benevolent-ish", min: 1.1, max: 1.4, weight: 9, favorable: true },
  { word: "Generous", min: 1.4, max: 2.0, weight: 6, favorable: true },
];
const TOTAL_WEIGHT = BANDS.reduce((a, b) => a + b.weight, 0);
const DEMOTION_POOL = BANDS.filter(b => !b.favorable);
const MAX_LOOKBACK = 32;

function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function prevKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function drawFrom(rng, band) {
  return { word: band.word, multiplier: +(band.min + rng() * (band.max - band.min)).toFixed(4), favorable: band.favorable };
}
function rawFor(key, salt) {
  const rng = mulberry32(hashString(key + "#" + salt));
  let roll = rng() * TOTAL_WEIGHT;
  let band = BANDS[BANDS.length - 1];
  for (const b of BANDS) {
    if (roll < b.weight) { band = b; break; }
    roll -= b.weight;
  }
  return drawFrom(rng, band);
}
function demote(key) {
  const rng = mulberry32(hashString(key + "#demoted"));
  const band = DEMOTION_POOL[Math.floor(rng() * DEMOTION_POOL.length)];
  return drawFrom(rng, band);
}
function resolve(key, depth) {
  const raw = rawFor(key, 0);
  if (!raw.favorable || depth >= MAX_LOOKBACK) return raw;
  const prev = resolve(prevKey(key), depth + 1);
  if (!prev.favorable) return raw;
  return demote(key);
}
function toValidDate(date) {
  return date instanceof Date && !isNaN(date) ? date : new Date();
}
function draw(date) {
  return resolve(dateKey(toValidDate(date)), 0);
}

const callbacks = new Set();
let started = false;
let lastKey = null;
let watcher = null;

function notify(payload) {
  Bus.emit(EVENTS.MOOD_CHANGED, payload);
  for (const cb of [...callbacks]) {
    try { cb(payload); } catch (e) {}
  }
}
function ensureWatcher() {
  if (watcher) return;
  lastKey = dateKey(new Date());
  watcher = setInterval(() => {
    const nowKey = dateKey(new Date());
    if (nowKey !== lastKey) {
      const word = draw(new Date()).word;
      lastKey = nowKey;
      try { localStorage.setItem("hfes_mood_date", nowKey); } catch (e) {}
      notify({ word, prev: null, crossedMidnight: true });
    }
  }, 30000);
}

export const Mood = {
  word(date) { return draw(date).word; },
  multiplier(date) { return draw(date).multiplier; },
  seed(date) { return hashString(dateKey(toValidDate(date))); },
  onChange(cb) {
    if (typeof cb !== "function") return () => {};
    callbacks.add(cb);
    ensureWatcher();
    return () => { callbacks.delete(cb); };
  },
  init() {
    if (started) return;
    started = true;
    ensureWatcher();
    const word = Mood.word();
    try { localStorage.setItem("hfes_mood_date", lastKey); } catch (e) {}
    notify({ word, prev: word, crossedMidnight: false });
  },
};

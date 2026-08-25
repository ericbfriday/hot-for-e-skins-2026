// Persisted chat state — composition contract (integration.md §1, live-chat.md §13):
// chat emits nothing on the bus, only these three localStorage flags. The ambient
// feed itself is generated live and never persisted.
const FLAGS_KEY = "hfes_chat_flags";
const COOLDOWN_KEY = "hfes_chat_cooldown";
const GRATUITY_KEY = "hfes_chat_gratuity_count";

export function loadFlags() {
  try {
    const v = JSON.parse(localStorage.getItem(FLAGS_KEY) || "null");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}
export function markFlag(key) {
  const flags = loadFlags();
  if (flags[key]) return false;
  flags[key] = true;
  try { localStorage.setItem(FLAGS_KEY, JSON.stringify(flags)); } catch (e) {}
  return true;
}
export function hasFlag(key) {
  return !!loadFlags()[key];
}

export function loadCooldownLevel() {
  try {
    const v = parseInt(localStorage.getItem(COOLDOWN_KEY), 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch (e) { return 0; }
}
export function bumpCooldownLevel() {
  const n = loadCooldownLevel() + 1;
  try { localStorage.setItem(COOLDOWN_KEY, String(n)); } catch (e) {}
  return n;
}
export function cooldownSecondsForLevel(level) {
  if (level <= 0) return 0;
  return 10 * Math.pow(2, level - 1);
}

export function loadGratuityCount() {
  try {
    const v = parseInt(localStorage.getItem(GRATUITY_KEY), 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch (e) { return 0; }
}
export function bumpGratuityCount() {
  const n = loadGratuityCount() + 1;
  try { localStorage.setItem(GRATUITY_KEY, String(n)); } catch (e) {}
  return n;
}

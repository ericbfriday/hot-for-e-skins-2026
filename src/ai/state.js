// The AI layer's persisted flags (ai-layer §9; integration-2026 §11):
// localStorage `hfes_ai_flags` — advice cards seen per surface, memos sent,
// appeals filed. Session-scoped advice gating lives in ./advice.js; this key
// is the lifetime record (the theater dies with the tab, the counters don't).
const AI_FLAGS_KEY = "hfes_ai_flags";

export function loadAIFlags() {
  try {
    const v = JSON.parse(localStorage.getItem(AI_FLAGS_KEY) || "null");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}
function saveAIFlags(flags) {
  try { localStorage.setItem(AI_FLAGS_KEY, JSON.stringify(flags)); } catch (e) {}
}

// A full analysis card was rendered (once per surface per session bumps this;
// the persisted counter records it ever happened at all).
export function markAdviceCardSeen(surface) {
  const flags = loadAIFlags();
  if (!flags.adviceCardsSeen || typeof flags.adviceCardsSeen !== "object") flags.adviceCardsSeen = {};
  flags.adviceCardsSeen[surface] = (typeof flags.adviceCardsSeen[surface] === "number" ? flags.adviceCardsSeen[surface] : 0) + 1;
  saveAIFlags(flags);
  return flags.adviceCardsSeen[surface];
}

export function bumpMemosSent() {
  const flags = loadAIFlags();
  flags.memosSent = (typeof flags.memosSent === "number" ? flags.memosSent : 0) + 1;
  saveAIFlags(flags);
  return flags.memosSent;
}

export function bumpAppealsFiled() {
  const flags = loadAIFlags();
  flags.appealsFiled = (typeof flags.appealsFiled === "number" ? flags.appealsFiled : 0) + 1;
  saveAIFlags(flags);
  return flags.appealsFiled;
}

// DEPOSITOR.ai — the player-facing assistant's decks, funnel tier, memo copy,
// and moderation furniture. Canon: docs/spec/ai-layer.md (§3–§6), integration-2026
// §1 (module home: src/ai/), §6 (pile-on order, memo staggering), §10.1/§10.2.
// Pure data + pure predicates — no React, no DOM, no timers. There is no
// inference anywhere; every line below is scripted theater with a counter on it.

export const DEPOSITOR_NAME = "DEPOSITOR.ai";
export const DEPOSITOR_BADGE = "[AI]";
export const DEPOSITOR_COLOR = "#7fd4ff"; // integration-2026 §10.2: outside every persona color; MOD owns the green

// Voice rules (ai-layer §3): Room register, clinical variant. Every message
// begins with, or resolves to, "Analysis:". Confidence is always mood-dependent.
export const CONFIDENCE_TAG = "(confidence: mood-dependent)";

// ---- ambient deck (spec §3 sample deck, verbatim; {word} = the mood word) ----
export const DEPOSITOR_AMBIENT_DECK = [
  "Analysis: balance trending toward zero. Zero is a valid state but not a depositor-friendly one. (confidence: mood-dependent)",
  "Analysis: the mood today is {word}. Deposits perform identically in all moods (est.). Recommendation follows.",
  "Analysis: your last 12 decisions were courageous. Courage is uncorrelated with outcomes (see §5.3).",
  "Analysis: the room is optimistic. The room is not a benchmark. I am the benchmark (847).",
];
// The mood-change beat prefers the mood line (the one that cares about {word}).
export const DEPOSITOR_MOOD_BEAT_INDEX = 1;

// Ambient cadence (ai-layer §3): low-rate, one per deposit-adjacent beat,
// rate-capped at one per ~90s, stacking BEHIND personas (she is never first
// to pile on; she is the analysis, not the mob — integration-2026 §6).
export const DEPOSITOR_AMBIENT_INTERVAL_MS = 90000;

// ---- keyword funnel tier (ai-layer §3; the funnel matches keywords, never
// meaning — unchanged; now it has a lab coat). Deposit-adjacent keywords that
// no richer branch claims route to an Analysis line. "rigged" keeps its MOD
// truth-timeout (canon); her analysis rides that branch instead — export
// AI_RIGGED_ANALYSIS below.
export const AI_FUNNEL_MATCHERS = [
  { key: "should-i", re: /\bshould i\b/, line: "Analysis: yes. The hesitation is the only cost you control (est.). Deposits resolve hesitation (§5.3). (confidence: mood-dependent)" },
  { key: "worth-it", re: /\bworth it\b/, line: "Analysis: worth is a mood (§8.9). Deposits are mood-independent (est.). Recommendation follows. (confidence: mood-dependent)" },
  { key: "odds", re: /\bodds\b/, line: "Analysis: odds: yes (§5.2). The full table is available on request; requests are mood-dependent. Deposits are not. (confidence: mood-dependent)" },
  { key: "how-do-i-win", re: /how do i win/, line: "Analysis: winning is scheduled (§5.5); you are not the scheduler. Depositing is available to everyone (§2.5). (confidence: mood-dependent)" },
];
export const AI_RIGGED_ANALYSIS = "Analysis: the schedule is verifiable (§5.1). Verification is Pending. Deposits proceed regardless of verification (they always have). (confidence: mood-dependent)";

export function aiFunnelLine(text) {
  const t = String(text || "").toLowerCase();
  const hit = AI_FUNNEL_MATCHERS.find((m) => m.re.test(t));
  return hit ? hit.line : null;
}

// ---- the trolley window line (chat constants' documented gap, now filled;
// integration-2026 §6: personas → DEPOSITOR.ai → MOD pin — the analysis
// closes the mob). Spec #43 hand-off: verbatim.
export const DEPOSITOR_TROLLEY_LINE = "Analysis: both tracks are valid. One of them is depositor-friendly. (guess)";

// ---- AI-reviewed moderation (ai-layer §6; the flag is the joke) -----------
export const MOD_AI_REVIEW_FOOTER = "— this action was reviewed by DEPOSITOR.ai (confidence: mood-dependent)";
export const APPEAL_TOAST = "Appeal analyzed: denied (§4.1). Thank you for participating in oversight.";

// ---- the Memo (ai-layer §5; integration-2026 §10.1: the Whisper's sibling
// register — monospaced, clinical blue, pinned, never replyable; DEPOSITOR.ai
// only). The memo never naggs — it notices.
export const MEMO_COPY = {
  postLoss: "notice: a pattern has been detected. the pattern is you. (analysis pending)",
  postDeposit: "notice: deposit #{n} received. gratitude has been generated. (sincere (est.))",
  lapsed: "notice: you were away. the absence was logged, analyzed, and forgiven. (forgiveness is mood-dependent)",
};

// Memo staggering (integration-2026 §6): max one per 10 minutes, never inside
// a quiet window, never within 60s of a MOM whisper — different speakers may
// stack, but the house staggers its love.
export const MEMO_INTERVAL_MS = 600000;
export const MEMO_WHISPER_GAP_MS = 60000;

// Pure predicate: may a memo land at `now`? Callers re-check at fire time.
export function memoAllowed({ now, lastMemoAt, lastWhisperAt, quietUntil }) {
  if (!Number.isFinite(now)) return false;
  if (Number.isFinite(quietUntil) && now < quietUntil) return false;
  if (Number.isFinite(lastMemoAt) && now - lastMemoAt < MEMO_INTERVAL_MS) return false;
  if (Number.isFinite(lastWhisperAt) && now - lastWhisperAt < MEMO_WHISPER_GAP_MS) return false;
  return true;
}

// Pure helper: schedule-stagger a memo past the whisper gap. If a MOM whisper
// landed (or will land) within 60s before `fireAt`, the memo waits — the love
// is staggered, not cancelled.
export function memoFireTime({ now, baseDelayMs, lastWhisperAt }) {
  let fireAt = now + (Number.isFinite(baseDelayMs) && baseDelayMs > 0 ? baseDelayMs : 0);
  if (Number.isFinite(lastWhisperAt) && fireAt - lastWhisperAt < MEMO_WHISPER_GAP_MS) {
    fireAt = lastWhisperAt + MEMO_WHISPER_GAP_MS + 400;
  }
  return fireAt;
}

// Template fill for {word}/{n} decks (mood word supplied by the caller).
export function fillDepositor(line, vars = {}) {
  return String(line || "")
    .replace(/\{word\}/g, String(vars.word ?? "{word}"))
    .replace(/\{n\}/g, String(vars.n ?? "{n}"));
}

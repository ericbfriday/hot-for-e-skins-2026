import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mood } from "../spine/mood.js";
import { Bus, EVENTS, Regime } from "../spine/bus.js";
import { Identity, RESERVED_CAST, YOU_COLOR } from "../spine/identity.js";
import { POPULATION } from "../spine/constants.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import { Retention, COPY as RETENTION_COPY } from "../retention/state.js";
// #43 AI layer (ai-layer §3/§5/§6; integration-2026 §6/§10.1): DEPOSITOR.ai's
// ambient cadence, keyword funnel tier, Memo register, and AI-reviewed MOD.
import {
  DEPOSITOR_NAME, DEPOSITOR_COLOR, DEPOSITOR_AMBIENT_DECK, DEPOSITOR_MOOD_BEAT_INDEX,
  DEPOSITOR_AMBIENT_INTERVAL_MS, aiFunnelLine, AI_RIGGED_ANALYSIS,
  MOD_AI_REVIEW_FOOTER, APPEAL_TOAST, MEMO_COPY, memoAllowed, memoFireTime, fillDepositor,
} from "../ai/decks.js";
import { bumpMemosSent, bumpAppealsFiled } from "../ai/state.js";
import { createPersonaSession, pickArchetype, pickLine } from "./personas.js";
import {
  SCROLLBACK_MAX, FADE_MS, ARCHIVE_MS, ARCHIVE_LINE,
  CADENCE_BASE_MIN_MS, CADENCE_BASE_MAX_MS, CADENCE_PRESSURE_MIN_MS, CADENCE_PRESSURE_MAX_MS,
  QUIET_WINDOW_MIN_MS, QUIET_WINDOW_MAX_MS, QUIET_WINDOW_LINES,
  WHALE_NAME, WHALE_LINES, CONSCIENCE_NAME, CONSCIENCE_STICK_LINE, CONSCIENCE_TOO_LATE_LINE,
  MOOD_CHATTER, QUICK_PHRASES, RATE_LIMIT_WINDOW_MS, GRATUITY_EVERY_N, GRATUITY_BB,
  GRATUITY_LINE, GRATUITY_WAIVED_LINE, FLOOD_LINE_TEMPLATE, FLOOD_FINE_PRINT, COOLDOWN_CLICK_LINE,
  WHISPER_NOT_REPLYABLE_LINE, MOM_WHISPER_DECK, TIMEOUT_REASONS, TIMEOUT_DURATION_MS,
  TIMEOUT_AMBIENT_LINES, REDACTION_LINE, WIN_DELETE_LINE, WIN_BREATHE_LINES, MINOR_ESCALATION,
  RAIN_INELIGIBLE_LINE, RAIN_KEYWORD_LINE, ONLINE_TOOLTIP, TROLLEY_WINDOW_LINES, SKINCHAIN_CHAT_LINES,
  FOUNDRY_CHAT_LINES, PASS_CHAT_LINES,
} from "./constants.js";
import {
  loadFlags, markFlag, hasFlag, loadCooldownLevel, bumpCooldownLevel, cooldownSecondsForLevel,
  loadGratuityCount, bumpGratuityCount,
} from "./state.js";

const CAST = Object.fromEntries(RESERVED_CAST.map((c) => [c.name, c]));
// #42 (integration-2026 §3/§10.5): the trolley's win kinds join the win kinds —
// the room gathers, MOD strikes it through, quiet window applies.
const WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win", "verdict-win", "character-verdict"]);

function playerTag() { return Identity.playerTag() || "you"; }

export default function ChatPanel({ panicActive = false, hooks = {}, gameFeed = [] }) {
  const [entries, setEntries] = useState([]);
  const [online, setOnline] = useState(POPULATION);
  const [inputText, setInputText] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [timeoutUntil, setTimeoutUntil] = useState(null);
  const [timeoutReason, setTimeoutReason] = useState(null);
  const [tick, setTick] = useState(0);
  const [rainFx, setRainFx] = useState(null);      // #31 Mom Weather™ falling emoji
  const [umbrellaUntil, setUmbrellaUntil] = useState(0);

  const idRef = useRef(0);
  const personaRef = useRef(createPersonaSession());
  const sessionLossRef = useRef(0);
  const lastSentAtRef = useRef(0);
  const minorStrikesRef = useRef(0);
  const ignoredStreakRef = useRef(0);
  const rotationRef = useRef(0);
  const quietUntilRef = useRef(0);
  const crashStickRef = useRef(0);
  const conscienceArmedRef = useRef(false);
  const askMomPileTimerRef = useRef(null);
  const timersRef = useRef([]);
  const ambientTimerRef = useRef(null);
  const mikeOpenedThisSessionRef = useRef(false);
  const rainTimerRef = useRef(null);       // #32: the ~20-min rain clock (chat §11)
  const rainUntilRef = useRef(0);          // eligibility window ("if you interact")
  const rainEligSaidRef = useRef(false);
  const seenGameIdsRef = useRef(new Set()); // #32: gameFeed bridge drain state
  const lastWhisperAtRef = useRef(0);      // #43: memo staggering vs MOM whispers
  const lastMemoAtRef = useRef(0);         // #43: the Memo's 10-minute cap
  const depositorUntilRef = useRef(0);     // #43: ambient cadence, one per ~90s

  const nextId = useCallback(() => { idRef.current += 1; return idRef.current; }, []);

  const pushEntry = useCallback((partial) => {
    const entry = { id: nextId(), ts: Date.now(), ...partial };
    setEntries((prev) => {
      const next = [entry, ...prev];
      const pinnedCount = next.filter((e) => e.pinned).length;
      const cap = SCROLLBACK_MAX + pinnedCount;
      return next.length > cap ? next.slice(0, cap) : next;
    });
    return entry.id;
  }, [nextId]);

  const pushCast = useCallback((name, msg, extra = {}) => {
    const c = CAST[name];
    return pushEntry({ user: name, color: c ? c.color : "#e8c9ac", badge: c ? c.badge : undefined, msg, ...extra });
  }, [pushEntry]);

  const pushWhisper = useCallback((text, extra = {}) => {
    // The audible layer: a soft close-mic'd breath-chime, above the crowd,
    // bypassing the mute (audio-gags §3 — "it's intimate like that").
    HouseBand.play("mom.whisper", { priority: BAND_PRIORITIES.P3_SOCIAL });
    lastWhisperAtRef.current = Date.now(); // #43: the house staggers its love (memo gap)
    return pushEntry({ user: "MOM", badge: "[VIP HOST]", color: "#ff9ad5", msg: text, whisper: true, pinned: true, ...extra });
  }, [pushEntry]);

  // #43 The Memo register (ai-layer §5; integration-2026 §10.1): the Whisper's
  // sibling — monospaced, clinical blue, pinned (exempt from decay, like every
  // pinned entry), never replyable (no click handler, no cursor). It notices;
  // it never naggs. Service, not interruption (integration-2026 §5).
  const pushMemo = useCallback((text) => {
    HouseBand.play("ai.memo", { priority: BAND_PRIORITIES.P3_SOCIAL, volume: 0.8 });
    lastMemoAtRef.current = Date.now();
    bumpMemosSent();
    return pushEntry({ user: DEPOSITOR_NAME, badge: "[AI]", color: DEPOSITOR_COLOR, msg: text, memo: true, pinned: true });
  }, [pushEntry]);

  const pushAmbientLine = useCallback((text, archetypeOverride) => {
    const archetype = archetypeOverride || pickArchetype();
    // #32 (audio-gags §3): the crowd types — quiet typewriter taps, persona-typed
    // (hype kids slightly louder), and definitely-bots get the flat monotone
    // beep. Bots beep. This is disclosure.
    if (archetype.key === "bot") {
      HouseBand.play("chat.botbeep", { priority: BAND_PRIORITIES.P3_SOCIAL });
    } else {
      HouseBand.play("chat.tap", { priority: BAND_PRIORITIES.P3_SOCIAL, volume: archetype.key === "hype" ? 1.35 : 1 });
    }
    if (archetype.isWhale) {
      return pushEntry({ user: WHALE_NAME, color: "#e8c9ac", msg: text });
    }
    const name = personaRef.current.nameFor(archetype.key);
    return pushEntry({ user: name, color: archetype.color, msg: text });
  }, [pushEntry]);

  const pushAmbientRandom = useCallback(() => {
    // Mood weather chatter at low cadence — the rate never shows, only the adjective.
    if (Math.random() < 0.12) {
      const deck = MOOD_CHATTER[Mood.word()] || [];
      if (deck.length) { pushAmbientLine(deck[Math.floor(Math.random() * deck.length)]); return; }
    }
    // #44 SkinChain™ (skinchain §4): the chain's chat lines at low cadence —
    // the room waits for block one; DEPOSITOR.ai renders via the reserved cast.
    if (Math.random() < 0.05) {
      const line = SKINCHAIN_CHAT_LINES[Math.floor(Math.random() * SKINCHAIN_CHAT_LINES.length)];
      if (line.cast) { pushCast(line.cast, line.msg); return; }
      pushEntry({ user: line.user, color: line.color, msg: line.msg });
      return;
    }
    // #45 AI Skin Foundry (foundry §7): the dreams' chat lines at low cadence —
    // the room reacts to the renders; DEPOSITOR.ai analyzes the originals (est.).
    if (Math.random() < 0.04) {
      const line = FOUNDRY_CHAT_LINES[Math.floor(Math.random() * FOUNDRY_CHAT_LINES.length)];
      if (line.cast) { pushCast(line.cast, line.msg); return; }
      pushEntry({ user: line.user, color: line.color, msg: line.msg });
      return;
    }
    // #46 the Pass (battle-pass §7): the ladder's ambient takes at low cadence —
    // the analysis closes the mob; the whale is already paved.
    if (Math.random() < 0.03) {
      const line = PASS_CHAT_LINES[Math.floor(Math.random() * PASS_CHAT_LINES.length)];
      if (line.cast) { pushCast(line.cast, line.msg); return; }
      pushEntry({ user: line.user, color: line.color, msg: line.msg });
      return;
    }
    const archetype = pickArchetype();
    if (archetype.isWhale) {
      const line = WHALE_LINES[Math.floor(Math.random() * WHALE_LINES.length)];
      pushEntry({ user: WHALE_NAME, color: "#e8c9ac", msg: line });
      return;
    }
    const line = pickLine(archetype);
    if (line) pushAmbientLine(line, archetype);
  }, [pushAmbientLine, pushCast, pushEntry]);

  const scheduleAmbient = useCallback(() => {
    const now = Date.now();
    const inQuiet = now < quietUntilRef.current;
    const stats = Identity.getStats();
    const pressured = (stats.lossStreak || 0) >= 3 || Regime.current() === "desperation";
    const [min, max] = pressured ? [CADENCE_PRESSURE_MIN_MS, CADENCE_PRESSURE_MAX_MS] : [CADENCE_BASE_MIN_MS, CADENCE_BASE_MAX_MS];
    const delay = inQuiet ? 900 : min + Math.random() * (max - min);
    ambientTimerRef.current = setTimeout(() => {
      if (Date.now() >= quietUntilRef.current) pushAmbientRandom();
      scheduleAmbient();
    }, delay);
  }, [pushAmbientRandom]);

  const addTimer = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  // #43 Memo scheduling: staggered past any MOM whisper (never within 60s —
  // different speakers may stack, but the house staggers its love), re-checked
  // against the quiet window and the 10-minute cap at fire time. A blocked
  // notice was never noticed.
  const maybeMemo = useCallback((kind, vars, baseDelayMs) => {
    const now = Date.now();
    const fireAt = memoFireTime({ now, baseDelayMs, lastWhisperAt: lastWhisperAtRef.current });
    addTimer(() => {
      if (!memoAllowed({
        now: Date.now(),
        lastMemoAt: lastMemoAtRef.current,
        lastWhisperAt: lastWhisperAtRef.current,
        quietUntil: quietUntilRef.current,
      })) return;
      pushMemo(fillDepositor(MEMO_COPY[kind], vars));
    }, Math.max(0, fireAt - now));
  }, [addTimer, pushMemo]);

  // #43 DEPOSITOR.ai ambient cadence (ai-layer §3): low-rate, one line per
  // deposit-adjacent beat, capped at one per ~90s, stacking BEHIND personas —
  // she is never the first to pile on; she is the analysis, not the mob. She
  // never speaks during the quiet window (she schedules around it; the cap is
  // consumed only when the line lands).
  const maybeDepositor = useCallback((line, delayMs) => {
    addTimer(() => {
      const now = Date.now();
      if (now < quietUntilRef.current) return;
      if (now < depositorUntilRef.current) return;
      depositorUntilRef.current = now + DEPOSITOR_AMBIENT_INTERVAL_MS;
      pushCast(DEPOSITOR_NAME, line);
    }, delayMs);
  }, [addTimer, pushCast]);

  const depositorAmbientLine = useCallback((beat) => {
    const vars = { word: Mood.word() };
    const idx = beat === "mood"
      ? DEPOSITOR_MOOD_BEAT_INDEX
      : Math.floor(Math.random() * DEPOSITOR_AMBIENT_DECK.length);
    return fillDepositor(DEPOSITOR_AMBIENT_DECK[idx], vars);
  }, []);

  const triggerQuietWindow = useCallback(() => {
    const dur = QUIET_WINDOW_MIN_MS + Math.random() * (QUIET_WINDOW_MAX_MS - QUIET_WINDOW_MIN_MS);
    quietUntilRef.current = Date.now() + dur;
    addTimer(() => {
      const line = QUIET_WINDOW_LINES[Math.floor(Math.random() * QUIET_WINDOW_LINES.length)];
      pushAmbientLine(line);
      // #32: one flat beep with the "who?" — the loudest thing on the site, said once.
      HouseBand.play("chat.who", { priority: BAND_PRIORITIES.P3_SOCIAL });
    }, dur + 200);
  }, [addTimer, pushAmbientLine]);

  const triggerWinSequence = useCallback(() => {
    // §10: the room lets a fake win breathe for ~3s, then MOD strikes it through.
    WIN_BREATHE_LINES.forEach((line, i) => addTimer(() => pushAmbientLine(line), 400 + i * 500));
    // #43 (ai-layer §6 + integration-2026 §2): the deletion gains the
    // AI-review footer, and the chat emits mod.deleted {tag} — the one
    // sanctioned bus emit from chat (the ruling mints it; deletions are
    // settled facts). Consumers: the pass (#44); StatTrak (winsDeleted, #46).
    addTimer(() => {
      pushCast("MOD_Chad_Official", WIN_DELETE_LINE, { note: MOD_AI_REVIEW_FOOTER });
      Bus.emit(EVENTS.MOD_DELETED, { tag: playerTag() });
    }, 3000);
    addTimer(() => triggerQuietWindow(), 3200);
  }, [addTimer, pushAmbientLine, pushCast, triggerQuietWindow]);

  const triggerTimeout = useCallback((reasonKey) => {
    if (timeoutUntil && Date.now() < timeoutUntil) return;
    setTimeoutUntil(Date.now() + TIMEOUT_DURATION_MS);
    setTimeoutReason(TIMEOUT_REASONS[reasonKey] || reasonKey);
    // #32 (audio-gags §3): one muffled ban-hammer. Modesty is a mixing choice.
    HouseBand.play("chat.thud", { priority: BAND_PRIORITIES.P3_SOCIAL });
    const line = TIMEOUT_AMBIENT_LINES[Math.floor(Math.random() * TIMEOUT_AMBIENT_LINES.length)];
    addTimer(() => pushAmbientLine(line), 400);
  }, [addTimer, pushAmbientLine, timeoutUntil]);

  const runKeywordFunnel = useCallback((text, ownMsgId) => {
    const t = text.toLowerCase();
    if (/mom/.test(t)) {
      addTimer(() => pushAmbientLine("did you ask her"), 1200);
      addTimer(() => pushAmbientLine("W mom"), 1900);
      addTimer(() => pushAmbientLine("she's a real one"), 2600);
      addTimer(() => pushWhisper(MOM_WHISPER_DECK.momKeyword), 1500);
      addTimer(() => pushCast("MOMCODE_MIKE", "the code is MOM"), 2000);
      return true;
    }
    if (/refund/.test(t)) {
      addTimer(() => pushCast("AdminTradeBot_69", "refund is a §6 concept."), 1300);
      addTimer(() => pushCast("MOD_Chad_Official", "refunds are processed in the order they are deserved."), 2200);
      return true;
    }
    if (/scam|rigged|fake/.test(t)) {
      addTimer(() => {
        setEntries((prev) => prev.map((e) => (e.id === ownMsgId ? { ...e, struck: true, note: REDACTION_LINE } : e)));
      }, 1200);
      // #43 (ai-layer §3/§6): "rigged" routes to a DEPOSITOR.ai analysis line
      // too — after the strike, before the timeout (the analysis closes the
      // mob; the truth-branch consequences are canon and unchanged).
      addTimer(() => {
        if (Date.now() < quietUntilRef.current) return; // she never speaks during the quiet window
        pushCast(DEPOSITOR_NAME, AI_RIGGED_ANALYSIS);
      }, 1650);
      addTimer(() => triggerTimeout("truth"), 1800);
      return true;
    }
    if (/\bhelp\b/.test(t)) {
      addTimer(() => pushCast("AdminTradeBot_69", "Have you tried asking Mom?"), 1400);
      return true;
    }
    if (/withdraw|cash out/.test(t)) {
      addTimer(() => pushCast("AdminTradeBot_69", "withdrawals are pending (§1.3). yours specifically: pending."), 1300);
      addTimer(() => pushAmbientLine("lol he's trying to withdraw"), 2400);
      return true;
    }
    if (/\blegit\b/.test(t)) {
      addTimer(() => pushAmbientLine("100% legit won 3 karambits here"), 1300);
      addTimer(() => pushAmbientLine("legit as my mom's card"), 2100);
      return true;
    }
    if (/\bminor\b/.test(t)) {
      minorStrikesRef.current += 1;
      const n = minorStrikesRef.current;
      // #43 (ai-layer §6): vibe violations gain the AI-review footer (the flag
      // is the joke; behavior unchanged).
      if (n === 1) addTimer(() => pushCast("MOD_Chad_Official", MINOR_ESCALATION[0], { note: MOD_AI_REVIEW_FOOTER }), 1200);
      else if (n === 2) addTimer(() => pushCast("MOD_Chad_Official", MINOR_ESCALATION[1], { note: MOD_AI_REVIEW_FOOTER }), 1200);
      else addTimer(() => triggerTimeout("minor"), 1200);
      return true;
    }
    if (/momcode/i.test(t)) {
      addTimer(() => pushCast("MOD_Chad_Official", "impersonating the owner is a Tier 1 vibe violation (he loves it though)", { note: MOD_AI_REVIEW_FOOTER }), 1400);
      return true;
    }
    if (/rain/.test(t)) {
      addTimer(() => pushCast("AdminTradeBot_69", RAIN_KEYWORD_LINE), 1300);
      return true;
    }
    // #43 (ai-layer §3): the funnel gains an AI tier above MOD's — the
    // deposit-adjacent keywords ("should i", "worth it", "odds", "how do i
    // win") route to a DEPOSITOR.ai Analysis line. Placed after the richer
    // branches so no landed behavior regresses (e.g. "should i ask mom" keeps
    // its MOM pile); "rigged" keeps its truth-timeout above, with her analysis
    // riding that branch. The funnel matches keywords, never meaning —
    // unchanged; now it has a lab coat.
    const aiLine = aiFunnelLine(trimmed);
    if (aiLine) {
      addTimer(() => {
        if (Date.now() < quietUntilRef.current) return; // she never speaks during the quiet window
        pushCast(DEPOSITOR_NAME, aiLine);
      }, 1300);
      return true;
    }
    return false;
  }, [addTimer, pushAmbientLine, pushCast, pushWhisper, triggerTimeout]);

  const runDefaultNonResponse = useCallback((text) => {
    ignoredStreakRef.current += 1;
    if (ignoredStreakRef.current % 3 === 0) {
      addTimer(() => pushAmbientLine("same"), 2400);
    }
    const opt = rotationRef.current % 4;
    rotationRef.current += 1;
    if (opt === 0) return; // silence — the room moves on
    if (opt === 1) addTimer(() => pushAmbientLine("who asked"), 3000);
    else if (opt === 2) addTimer(() => pushAmbientLine("W"), 2000);
    else if (opt === 3) {
      const delay = 120000 + Math.random() * 120000;
      addTimer(() => {
        const name = personaRef.current.nameFor("bot");
        pushEntry({ user: name, color: "#a9705a", msg: text });
      }, delay);
    }
  }, [addTimer, pushAmbientLine, pushEntry]);

  const send = (text, opts = {}) => {
    const now = Date.now();
    if (timeoutUntil && now < timeoutUntil) return;
    if (cooldownUntil && now < cooldownUntil) {
      pushCast("MOD_Chad_Official", COOLDOWN_CLICK_LINE);
      return;
    }
    const trimmed = String(text || "").slice(0, 100);
    if (!trimmed) return;
    // #32 (chat §11): interacting during a rain event states your eligibility,
    // once per event — 0.0s of it (rounded down, §8.9; your region: no).
    if (now < rainUntilRef.current && !rainEligSaidRef.current) {
      rainEligSaidRef.current = true;
      pushEntry({ system: true, msg: "You were eligible for 0.0s of rain (rounded down, §8.9)." });
    }
    const wasWithinWindow = lastSentAtRef.current && now - lastSentAtRef.current < RATE_LIMIT_WINDOW_MS;
    lastSentAtRef.current = now;

    const ownId = pushEntry({ user: playerTag(), color: YOU_COLOR, isYou: true, msg: trimmed });
    if (!opts.viaQuickPhrase) setInputText("");

    if (wasWithinWindow) {
      const level = bumpCooldownLevel();
      const seconds = cooldownSecondsForLevel(level);
      setCooldownUntil(now + seconds * 1000);
      pushEntry({ system: true, msg: FLOOD_LINE_TEMPLATE.replace("{s}", seconds) + " " + FLOOD_FINE_PRINT });
    }

    const gCount = bumpGratuityCount();
    if (gCount % GRATUITY_EVERY_N === 0) {
      const res = (hooks.gratuity && hooks.gratuity(GRATUITY_BB)) || { waived: true };
      pushEntry({ system: true, msg: res.waived ? GRATUITY_WAIVED_LINE : GRATUITY_LINE });
    }

    const matched = runKeywordFunnel(trimmed, ownId);
    if (!matched) runDefaultNonResponse(trimmed);
  };

  const onWhisperClick = () => {
    pushEntry({ system: true, msg: WHISPER_NOT_REPLYABLE_LINE });
  };

  // #43 (ai-layer §6): the timeout box's APPEAL button. Pressing it files the
  // appeal (hfes_ai_flags) and toasts the analysis — the App owns the toast
  // venue via hooks.appeal; the fallback line keeps chat self-sufficient.
  const onAppeal = () => {
    bumpAppealsFiled();
    if (hooks.appeal) hooks.appeal();
    else pushEntry({ system: true, msg: APPEAL_TOAST });
  };

  // ---- Bus wiring (mount once) ----
  useEffect(() => {
    const offs = [];

    offs.push(Bus.on(EVENTS.ROUND_SETTLED, (p) => {
      if (!p || p.wagered !== true) return;
      if (p.surface === "crash") crashStickRef.current = 0; // any settlement clears the stick streak
      if (WIN_KINDS.has(p.kind)) {
        if (p.kind === "character-win" && markFlag("firstCharacterWin")) {
          addTimer(() => pushAmbientLine("no way"), 300);
          addTimer(() => pushAmbientLine("screenshot or it didn't happen"), 900);
          addTimer(() => pushAmbientLine("the house lets one go per fiscal quarter"), 1500);
        }
        triggerWinSequence();
        return;
      }
      if (conscienceArmedRef.current && p.surface === "crash") {
        conscienceArmedRef.current = false;
        addTimer(() => pushEntry({ user: CONSCIENCE_NAME, color: "#e24a4a", msg: CONSCIENCE_TOO_LATE_LINE }), 300);
      }
      const net = typeof p.netBB === "number" ? p.netBB : 0;
      if (net < 0) {
        sessionLossRef.current += -net;
        const stats = Identity.getStats();
        if (-net >= 15 || (stats.lossStreak || 0) >= 5) {
          addTimer(() => pushCast("MOD_Chad_Official", "rough one. the house feels bad. deposits cheer everyone up."), 1200);
        }
        // #43 (ai-layer §5): post-loss empathy — the Memo notices; the
        // staggering rules (10-min cap, whisper gap, quiet window) do the pacing.
        maybeMemo("postLoss", {}, 2600);
      }
    }));

    offs.push(Bus.on(EVENTS.ROUND_BEAT, (p) => {
      if (!p || p.surface !== "crash") return;
      if (p.beat === "stick") {
        crashStickRef.current += 1;
        if (crashStickRef.current >= 3) {
          conscienceArmedRef.current = true;
          pushEntry({ user: CONSCIENCE_NAME, color: "#e24a4a", msg: CONSCIENCE_STICK_LINE });
        }
      } else if (p.beat === "dodge") {
        crashStickRef.current = 0;
      }
    }));

    offs.push(Bus.on(EVENTS.DEPOSIT_COMPLETED, (p) => {
      const payload = p || {};
      const tag = playerTag();
      const burstLines = ["W", "LEGEND", "mom's a real one", "certified depositor", tag + " ATE"];
      burstLines.forEach((line, i) => addTimer(() => pushAmbientLine(line), 500 + i * 350));
      addTimer(() => pushCast("MOD_Chad_Official", "🔔 " + tag + " just supported the community. community pillar."), 2200);
      if (payload.packageId === "lunch-money") {
        addTimer(() => pushAmbientLine("cute start"), 2600);
      }
      if (payload.packageId === "moms-max") {
        addTimer(() => pushWhisper(MOM_WHISPER_DECK.momsMax), 2400);
        addTimer(() => pushCast("MOD_Chad_Official", "the ledger resets (§10.3)."), 2900);
      } else {
        addTimer(() => pushWhisper(MOM_WHISPER_DECK.refill), 2400);
      }
      if (payload.firstEver && markFlag("firstDeposit")) {
        addTimer(() => pushCast("MOD_Chad_Official", tag + " made their first deposit. W come to mind."), 3200);
      }
      // #43 (ai-layer §5): post-deposit gratitude — the memo stagger pushes it
      // past the 2400ms refill whisper (the house staggers its love; gratitude
      // arrives exactly 60s after hers does).
      maybeMemo("postDeposit", { n: typeof payload.count === "number" && payload.count > 0 ? payload.count : 1 }, 2800);
    }));

    offs.push(Bus.on(EVENTS.ASKMOM_OPENED, () => {
      if (!mikeOpenedThisSessionRef.current) {
        mikeOpenedThisSessionRef.current = true;
        addTimer(() => pushCast("MOMCODE_MIKE", "the code is MOM"), 600);
      }
      const tag = playerTag();
      const lines = ["did you ask yet", "she said it's fine (it isn't)", "tell her it's for school", "everyone's watching " + tag];
      let i = 0;
      clearInterval(askMomPileTimerRef.current);
      askMomPileTimerRef.current = setInterval(() => {
        pushAmbientLine(lines[i % lines.length]);
        i += 1;
      }, 6000 + Math.random() * 3000);
      // #43 (ai-layer §3): askmom.opened is a deposit-adjacent beat — her line
      // lands behind the pile's first persona line (the interval opens at
      // 6–9s; she is the analysis, never the mob).
      maybeDepositor(depositorAmbientLine(), 9500);
    }));

    offs.push(Bus.on(EVENTS.ASKMOM_ABANDONED, () => {
      clearInterval(askMomPileTimerRef.current);
      addTimer(() => pushWhisper(MOM_WHISPER_DECK.abandoned), 400);
      addTimer(() => pushAmbientLine("she said no???"), 900);
      addTimer(() => pushCast("MOD_Chad_Official", "the responsible thing to do would've been yes."), 1500);
      // #43: behind the whisper, the persona, and MOD — the pile closes.
      maybeDepositor(depositorAmbientLine(), 2100);
    }));

    // #42 Moral Express (spec §9): the room erupts when a dilemma opens and
    // bets loudly through the window, all wrong. Personas first, DEPOSITOR.ai
    // second (the analysis closes the mob), MOD last — pile-on canon,
    // integration-2026 §6; the TROLLEY_WINDOW_LINES gap is filled (#43).
    offs.push(Bus.on(EVENTS.DILEMMA_OPENED, () => {
      TROLLEY_WINDOW_LINES.forEach((line, i) => {
        addTimer(() => pushEntry({ user: line.user, badge: line.badge, color: line.color, msg: line.msg }), 900 + i * 1400);
      });
    }));

    // #43 (ai-layer §3): the third track is a deposit-adjacent beat — every
    // stake on both sides was redirected to the Utilitarian Fund; she notices
    // (spectator dilemmas too; the ethics were free, the analysis isn't).
    offs.push(Bus.on(EVENTS.DILEMMA_SETTLED, (p) => {
      if (p && p.verdict === "third-track") maybeDepositor(depositorAmbientLine(), 1800);
    }));

    // #43 (ai-layer §3): a failed spend is a deposit-adjacent beat (the
    // intention was logged; intentions accrue).
    offs.push(Bus.on(EVENTS.SPEND_FAILED, () => {
      maybeDepositor(depositorAmbientLine(), 2200);
    }));

    // #43 (ai-layer §3): the mood-change beat — she reads the adjective and
    // files it (midnight crossings only; the session-start notify is not a
    // change, and she never opens the session's conversation).
    offs.push(Bus.on(EVENTS.MOOD_CHANGED, (p) => {
      if (p && p.crossedMidnight) maybeDepositor(depositorAmbientLine("mood"), 1500);
    }));

    // #43 (ai-layer §5): lapsed return — the first notice of a returning
    // session. The absence was logged, analyzed, and forgiven.
    offs.push(Bus.on(EVENTS.SESSION_STARTED, (p) => {
      if (p && p.returning) maybeMemo("lapsed", {}, 4000);
    }));

    offs.push(Bus.on(EVENTS.WITHDRAWAL_CREATED, () => {
      if (markFlag("firstWithdrawal")) {
        const tag = playerTag();
        addTimer(() => pushCast("AdminTradeBot_69", tag + " tried to withdraw (§1.3). bold."), 500);
      }
    }));

    offs.push(Bus.on(EVENTS.STATS_MILESTONE, (p) => {
      if (!p) return;
      const tag = playerTag();
      const key = p.field + ":" + p.value;
      if (p.field === "bbLost" && p.value === 100 && markFlag("milestone:" + key)) {
        addTimer(() => pushAmbientLine(tag + " hit 100 BB lost. thank you for your service."), 500);
      } else if (p.field === "usdBorrowed" && p.value === 50 && markFlag("milestone:" + key)) {
        addTimer(() => pushCast("MOD_Chad_Official", tag + " just crossed $50 of Mom's money. that's VIP material"), 500);
      } else if (p.field === "cratesOpened" && p.value === 10 && markFlag("milestone:" + key)) {
        addTimer(() => pushAmbientLine(tag + "'s at 10 crates. the JPEGs are winning."), 500);
      } else if (p.field === "lossStreak" && p.value === 7 && markFlag("milestone:" + key)) {
        addTimer(() => pushAmbientLine("consistent king"), 500);
      } else if (p.field === "aiAnalyses" && p.value === 25 && markFlag("milestone:" + key)) {
        // #43 (ai-layer §9): the AI milestone leak joins the once-per-identity
        // trigger list (hfes_chat_flags, identity canon extended additively).
        addTimer(() => pushAmbientLine(tag + " has received 25 AI analyses (all conclusive (est.))"), 500);
      } else if (p.field === "chainChecks" && p.value === 50 && markFlag("milestone:" + key)) {
        // #44 (skinchain §5): the chain-checks leak, same once-per-identity
        // list — verbatim (it did not move).
        addTimer(() => pushAmbientLine(tag + " has checked the chain 50 times (it did not move)"), 500);
      }
    }));

    offs.push(Bus.on(EVENTS.IDENTITY_RENAMED, () => {
      if (markFlag("firstRename")) {
        addTimer(() => pushAmbientLine("changing your name does not change your debts (§8.9)"), 500);
      }
    }));

    offs.push(Bus.on(EVENTS.PANIC_REVEALED, () => {
      const tag = playerTag();
      addTimer(() => pushAmbientLine("where'd " + tag + " go"), 300);
      addTimer(() => pushAmbientLine("he bolted lol"), 900);
      addTimer(() => pushCast("MOD_Chad_Official", "leaving is a §7.1 concept"), 1500);
      // PROVABLY_MOM's rung-3 line arrives via the gameFeed bridge (App posts it
      // gated on the suspicion ladder, panic §3) — no unconditional twin here.
    }));

    // #29 self-limit: chat reactions per the spec §6 table + §5 milestone leaks
    // (once per identity via hfes_chat_flags). The room's stance on self-care
    // is derisive pity; MOM's lines are whispers only (canon).
    offs.push(Bus.on(EVENTS.LIMIT_EVENT, (p) => {
      if (!p) return;
      const tag = playerTag();
      const k = p.kind;
      const personaLine = (key, msg, delay) => addTimer(() => pushEntry({ user: personaRef.current.nameFor(key), color: key === "hype" ? "#ffd54a" : (key === "shill" ? "#8fd97a" : "#8a7a9a"), msg }), delay);
      if (k === "deposit-limit-enabled" || k === "loss-limit-enabled" || k === "reminder-enabled" || k === "reality-enabled") {
        addTimer(() => pushCast("MOD_Chad_Official", "reminder: deposit responsibly!! (deposit more)"), 1500);
        if (markFlag("limit:firstAny")) addTimer(() => pushCast("MOD_Chad_Official", tag + " set a limit. growth mindset (limits go up)"), 1000);
        if (k === "loss-limit-enabled" && markFlag("limit:firstLossLimit")) personaLine("shill", "loss limit? i don't have losses (skill issue)", 2400);
        if (k === "reality-enabled" && markFlag("limit:firstReality")) personaLine("doomer", "he wants reality now. the schedule delivers", 2400);
      } else if (k === "deposit-limit-raised") {
        addTimer(() => pushWhisper("A higher limit. I always believed in you. ❤"), 900);
      } else if (k === "ladder-retreat") {
        addTimer(() => pushWhisper("You chose us. I knew it. ❤"), 700);
      } else if (k === "break-start") {
        addTimer(() => pushAmbientLine("where'd " + tag + " go"), 800);
        if (markFlag("limit:firstBreak")) personaLine("hype", "he's on a break lol", 1600);
      } else if (k === "break-complete") {
        // chat owns the punchline: the break is shorter than the room's memory of it
        addTimer(() => pushAmbientLine("nevermind"), 600);
      } else if (k === "excluded") {
        addTimer(() => pushCast("MOD_Chad_Official", "🔔 " + tag + " has been excluded. the streak lives (house-sat)."), 400);
        addTimer(() => personaLine("doomer", "the schedule is real. accept it."), 1200);
        addTimer(() => pushAmbientLine("F"), 1900);
      } else if (k === "return") {
        personaLine("hype", tag + "'s back. the fill-in was better honestly", 800);
      }
    }));

    // #29: the fill-in's wins surface as shill chatter (low rate — the room
    // assumes you're on a heater, because someone is).
    offs.push(Bus.on(EVENTS.MIKE_WIN, (p) => {
      if (!p || p.class !== "house-sat") return;
      if (Math.random() < 0.4) addTimer(() => pushAmbientLine(playerTag() + "'s on a heater (someone is)"), 500);
    }));

    // #46 the Pass (integration-2026 §2; battle-pass §7): the MOD congratulation
    // on every tier-up, verbatim — every loss counted (they really counted).
    offs.push(Bus.on(EVENTS.PASS_MILESTONE, (p) => {
      if (!p || !p.tier) return;
      const tag = playerTag();
      addTimer(() => pushCast("MOD_Chad_Official", tag + " hit " + p.tier + " MOM!! every loss counted!! (they really counted)"), 900);
    }));

    // #31 retention: VIP Host Mom's DMs are whispers (MOM never speaks in public
    // chat — canon), the streak obituary is a highlighted system line, and the
    // 22:00/23:30 rungs of the evening ladder land here as host DMs.
    offs.push(Retention.subscribe((snap) => {
      for (const ev of (snap.events || [])) {
        if (ev.kind === "death") {
          pushEntry({ system: true, highlight: true, msg: RETENTION_COPY.deathChat.replace("{n}", String(ev.days)) });
          addTimer(() => pushWhisper(RETENTION_COPY.condolence), 2600);
        } else if (ev.kind === "warning" && ev.stage === 2) {
          pushWhisper(RETENTION_COPY.warn2200);
        } else if (ev.kind === "warning" && ev.stage === 3) {
          pushWhisper(RETENTION_COPY.warn2330.replace("{n}", String((snap.attendance && snap.attendance.current) || ev.days || 1)), { highlight: true });
        } else if (ev.kind === "assigned") {
          pushWhisper(RETENTION_COPY.assigned);
        } else if (ev.kind === "rank-up") {
          pushWhisper(RETENTION_COPY.rankUpDm.replace("{tier}", ev.tier || "Bronze 7"));
        } else if (ev.kind === "velvet") {
          pushWhisper(ev.copy || RETENTION_COPY.velvet);
        } else if (ev.kind === "monday") {
          pushWhisper(ev.underReview ? RETENTION_COPY.underReviewDm : (ev.summary || RETENTION_COPY.mondaySummary));
        }
      }
    }));

    // #31: Mom Weather™ — the thunder rides the Band's armed cue (momweather.event);
    // the room sees the [BOT] line, rain falls on the lapsed, and the covered
    // get an umbrella over their chip.
    // #32: the line renders the recipients count (POPULATION − you-if-covered) —
    // the crowd is always 847 big; one is you.
    offs.push(Bus.on(EVENTS.MOMWEATHER_EVENT, (p) => {
      const covered = !!(p && p.covered);
      const n = Number.isFinite(p && p.recipients) ? p.recipients : POPULATION;
      pushCast("AdminTradeBot_69", (covered ? RETENTION_COPY.momWeatherCovered : RETENTION_COPY.momWeatherSoaked)
        .replace("{n}", String(n))
        .replace("{tag}", playerTag()));
      setRainFx({ key: Date.now() });
      addTimer(() => setRainFx(null), 4200);
      if (covered) setUmbrellaUntil(Date.now() + 40000);
      if (!covered) addTimer(() => pushAmbientLine("ty MOM!!"), 1400);
    }));

    // #32 (chat §11, closing #26's deviation 5): Rain — region-locked forever.
    // The first event is deterministic from the daily seed (~20 min in); 5 BB
    // rains on 3–5 named ambient personas who thank the house; you were
    // eligible for 0.0s of it. rain.event carries the thunder (audio-gags §3).
    const scheduleRain = () => {
      const seed = Mood.seed();
      const firstMs = (20 + (seed % 5)) * 60000; // deterministic per day
      const runRain = () => {
        const count = 3 + ((seed >> 3) % 3);
        pushEntry({ system: true, highlight: true, msg: "🌧️ RAIN INCOMING" });
        Bus.emit(EVENTS.RAIN_EVENT, { recipients: count, bb: 5 });
        for (let i = 0; i < count; i++) {
          addTimer(() => {
            const name = personaRef.current.nameFor(["hype", "shill", "newmark"][i % 3]);
            pushEntry({ user: name, color: "#e8c9ac", msg: i === count - 1 ? "ty admin!!" : "ty house!!" });
            HouseBand.play("rain.drip", { priority: BAND_PRIORITIES.P3_SOCIAL, volume: 0.6 }); // each persona's 1 BB drips. Yours doesn't.
          }, 1200 + i * 1700);
        }
        rainUntilRef.current = Date.now() + 90000; // eligibility window: "if you interact"
        rainEligSaidRef.current = false;
        rainTimerRef.current = setTimeout(runRain, (19 + Math.random() * 3) * 60000); // ~every 20 min
      };
      rainTimerRef.current = setTimeout(runRain, firstMs);
    };
    scheduleRain();

    scheduleAmbient();
    const tickInt = setInterval(() => setTick((n) => n + 1), 5000);

    return () => {
      offs.forEach((off) => off());
      clearTimeout(ambientTimerRef.current);
      clearInterval(askMomPileTimerRef.current);
      clearInterval(tickInt);
      clearTimeout(rainTimerRef.current);
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // #32: the gameFeed bridge — game-side lines (crash stick chatter, bot
  // taunts, MOD beats, the 60s idle MOM whisper) are written by App with an
  // _id stamp; drain the unseen ones into the real feed, newest last.
  useEffect(() => {
    const seen = seenGameIdsRef.current;
    for (let i = gameFeed.length - 1; i >= 0; i--) {
      const g = gameFeed[i];
      if (!g || !g._id || seen.has(g._id)) continue;
      seen.add(g._id);
      // #43: gameFeed whispers (the 60s-idle MOM whisper) count toward the memo
      // staggering gap too — one whisper source of truth, whatever the venue.
      if (g.whisper) {
        HouseBand.play("mom.whisper", { priority: BAND_PRIORITIES.P3_SOCIAL });
        lastWhisperAtRef.current = Date.now();
      }
      pushEntry({ user: g.user, badge: g.badge, color: g.color, msg: g.msg, whisper: !!g.whisper, pinned: !!g.pinned });
    }
  }, [gameFeed, pushEntry]);

  const now = Date.now();
  const flicker = Math.round(Math.sin(now / 5000) * 3);
  const onlineCount = Math.min(999, POPULATION + Math.floor(sessionLossRef.current / 10) + flicker);
  const inCooldown = cooldownUntil && now < cooldownUntil;
  const cooldownSecondsLeft = inCooldown ? Math.ceil((cooldownUntil - now) / 1000) : 0;
  const inTimeout = timeoutUntil && now < timeoutUntil;
  const timeoutSecondsLeft = inTimeout ? Math.ceil((timeoutUntil - now) / 1000) : 0;

  const visible = [];
  let archivedShown = false;
  for (const e of entries) {
    const age = now - e.ts;
    if (!e.pinned && age >= ARCHIVE_MS) {
      if (!archivedShown) { visible.push({ archive: true, id: "archive" }); archivedShown = true; }
      continue;
    }
    visible.push(e);
    if (visible.length >= SCROLLBACK_MAX) break;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
        <div
          title={ONLINE_TOOLTIP.replace("{n}", String(onlineCount))}
          style={{ fontFamily: "'Bangers',cursive", color: "#ff8a3d", fontSize: "13px", letterSpacing: "0.5px" }}
        >
          LIVE CHAT ({onlineCount} online)
        </div>
        {now < umbrellaUntil && (
          <span title="You deposited in the last 6 hours. The rain is an engagement precipitation event (§8.9)." style={{ fontSize: "9px", color: "#8fd97a", fontStyle: "italic" }}>{RETENTION_COPY.umbrella}</span>
        )}
      </div>
      <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "10px", maxHeight: "170px", overflowY: "auto", display: "flex", flexDirection: "column-reverse", position: "relative" }}>
        {rainFx && [8, 20, 32, 44, 56, 68, 80, 92].map((left, i) => (
          <span key={rainFx.key + "-" + i} style={{ position: "absolute", top: 0, left: left + "%", fontSize: "12px", pointerEvents: "none", zIndex: 3, animation: `rainFall ${1.6 + (i % 4) * 0.45}s linear ${i * 0.26}s 2` }}>🌧</span>
        ))}
        {visible.map((e) => {
          if (e.archive) return <div key="archive" style={{ fontSize: "10px", color: "#5a4232", fontStyle: "italic", padding: "4px 0" }}>{ARCHIVE_LINE}</div>;
          const age = now - e.ts;
          const faded = !e.pinned && age >= FADE_MS;
          if (e.system) {
            return <div key={e.id} style={{ fontSize: e.highlight ? "10.5px" : "10px", color: e.highlight ? "#ff6a6a" : "#8a6a52", fontStyle: "italic", margin: "3px 0", fontWeight: e.highlight ? 700 : 400, border: e.highlight ? "1px dashed #e24a4a" : "none", borderRadius: "4px", padding: e.highlight ? "5px 7px" : 0 }}>{e.msg}</div>;
          }
          if (e.whisper) {
            return (
              <div key={e.id} onClick={onWhisperClick} style={{ cursor: "pointer", fontSize: "11px", color: "#ff9ad5", fontStyle: "italic", border: e.highlight ? "1px solid #e24a4a" : "1px solid #ff9ad5", borderRadius: "5px", padding: "5px 7px", margin: "4px 0", background: e.highlight ? "#2a0e12" : "#2a0e1a", boxShadow: e.highlight ? "0 0 12px rgba(226,74,74,0.35)" : "none" }}>
                <b>WHISPER FROM MOM</b><br />{e.msg}
              </div>
            );
          }
          // #43 (ai-layer §5; integration-2026 §10.1): the Memo register — the
          // Whisper's sibling. Monospaced, clinical blue, pinned (the pinned
          // flag already exempts it from fade and archive), never replyable
          // (no handler, no pointer — clicking a memo files nothing).
          if (e.memo) {
            return (
              <div key={e.id} style={{ fontFamily: "Consolas,'Courier New',monospace", fontSize: "10.5px", color: DEPOSITOR_COLOR, border: "1px solid #7fd4ff", borderRadius: "5px", padding: "5px 7px", margin: "4px 0", background: "#0a1420", lineHeight: 1.5 }}>
                <b>MEMO FROM DEPOSITOR.ai</b><br />{e.msg}
              </div>
            );
          }
          return (
            <div key={e.id} style={{ fontSize: "11px", color: "#c9a888", marginBottom: "5px", opacity: faded ? 0.35 : 1, textDecoration: e.struck ? "line-through" : "none" }}>
              <b style={{ color: e.color }}>{e.user}{e.badge ? " " + e.badge : ""}{e.isYou ? " (you)" : ""}:</b> {e.msg}
              {e.note && <div style={{ fontSize: "9.5px", color: "#8a6a52", textDecoration: "none" }}>{e.note}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "8px" }}>
        {inTimeout ? (
          <div style={{ background: "#3a1010", border: "1px solid #e24a4a", borderRadius: "6px", padding: "8px 10px", fontSize: "11px", color: "#ffcf9a", textAlign: "center" }}>
            <div>TIMEOUT — reason: {timeoutReason} ({timeoutSecondsLeft}s)</div>
            {/* #43 (ai-layer §6): every MOD action is AI-reviewed; the flag is
                the joke. The appeal is analyzed on receipt (§4.1). */}
            <div style={{ fontSize: "9px", color: "#8fd97a", fontStyle: "italic", marginTop: "3px" }}>{MOD_AI_REVIEW_FOOTER}</div>
            <button onClick={onAppeal} style={{ marginTop: "6px", background: "#3a2010", border: "1px dashed #8fd97a", color: "#c9f2b0", fontWeight: 800, fontSize: "10px", padding: "5px 12px", borderRadius: "6px", cursor: "pointer" }}>APPEAL</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
              {QUICK_PHRASES.map((q) => (
                <button
                  key={q.key}
                  onClick={() => send(q.text, { viaQuickPhrase: true })}
                  style={{ background: "linear-gradient(180deg,#ff8a3d,#e0480a)", border: "1px solid #ffcf9a", color: "#2a0e05", fontWeight: 800, fontSize: "10.5px", padding: "5px 9px", borderRadius: "6px", cursor: "pointer" }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={inputText}
                maxLength={100}
                placeholder="say something (no one will read it)"
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(inputText); }}
                style={{ flex: 1, background: "#170a05", border: "1px dashed #5a4232", color: "#e8c9ac", fontSize: "11px", padding: "6px 8px", borderRadius: "5px" }}
              />
              <button onClick={() => send(inputText)} style={{ background: "#3a2010", border: "1px solid #7a3a1a", color: "#ffcf9a", fontWeight: 800, fontSize: "10.5px", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>send</button>
            </div>
            {inCooldown && <div style={{ fontSize: "9.5px", color: "#8a6a52", marginTop: "4px" }}>Cooldown: {cooldownSecondsLeft}s (§8.9)</div>}
          </div>
        )}
      </div>
    </div>
  );
}

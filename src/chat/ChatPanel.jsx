import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mood } from "../spine/mood.js";
import { Bus, EVENTS, Regime } from "../spine/bus.js";
import { Identity, RESERVED_CAST, YOU_COLOR } from "../spine/identity.js";
import { POPULATION } from "../spine/constants.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import { Retention, COPY as RETENTION_COPY } from "../retention/state.js";
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
  RAIN_INELIGIBLE_LINE, RAIN_KEYWORD_LINE, ONLINE_TOOLTIP,
} from "./constants.js";
import {
  loadFlags, markFlag, hasFlag, loadCooldownLevel, bumpCooldownLevel, cooldownSecondsForLevel,
  loadGratuityCount, bumpGratuityCount,
} from "./state.js";

const CAST = Object.fromEntries(RESERVED_CAST.map((c) => [c.name, c]));
const WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win"]);

function playerTag() { return Identity.playerTag() || "you"; }

export default function ChatPanel({ panicActive = false, hooks = {} }) {
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
    return pushEntry({ user: "MOM", badge: "[VIP HOST]", color: "#ff9ad5", msg: text, whisper: true, pinned: true, ...extra });
  }, [pushEntry]);

  const pushAmbientLine = useCallback((text, archetypeOverride) => {
    const archetype = archetypeOverride || pickArchetype();
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
    const archetype = pickArchetype();
    if (archetype.isWhale) {
      const line = WHALE_LINES[Math.floor(Math.random() * WHALE_LINES.length)];
      pushEntry({ user: WHALE_NAME, color: "#e8c9ac", msg: line });
      return;
    }
    const line = pickLine(archetype);
    if (line) pushAmbientLine(line, archetype);
  }, [pushAmbientLine, pushEntry]);

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

  const triggerQuietWindow = useCallback(() => {
    const dur = QUIET_WINDOW_MIN_MS + Math.random() * (QUIET_WINDOW_MAX_MS - QUIET_WINDOW_MIN_MS);
    quietUntilRef.current = Date.now() + dur;
    addTimer(() => {
      const line = QUIET_WINDOW_LINES[Math.floor(Math.random() * QUIET_WINDOW_LINES.length)];
      pushAmbientLine(line);
    }, dur + 200);
  }, [addTimer, pushAmbientLine]);

  const triggerWinSequence = useCallback(() => {
    // §10: the room lets a fake win breathe for ~3s, then MOD strikes it through.
    WIN_BREATHE_LINES.forEach((line, i) => addTimer(() => pushAmbientLine(line), 400 + i * 500));
    addTimer(() => pushCast("MOD_Chad_Official", WIN_DELETE_LINE), 3000);
    addTimer(() => triggerQuietWindow(), 3200);
  }, [addTimer, pushAmbientLine, pushCast, triggerQuietWindow]);

  const triggerTimeout = useCallback((reasonKey) => {
    if (timeoutUntil && Date.now() < timeoutUntil) return;
    setTimeoutUntil(Date.now() + TIMEOUT_DURATION_MS);
    setTimeoutReason(TIMEOUT_REASONS[reasonKey] || reasonKey);
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
      if (n === 1) addTimer(() => pushCast("MOD_Chad_Official", MINOR_ESCALATION[0]), 1200);
      else if (n === 2) addTimer(() => pushCast("MOD_Chad_Official", MINOR_ESCALATION[1]), 1200);
      else addTimer(() => triggerTimeout("minor"), 1200);
      return true;
    }
    if (/momcode/i.test(t)) {
      addTimer(() => pushCast("MOD_Chad_Official", "impersonating the owner is a Tier 1 vibe violation (he loves it though)"), 1400);
      return true;
    }
    if (/rain/.test(t)) {
      addTimer(() => pushCast("AdminTradeBot_69", RAIN_KEYWORD_LINE), 1300);
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
    }));

    offs.push(Bus.on(EVENTS.ASKMOM_ABANDONED, () => {
      clearInterval(askMomPileTimerRef.current);
      addTimer(() => pushWhisper(MOM_WHISPER_DECK.abandoned), 400);
      addTimer(() => pushAmbientLine("she said no???"), 900);
      addTimer(() => pushCast("MOD_Chad_Official", "the responsible thing to do would've been yes."), 1500);
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
      addTimer(() => pushEntry({ user: "PROVABLY_MOM", color: "#e8c9ac", msg: "I can see the homework from here. Deposit responsibly." }), 2100);
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
    offs.push(Bus.on(EVENTS.MOMWEATHER_EVENT, (p) => {
      const covered = !!(p && p.covered);
      pushCast("AdminTradeBot_69", (covered ? RETENTION_COPY.momWeatherCovered : RETENTION_COPY.momWeatherSoaked).replace("{tag}", playerTag()));
      setRainFx({ key: Date.now() });
      addTimer(() => setRainFx(null), 4200);
      if (covered) setUmbrellaUntil(Date.now() + 40000);
      if (!covered) addTimer(() => pushAmbientLine("ty MOM!!"), 1400);
    }));

    scheduleAmbient();
    const tickInt = setInterval(() => setTick((n) => n + 1), 5000);

    return () => {
      offs.forEach((off) => off());
      clearTimeout(ambientTimerRef.current);
      clearInterval(askMomPileTimerRef.current);
      clearInterval(tickInt);
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            TIMEOUT — reason: {timeoutReason} ({timeoutSecondsLeft}s)
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

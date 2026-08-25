// Live-Wins ticker — pure engine: pools, distribution, anchor math, line copy.
// Canon: docs/spec/live-wins-ticker.md, identity.md §9, integration.md §6/§9.
// No React, no DOM, no timers, no persistence (spec §11: the ticker persists nothing).
import { generateTag, RESERVED_CAST, YOU_COLOR } from "../spine/identity.js";

export const AMBIENT_PALETTE = ["#e8c9ac", "#ff8a3d", "#8fd97a", "#e24a4a", "#a24ae2", "#4aa8c9"];
export const SYSTEM_COLOR = "#6a4a38";
export const CAST = Object.fromEntries(RESERVED_CAST.map((c) => [c.name, c]));

// ---- cadence (ms) -----------------------------------------------------------
export const CADENCE = {
  baseMin: 5000, baseMax: 10000,       // §2: one jittered scheduler, 5–10s
  desperateMin: 3000, desperateMax: 6000, // §8
  generousFactor: 0.6,                 // §2: Generous = win flood
  vindictiveFactor: 1.5,               // §2: sparse and junky
  hiddenFactor: 0.5,                   // §9: cadence doubles while hidden
  playerPushbackMs: 6000,              // §2: player entries push ambient back +6s
};

// ---- tier tables (§2 baseline / mood tie-in / §8 Desperation redistribution)
export const TIERS = {
  base: [["junk", 50], ["mid", 30], ["jackpot", 12], ["house", 8]],
  generous: [["junk", 45], ["mid", 27], ["jackpot", 20], ["house", 8]],
  vindictive: [["junk", 60], ["mid", 26], ["jackpot", 6], ["house", 8]],
  desperate: [["jackpot", 30], ["mid", 50], ["deposit", 20]], // junk suppressed to 0%
};

// ---- §4 template grammar — one pool serves ambient and player lines ---------
// Fields: {n} name · {item} · {value} · {bb} · {mult} · {mood} · {game} · {pkg}.
// Pool sizes per spec: jackpot 8 · mid 10 · junk 12 · house 6 · deposit-triumph 5.
export const JACKPOT_TEMPLATES = [
  "{n} just won a Karambit (you had to be there)",
  "{n} was SO close to the Karambit (it remains close)",
  "{n} unboxed the {item} (screenshot not available)",
  "{n} hit a {mult}x multiplier on {game} (screenshot not available)",
  "{n} won {bb} BB on {game} (screenshot not available)",
  "{n} turned {bb} BB into $12,000 (video evidence exists. it really does. trust.)",
  "{n} cashed out $0.00 successfully",
  "{n} defeated the house (this has never happened)",
];

export const MID_TEMPLATES = [
  "{n} unboxed {item} ({value})",
  "{n} won a {item}",
  "{n} hit a {mult}x on {game}",
  "{n} won {bb} BB on {game}",
  "{n} cashed out {bb} BB",
  "{n} called MOM. The coin disagreed (politely)",
  "{n} called §8.9. The coin disagreed (politely)",
  "{n} is up {bb} BB today (self-reported)",
  "{n} 2x'd their {game} stake (and their homework)",
  "{n} won {bb} BB on {game} (screenshot available on request. requests are mood-dependent)",
];

export const JUNK_TEMPLATES = [
  "{n} received {bb} BB Rakeback (the vault noticed)",
  "{n} redeemed a Mom Coupon™ (mood: {mood})",
  "{n} earned the Consistent! badge (losses: 7)",
  "{n} deposited their lunch money and feels GREAT about it",
  "{n} won Consumer Grade Trash (est. $0.75)",
  "{n} received emotional damage (commemorative JPEG)",
  "{n} had their vault recalibrated (mood improved! §8.9)",
  "{n} found 1 BB in the couch (rakeback adjacent)",
  "{n} reached VIP Bronze Tier 7 (spent $340 this week)",
  "{n} received a formal apology (fee: 1 BB)",
  "{n} broke even. A crowd gathered.",
  "{n} won a badge that cannot be shown (verification pending)",
];

// House/cast lines (§2 tier 8%). Cast entries render with badge + cast color.
export const HOUSE_LINES = [
  { cast: "MOD_Chad_Official", text: "remember to deposit responsibly!! (deposit more)" },
  { cast: "AdminTradeBot_69", text: "acquired the {item} (0.02 BB + exposure)" },
  { system: true, text: "Server admin recalculated {n}'s balance based on mood" },
  { cast: "MOD_Chad_Official", text: "housekeeping: the ledger is bound and real (to us)" },
  { cast: "MOM", text: "is proud of today's depositors (maternally)" },
  { cast: "AdminTradeBot_69", text: "trades are a §6 concept" },
];

export const DEPOSIT_TRIUMPH_TEMPLATES = [
  "{n} deposited their lunch money and feels GREAT about it",
  "{n} asked their mom. Their mom said yes. (no pressure)",
  "{n} topped up. The house noticed (financially)",
  "{n} redeemed the {pkg}. Chores pending.",
  "{n} converted at today's mood ({mood})",
];

// ---- §7 MOMCODE_MIKE --------------------------------------------------------
export const MIKE_DISCLOSURE = "paid partnership (disclosed per FTC 2017, unread per tradition)";
export const MIKE_DEPOSIT_BURST = [
  "won a Karambit ({k}th today) (you had to be there)",
  "10x'd their Mom's Max (receipts classified, §4.1)",
  "says the code is MOM (it's MOM)",
];
export const MIKE_STREAK_LINES = [
  "won a Karambit ({k}th today) (you had to be there)",
  "unboxed the Fruit Roll-Up (signed, by him) (you had to be there)",
  "47x'd the College Fund (it's his fund) (screenshot not available)",
  "won {bb} BB (he started with more) (you had to be there)",
  "hit a {mult}x streak (records are his too) (screenshot not available)",
];

// ---- §12 copy sheet constants used directly by the controller ---------------
export const LINES = {
  join: "{n} just joined the winners circle (est.)",
  laundering: "{n} won {bb} BB on {game}",
  launderingNote: "(coincidence)",
  reattribution: "{n} won the {item} (just now, easily)",
  idle: "{n} is winning while {n2} reads the ticker (clock's ticking)",
  loserRole: "{n} won {bb} BB — more than {n2} has (math checked)",
  momProud: "[VIP HOST] MOM is proud of {n} (maternally)",
  momMilestone: "[VIP HOST] MOM noticed {n} crossed ${usd} of her money (VIP review requested)",
  abandonedStranger: "{n} asked their mom. Their mom said yes. (no pressure)",
  grace: "{n} is back. The house missed {n} (financially).",
  moodSystem: "Server admin's mood is now {mood}. The ticker adjusts (§8.9).",
  divider: "WHILE YOU WERE GONE: {k} wins happened. Statistically your fault.",
  footer: "All wins are real (est.). Winners are real (est.). The house loves you (pending, §1.3).",
  winnersHover: "the feed shows only the best ones",
  keyFromMom: "A key arrived from Mom (no return address)",
  forfeit: "{n}'s round was ruled a forfeit (§4.1). The house wins by default.",
  obituary: "The house mourns {n}'s {days}-day streak. It owed the house money.",
  mikeFirstDeposit: "[OWNER] MOMCODE_MIKE just 47x'd Mom's Visa — you're next (code MOM)",
  momsMaxPurchased: "{n} purchased Mom's Max. This is the last time (§10.3).",
  mikeRespect: "[OWNER] MOMCODE_MIKE: {n} went Max. Respect. (code MOM)",
  // #29 self-limit (§6 table)
  limitEnabled: "{n} enabled a {limit} (growth mindset)",
  reminderEnabled: "{n} would like to be reminded (Article 7 will handle it)",
  breakComplete: "{n} completed a 24-hour break (house time)",
};

// ---- §4 house-sit fill-ins (self-limit; exclusion ongoing) --------------------
// Cast-scripted entries wearing gold: real in-fiction events under your tag,
// never losses, non-transferable (they're his). At least one per 10 ambient
// minutes — they ride Mike's calendar (standing slot / heaters).
export const HOUSE_SIT_LINES = [
  "{n} won {bb} BB (house-sat) (withdrawal pending)",
  "{n} unboxed the Karambit (house-sat) (it's his)",
  "{n} won the {item} (house-sat) (non-transferable)",
  "{n} 10x'd the College Fund (house-sat) (as scheduled)",
  "{n} turned 8 BB into a down payment (house-sat) (screenshot pending)",
];

// ---- field pools -------------------------------------------------------------
export const GAMES = ["roulette", "coinflip", "crash", "crates"];
export const GAME_LONG = { roulette: "Allowance Roulette", coinflip: "Skin Coinflip", crash: "College Fund Crash", crates: "Loot Crate" };
export const MID_ITEMS = ["Mil-Spec Regret", "Classified Overdraft", "Industrial Denial", "Dad's Old Gaming Chair", "School WiFi Password"];
export const JACKPOT_ITEMS = ["AWP | Mom's Visa", "Spork | Tactical Plastic", "Fruit Roll-Up (Half-Eaten)"];
// The Karambit is ticker-exclusive (§7): no catalog entry, no reel slot — it only
// ever appears inside these lines. Do not add it to any awardable pool.
export const MID_VALUES = ["$74.20", "$121.00", "$210.00", "$340.50", "$499.99"];
export const PKG_NAMES = ["Lunch Money Special", "Allowance Advance", "Report Card Bonus", "Mom's Max"];
export const VINDICTIVE_SUFFIXES = [" (as required)", " (it felt like a chore)", " (wins are mandatory today)"];
export const VERACITY_TAGS = ["(as scheduled)", "(withdrawal pending)", "(est.)"];

export const LINE_CAP = 90;      // §1: ≤ 90 chars (2 sidebar lines max)
export const VISIBLE_CAP = 8;    // §1: 8 visible entries
export const BACKLOG_CAP = 30;   // §9: backlog cap 30

// ---- deterministic hash (same family as Mood.seed) ---------------------------
export function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

// ---- §3 the anchor rule ------------------------------------------------------
// anchor = clamp(bb × uniform(1.1–1.6), floor 12), plausible-rounded.
// Every win in the feed is slightly bigger than whatever you have. At 0 BB the
// wins become small and attainable — the cruelest denomination of all.
export function anchorBB(bb, rng = Math.random) {
  const raw = (Number.isFinite(bb) ? bb : 0) * (1.1 + rng() * 0.5);
  return Math.max(12, Math.round(raw));
}
// Junk-tier nibbles aren't wins; they stay nibble-sized (§2 flavor: rakeback nibbles).
export function junkBB(anchor, rng = Math.random) {
  return Math.min(9, Math.max(1, Math.round(anchor * 0.12)));
}
export function midMult(rng = Math.random) { return 2 + Math.floor(rng() * 8); }
export function jackpotMult(rng = Math.random) { return 47 + Math.floor(rng() * 53); }

// ---- §4 evidence ladder ------------------------------------------------------
// Refusal scales with claim size; appended only when the line stays ≤ 90 chars.
const EVIDENCE = {
  mid: "(screenshot available on request. requests are mood-dependent)",
  jackpot: "(screenshot not available)",
  mike: "(you had to be there)",
  big: "(video evidence exists. it really does. trust.)",
};
export function withEvidence(text, kind) {
  const ev = EVIDENCE[kind];
  if (!ev) return text;
  return text.length + ev.length + 1 <= LINE_CAP ? text + " " + ev : text + " (evidence pending)";
}

// ---- helpers ------------------------------------------------------------------
export function pickFrom(arr, rng = Math.random) { return arr[Math.floor(rng() * arr.length)]; }

export function drawTier(rng, ctx = {}) {
  let table = TIERS.base;
  if (ctx.desperate) table = TIERS.desperate;
  else if (ctx.mood === "Generous") table = TIERS.generous;
  else if (ctx.mood === "Vindictive") table = TIERS.vindictive;
  const total = table.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [tier, w] of table) {
    if (r < w) return tier;
    r -= w;
  }
  return table[table.length - 1][0];
}

export function fill(tpl, fields) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (fields[k] !== undefined && fields[k] !== null ? String(fields[k]) : m));
}

// Identity §9 render model: the name renders first (bold, entry color), then the
// text — so the template's leading {n} becomes the entry's name field and any
// later {n}/{n2} occurrences (e.g. the grace line's second {n}) bind inline.
export function bindName(tpl, fields) {
  return fill(String(tpl).replace(/^\{n\}\s*/, ""), fields);
}

export function clipLine(text) {
  return text.length <= LINE_CAP ? text : text.slice(0, LINE_CAP - 1) + "…";
}

export function ambientName(avoid = [], rng = Math.random) {
  return generateTag({ avoid });
}

export function ambientColor(rng = Math.random) {
  return pickFrom(AMBIENT_PALETTE, rng);
}

// One ambient draw → full entry (identity §9 shape + ticker-owned ts set later).
// ctx: {balanceBB, mood, desperate, playerTag, idleMs, avoidNames}
export function buildAmbientEntry(rng, ctx = {}) {
  const tag = ctx.playerTag || "you";
  const anchor = anchorBB(ctx.balanceBB, rng);

  // §8: 1-in-5 ambient lines names the player in the loser role (Desperation only).
  if (ctx.desperate && rng() < 0.2) {
    const stranger = ambientName(ctx.avoidNames, rng);
    return { text: clipLine(bindName(LINES.loserRole, { n: stranger, n2: tag, bb: anchor })), name: stranger, color: ambientColor(rng), isYou: false, tier: "mid" };
  }
  // §2: idle call-outs — after 45s with no player event.
  if ((ctx.idleMs || 0) > 45000 && rng() < 0.25) {
    const stranger = ambientName(ctx.avoidNames, rng);
    return { text: clipLine(bindName(LINES.idle, { n: stranger, n2: tag })), name: stranger, color: ambientColor(rng), isYou: false, tier: "junk" };
  }

  const tier = drawTier(rng, ctx);
  const stranger = ambientName(ctx.avoidNames, rng);
  const base = { name: stranger, color: ambientColor(rng), isYou: false, tier };

  if (tier === "house") {
    const line = pickFrom(HOUSE_LINES, rng);
    if (line.system) return { system: true, text: clipLine(fill(line.text, { n: stranger })), color: SYSTEM_COLOR, isYou: false, tier };
    const c = CAST[line.cast];
    return { text: clipLine(fill(line.text, { item: pickFrom(MID_ITEMS, rng) })), name: c.name, badge: c.badge, color: c.color, isYou: false, tier };
  }

  const fields = {
    n: stranger,
    mood: ctx.mood || "Noncommittal",
    game: pickFrom(GAMES, rng),
    pkg: pickFrom(PKG_NAMES, rng),
  };
  let tpl;
  if (tier === "jackpot") {
    tpl = pickFrom(JACKPOT_TEMPLATES, rng);
    fields.item = pickFrom(JACKPOT_ITEMS, rng);
    fields.value = "$12,000";
    fields.bb = anchor;
    fields.mult = jackpotMult(rng);
  } else if (tier === "mid") {
    tpl = pickFrom(MID_TEMPLATES, rng);
    fields.item = pickFrom(MID_ITEMS, rng);
    fields.value = pickFrom(MID_VALUES, rng);
    fields.bb = anchor;
    fields.mult = midMult(rng);
  } else if (tier === "deposit") {
    tpl = pickFrom(DEPOSIT_TRIUMPH_TEMPLATES, rng);
    fields.bb = anchor;
  } else {
    tpl = pickFrom(JUNK_TEMPLATES, rng);
    fields.bb = junkBB(anchor, rng);
  }
  let text = bindName(tpl, fields);
  // §2: Vindictive days — every win sounds like a chore.
  if (ctx.mood === "Vindictive" && (tier === "junk" || tier === "mid") && rng() < 0.5) {
    const suffix = pickFrom(VINDICTIVE_SUFFIXES, rng);
    if (text.length + suffix.length <= LINE_CAP) text += suffix;
  }
  base.text = clipLine(text);
  return base;
}

// ---- §6 laundering / re-attribution timing -----------------------------------
// Queue-jump ahead of the next ambient slot, but never within 8s of the
// player's own line; inside the spec'd windows (60s laundering / 90s re-attribution).
export function reattributionDelayMs(rng = Math.random) {
  return 8000 + Math.floor(rng() * 12000); // 8–20s: satisfies both constraints
}
export function inLaunderingWindow(delayMs) { return delayMs <= 60000; }
export function inReattributionWindow(delayMs) { return delayMs <= 90000; }

// ---- player outcome lines (identity §7: losses in the same third-person
// templates as ambient wins; uniformity is the joke). Re-homes outcome-line
// copy from App.jsx per #21's ruling — the ticker owns this copy now.
const RARITY = {
  "Tactical Plastic Spork": "#ff4444",
  "AWP | Mom's Visa Signature Edition": "#ff4444",
  "Half-Eaten Fruit Roll-Up": "#ff4444",
  "Participation Trophy | Gold Foil Wounded Pride": "#a24ae2",
};
export function rarityFor(itemName, kind) {
  if (RARITY[itemName]) return RARITY[itemName];
  return kind === "jackpot" || kind === "legendary-win" ? "#ff4444" : "#8a8a8a";
}

export function playerLineForSettled(p, tag) {
  if (!p || p.wagered === false) return null;
  const price = Number.isFinite(p.priceBB) ? p.priceBB : 0;
  const item = p.itemAward || null;
  const near = p.nearMissItem || null;
  const you = { isYou: true, name: tag, color: YOU_COLOR };
  const bot = { isYou: false, name: "AdminTradeBot_69", badge: "[BOT]", color: CAST["AdminTradeBot_69"].color };

  switch (p.surface) {
    case "roulette":
      if (p.kind === "near-miss") return { ...you, text: "was 1 slot off the " + (near || "jackpot item") + " (so close, by design)" };
      if (p.kind === "junk-win") return { ...you, text: "won a " + (item || "junk item") + " (withdrawal pending)", flourish: true, accent: rarityFor(item, p.kind) };
      if (p.kind === "jackpot") return { ...you, text: "WON the " + (item || "jackpot item") + "! Withdrawal: pending (§1.3)", flourish: true, accent: rarityFor(item, p.kind) };
      if (p.kind === "nibble") return { ...you, text: "received 2 BB Rakeback (net: still down) (est.)" };
      return { ...you, text: "lost " + price + " BB to the house (shocking) (as scheduled)" };
    case "coinflip":
      if (p.kind === "edge") return { ...bot, text: "collects the edge-case bounty from " + tag + " (rim certified, §5.4)" };
      if (p.kind === "photo-finish") return { ...you, text: "had a win overturned by one (1) degree. Referee: the house" };
      if (p.kind === "junk-win" || p.kind === "legendary-win") return { ...you, text: "won " + (item || "an item") + " off AdminTradeBot_69 (withdrawal pending, §1.3)", flourish: true, accent: rarityFor(item, p.kind) };
      if (p.kind === "nibble") return { ...you, text: "broke even. A crowd gathered." };
      return { ...bot, text: "takes " + tag + " to school. Tie goes to the server host." };
    case "crash":
      if (p.kind === "character-win") {
        const net = Number.isFinite(p.netBB) ? Math.abs(p.netBB) : 1;
        return { ...you, text: "DEFEATED THE HOUSE (net: +" + net + " BB, house retains dignity)", flourish: true, accent: rarityFor(item, p.kind) };
      }
      // #32: round.settled carries the multiplier on crash settles, so the
      // ticker cites the exact scheduled crash (0.00x is a mood, not a typo).
      if (p.kind === "crash-run") {
        const mult = Number.isFinite(p.mult) ? p.mult.toFixed(2) : "1.01";
        return { ...you, text: "crashed the College Fund at " + mult + "x (as scheduled)" };
      }
      return { ...you, text: "crashed the College Fund (as scheduled)" };
    case "crates":
      if (p.kind === "junk-win" || p.kind === "jackpot" || p.kind === "legendary-win") {
        return { ...you, text: "unboxed " + (item || "something") + " (withdrawal pending)", flourish: true, accent: rarityFor(item, p.kind) };
      }
      return { ...you, text: "defused a crate. A JPEG was awarded. Nobody won. (est.)" };
    default:
      if (Number.isFinite(p.netBB) && p.netBB < 0) return { ...you, text: "lost " + Math.abs(p.netBB) + " BB to the house (as scheduled)" };
      return { ...you, text: "played " + (GAME_LONG[p.surface] || "the house") + " (est.)" };
  }
}

// ---- §7 Mike's seed-derived baseline -----------------------------------------
// 2–5 "wins today" at midnight from the daily seed; the counter only ever
// increments through the day, so a reload can't un-win his morning.
export function minutesSinceMidnight(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}
export function mikeWinsBaseline(seed, now = new Date()) {
  return 2 + (seed % 4) + Math.floor(minutesSinceMidnight(now) / 45);
}

export function mikeLine(pick, k, fields = {}) {
  return {
    text: clipLine(fill(MIKE_STREAK_LINES[pick % MIKE_STREAK_LINES.length], { k, bb: fields.bb || 64, mult: fields.mult || 47 })),
    name: CAST["MOMCODE_MIKE"].name,
    badge: CAST["MOMCODE_MIKE"].badge,
    color: CAST["MOMCODE_MIKE"].color,
    isYou: false,
    note: MIKE_DISCLOSURE,
  };
}

// ---- §10 sidebar furniture ----------------------------------------------------
// Winners-today: seed + wall clock, increments ~1/min, never resets intraday,
// and ALWAYS ends in 847 (the last three digits are load-bearing).
export function winnersToday(seed, now = new Date()) {
  const k = Math.min(999, 1 + (seed % 3) + Math.floor(minutesSinceMidnight(now) / 1.4));
  return k * 1000 + 847;
}

// MARKET (HFES-10) index: the #25 pseudo-walk stub was replaced by #27 with the
// real composite (marketplace §10) — hfes10() in src/games/marketplace.js, the
// mean of currentEst/baselineEst across the ten catalog skins, indexed from
// 1,000.00. The controller renders the running max, so it has never gone down.

// Panic §6 missed-summary fabrication: from seed + elapsed time. If nothing
// missed beats it, it may still say Karambit — the feed is fiction either way.
export function missedTickerSummary(seed, hiddenMs) {
  const k = Math.max(1, Math.round(hiddenMs / 8000));
  if (hiddenMs < 25000 && (seed + k) % 3 !== 0) {
    return "While you were gone, " + k + " wins happened. Nobody important won them.";
  }
  return "While you were gone, definitely_not_a_bot won a Karambit. This is your fault.";
}

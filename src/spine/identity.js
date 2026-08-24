import { Mood } from "./mood.js";
import { Bus, EVENTS } from "./bus.js";

const IDENTITY_KEY = "hfes_identity";
const STATS_KEY = "hfes_stats";
const CHAR_CAP = 16;

export const YOU_COLOR = "#ffd54a";
export const CUSTOM_NAME_PRICE_OC = 250;

export const RESERVED_CAST = [
  { name: "MOMCODE_MIKE", badge: "[OWNER]", color: "#ff8a3d" },
  { name: "MOD_Chad_Official", badge: "[MOD]", color: "#8fd97a" },
  { name: "AdminTradeBot_69", badge: "[BOT]", color: "#e24a4a" },
  { name: "MOM", badge: "[VIP HOST]", color: "#ff9ad5" },
];

const POOL_A = ["QuickScope", "NoScope", "Yeet", "Sweat", "Clutch", "Lag", "Tilt", "Snipe", "Grind", "Mash", "Flick"];
const POOL_B = ["LunchMoney", "Allowance", "PiggyBank", "NoodleArm", "JuiceBox", "Retainer", "Homework", "Chores", "Visa", "Basement", "Grandma", "LemonadeStand", "PaperRoute", "BabysittingCash", "Lunchbox", "WiFi"];
const POOL_C = ["Investor", "DayTrader", "Launderer", "Economist", "Analyst", "Speculator", "Enjoyer", "Connoisseur", "Consultant"];
const POOL_D = ["Timmy", "Kevin", "Bryce", "Kyle", "Skylar", "Brayden", "Tucker", "Nyla", "Deegan"];
const POOL_E = ["Trust", "Promise", "Legit", "Honest", "Swearsies", "FrFr"];
const POOL_F = ["Laundry", "Heist", "Arbitrage", "Enjoyer", "Gala", "Seminar", "Recovery"];
const POOL_N = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 88, 69, 420, 1337, 3000];
const POOL_NOTA = ["Wallet", "Bot", "Casino", "Scam", "Adult", "Launderer", "Withdrawal", "Minor", "Website"];
const POOL_KIDNOUN = ["Boy", "Kid", "Dude", "Man", "Gamer", "Lord"];
const SNAKE_NAMES = ["definitely_not_a_bot", "surely_legit_88", "mom_approved_trust_me", "not_gambling_promise", "definitely_18_fr", "totally_real_trader", "homework_done_420", "vibes_legal_only"];

const RESERVED_NAMES = new Set(RESERVED_CAST.map((c) => c.name));

const LEET_MAP = { o: "0", i: "1", e: "3", a: "4", s: "5" };
const LEET_CHANCE = { Vindictive: 1 / 3, Petty: 0.25, Noncommittal: 1 / 6, "Benevolent-ish": 1 / 12, Generous: 0 };

const WIN_KINDS = new Set(["junk-win", "jackpot", "legendary-win", "character-win"]);
const MILESTONES = {
  bbLost: [50, 100, 250],
  usdBorrowed: [25, 50, 100],
  cratesOpened: [10, 50],
  withdrawalsPending: [1],
  lossStreak: [3, 5, 7],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
function cap16(s) { return s.slice(0, CHAR_CAP); }

function buildTemplate() {
  const roll = Math.random() * 100;
  if (roll < 25) {
    let inner = pick(POOL_A) + pick(POOL_B);
    if (3 + inner.length + 3 > CHAR_CAP) inner = inner.slice(0, CHAR_CAP - 6);
    return "xX_" + inner + "_Xx";
  }
  if (roll < 45) {
    const b = lowerFirst(pick(POOL_B));
    const c = pick(POOL_C);
    let tag = b + c + String(pick(POOL_N));
    if (tag.length > CHAR_CAP) tag = b + c;
    return cap16(tag);
  }
  if (roll < 60) return cap16(pick(POOL_D) + "_" + pick(POOL_C));
  if (roll < 75) {
    const base = pick(POOL_B) + pick(POOL_F);
    const withNum = base + String(pick(POOL_N));
    return cap16(withNum.length <= CHAR_CAP ? withNum : base);
  }
  if (roll < 85) return cap16("NotA" + pick(POOL_NOTA) + "_" + pick(POOL_E));
  if (roll < 95) {
    const base = pick(POOL_A) + pick(POOL_KIDNOUN);
    const withYear = base + "_" + String(2007 + Math.floor(Math.random() * 7));
    return cap16(withYear.length <= CHAR_CAP ? withYear : base);
  }
  return cap16(pick(SNAKE_NAMES));
}

export function generateTag(opts = {}) {
  const avoid = new Set([...RESERVED_NAMES, ...(Array.isArray(opts.avoid) ? opts.avoid : [])]);
  for (let attempt = 0; attempt < 8; attempt++) {
    const tag = buildTemplate();
    if (!avoid.has(tag)) return tag;
  }
  return cap16(buildTemplate().slice(0, CHAR_CAP - 3)) + "_22";
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

export function complianceFilter(input) {
  const raw = String(input ?? "").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9_]{3,16}$/.test(raw)) {
    return { ok: false, error: "Names are 3–16 characters (A–Z a–z 0–9 _). Spaces are stripped by the house." };
  }
  const word = Mood.word();
  const chance = LEET_CHANCE[word] ?? 1 / 6;
  const rng = mulberry32(hashString(Mood.seed() + "#" + raw));
  let out = "";
  let substitutions = 0;
  let hasDigit = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") { hasDigit = true; out += ch; continue; }
    const sub = LEET_MAP[ch];
    if (sub && rng() < chance) { out += sub; substitutions += 1; hasDigit = true; }
    else out += ch;
  }
  if (substitutions === 0 && !hasDigit) out = out.slice(0, CHAR_CAP - 1) + String(Math.floor(rng() * 10));
  if (/MOD|ADMIN|MOM/i.test(out)) out = (out + "_Official").slice(0, CHAR_CAP);
  return { ok: true, name: cap16(out), moodWord: word, substitutions };
}

function blankIdentity() {
  return { tag: null, custom: null, rerollCount: 0, nextRerollFeeBB: 0, assignedAt: null };
}
function sanitizeIdentity(v) {
  const base = blankIdentity();
  if (!v || typeof v !== "object") return base;
  const str = (x) => (typeof x === "string" && /^[A-Za-z0-9_]{1,16}$/.test(x) ? x : null);
  base.tag = str(v.tag);
  base.custom = str(v.custom);
  base.rerollCount = typeof v.rerollCount === "number" && Number.isFinite(v.rerollCount) && v.rerollCount > 0 ? Math.floor(v.rerollCount) : 0;
  base.nextRerollFeeBB = typeof v.nextRerollFeeBB === "number" && Number.isFinite(v.nextRerollFeeBB) && v.nextRerollFeeBB > 0 ? v.nextRerollFeeBB : 0;
  base.assignedAt = typeof v.assignedAt === "string" ? v.assignedAt : null;
  return base;
}
function blankStats() {
  return { bbLost: 0, usdBorrowed: 0, cratesOpened: 0, withdrawalsPending: 0, worstLossBB: 0, lossStreak: 0, firstSeen: null, lastSeen: null };
}
function sanitizeStats(v) {
  const base = blankStats();
  if (!v || typeof v !== "object") return base;
  const num = (x) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0);
  base.bbLost = num(v.bbLost);
  base.usdBorrowed = num(v.usdBorrowed);
  base.cratesOpened = num(v.cratesOpened);
  base.withdrawalsPending = num(v.withdrawalsPending);
  base.worstLossBB = num(v.worstLossBB);
  base.lossStreak = num(v.lossStreak);
  const day = (x) => (typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : null);
  base.firstSeen = day(v.firstSeen);
  base.lastSeen = day(v.lastSeen);
  return base;
}
function loadKey(key, sanitize) {
  try { return sanitize(JSON.parse(localStorage.getItem(key) || "null")); } catch (e) { return sanitize(null); }
}
function saveKey(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
}
function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function daysBetween(fromKey, toKey) {
  const a = new Date(fromKey + "T00:00:00");
  const b = new Date(toKey + "T00:00:00");
  const days = Math.round((b - a) / 86400000);
  return Number.isFinite(days) && days > 0 ? days : 0;
}
function r2(x) { return Math.round(x * 100) / 100; }

let identity = loadKey(IDENTITY_KEY, sanitizeIdentity);
let stats = loadKey(STATS_KEY, sanitizeStats);
const listeners = new Set();

function notify() {
  const snap = { identity: Identity.get(), stats: Identity.getStats() };
  for (const fn of [...listeners]) {
    try { fn(snap); } catch (e) {}
  }
}
function saveAll() {
  saveKey(IDENTITY_KEY, identity);
  saveKey(STATS_KEY, stats);
  notify();
}
function commitStats(before) {
  saveAll();
  for (const field of Object.keys(MILESTONES)) {
    for (const threshold of MILESTONES[field]) {
      if (before[field] < threshold && stats[field] >= threshold) {
        Bus.emit(EVENTS.STATS_MILESTONE, { field, value: threshold });
      }
    }
  }
}

export const Identity = {
  exists() { return identity.tag !== null; },
  get() { return { ...identity }; },
  playerTag() { return identity.custom || identity.tag; },
  nextRerollFee() { return identity.nextRerollFeeBB; },
  assign() {
    identity = blankIdentity();
    identity.tag = generateTag();
    identity.assignedAt = new Date().toISOString();
    saveAll();
    Bus.emit(EVENTS.IDENTITY_ASSIGNED, { tag: identity.tag });
    return Identity.get();
  },
  revealReroll() {
    if (identity.tag === null) return Identity.get();
    identity.tag = generateTag();
    saveAll();
    return Identity.get();
  },
  applyPanelReroll() {
    if (identity.tag === null) return Identity.get();
    const prevFee = identity.nextRerollFeeBB;
    identity.tag = generateTag();
    identity.rerollCount += 1;
    identity.nextRerollFeeBB = prevFee === 0 ? 10 : prevFee * 2;
    saveAll();
    Bus.emit(EVENTS.IDENTITY_RENAMED, { kind: "reroll" });
    return Identity.get();
  },
  setCustom(name) {
    if (identity.tag === null) return Identity.get();
    identity.custom = cap16(String(name ?? ""));
    saveAll();
    Bus.emit(EVENTS.IDENTITY_RENAMED, { kind: "custom" });
    return Identity.get();
  },
  getStats() { return { ...stats }; },
  beginSession() {
    const today = dateKey(new Date());
    const hadIdentity = identity.tag !== null;
    let toast = null;
    if (!stats.firstSeen) stats.firstSeen = today;
    if (hadIdentity) {
      const tag = identity.custom || identity.tag;
      const days = stats.lastSeen ? daysBetween(stats.lastSeen, today) : 0;
      toast = days <= 0
        ? "Welcome back, " + tag + ". The house never noticed you left. The house sees everything."
        : "Welcome back, " + tag + ". The house noticed your " + days + "-day sabbatical. Your losing streak was preserved.";
    }
    stats.lastSeen = today;
    saveAll();
    return { existingIdentity: hadIdentity, toast };
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || p.wagered !== true) return;
  const before = { ...stats };
  const net = typeof p.netBB === "number" && Number.isFinite(p.netBB) ? p.netBB : 0;
  if (net < 0) {
    stats.bbLost = r2(stats.bbLost + -net);
    stats.worstLossBB = Math.max(stats.worstLossBB, r2(-net));
    stats.lossStreak += 1;
  } else if (WIN_KINDS.has(p.kind)) {
    stats.lossStreak = 0;
  }
  if (p.surface === "crates") stats.cratesOpened += 1;
  commitStats(before);
});
Bus.on(EVENTS.ROUND_FORFEIT, () => {
  const before = { ...stats };
  stats.lossStreak += 1;
  commitStats(before);
});
Bus.on(EVENTS.WITHDRAWAL_CREATED, () => {
  const before = { ...stats };
  stats.withdrawalsPending += 1;
  commitStats(before);
});
Bus.on(EVENTS.DEPOSIT_COMPLETED, (p) => {
  const usd = p && typeof p.usdFace === "number" && Number.isFinite(p.usdFace) ? p.usdFace : 0;
  if (usd > 0) {
    const before = { ...stats };
    stats.usdBorrowed = r2(stats.usdBorrowed + usd);
    commitStats(before);
  }
});

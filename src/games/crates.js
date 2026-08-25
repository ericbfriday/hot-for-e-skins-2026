// Loot Crate Defuser — pure helpers & constants (docs/spec/loot-crate-defuser.md)

export const KEY_PRICE_BB = 15;
export const CRATE_BASE_SECONDS = 15;
export const CRATE_CAP_SECONDS = 28;
export const SKIP_PRICE_BB = 3;
export const SKIP_STALL_EXTENSION_MS = 2000;
export const SKIP_JUMP_PCT = 7;
export const SKIP_APPEARS_AT_PCT = 30;

export function defuseDurationMs(crateSessionOpenedCount) {
  const seconds = Math.min(CRATE_CAP_SECONDS, CRATE_BASE_SECONDS + crateSessionOpenedCount);
  return seconds * 1000;
}

// Beat structure (§2): fractions of the total duration; StallA/StallB are fixed-length holds.
export function buildDefuseStages(totalMs, extraStallBMs) {
  const stallAMs = 1200;
  const stallBMs = 1500 + (extraStallBMs || 0);
  const lock1Ms = Math.max(300, totalMs * 0.12);
  const lock2Ms = Math.max(400, totalMs * 0.40);
  const snapMs = 150;
  const lock3Ms = Math.max(600, totalMs - lock1Ms - stallAMs - lock2Ms - stallBMs - snapMs);
  return [
    { key: "lock1", type: "move", from: 0, to: 40, ms: lock1Ms, caption: "DISARMING LOCK 1 OF 3" },
    { key: "stallA", type: "hold", at: 41, ms: stallAMs, caption: "NEGOTIATING WITH LOCK 2" },
    { key: "lock2", type: "move", from: 41, to: 88, ms: lock2Ms, caption: "DISARMING LOCK 2 OF 3" },
    { key: "stallB", type: "hold", at: 89, ms: stallBMs, caption: "THE DROP" },
    { key: "lock3", type: "move", from: 89, to: 99, ms: lock3Ms, caption: "DISARMING LOCK 3 OF 3 (agonizing)" },
    { key: "snap", type: "move", from: 99, to: 100, ms: snapMs, caption: "SNAP" },
  ];
}
export const TRACK_NAME_CAPTION = "BASS_DROP_FINAL_v3_REAL.mp3 — unskippable (no, you cannot skip this)";

// Award pool & odds (§5) — legendary is reel-only, never a real outcome.
export const AWARD_POOL = [
  { id: "clip-art-trophy", name: "Clip Art of a Trophy.png", tier: "Consumer Grade Trash", value: 0.03, weight: 40 },
  { id: "confused-businessman", name: "Stock Photo of Confused Businessman.jpg", tier: "Consumer Grade Trash", value: 0.05, weight: 25 },
  { id: "sunset-over-water", name: "Royalty-Free Sunset Over Water.jpg", tier: "Industrial Denial", value: 0.35, weight: 15 },
  { id: "generic-handshake", name: "Generic Photo of a Handshake.jpg", tier: "Industrial Denial", value: 0.49, weight: 10 },
  { id: "watermarked-preview", name: "Watermarked Preview Image.jpg", tier: "Mil-Spec Regret", value: 1.99, weight: 6 },
  { id: "thumbnail-rewatch", name: "Thumbnail of a Video You Already Watched.jpg", tier: "Mil-Spec Regret", value: 2.49, weight: 3 },
  { id: "leadership-slide", name: "Screenshot of the Leadership Slide Deck.png", tier: "Classified Overdraft", value: 19.99, weight: 0.9 },
  { id: "golden-handshake", name: "Stock Photo of Golden Handshake.jpg", tier: "Contraband Liability", value: 4.99, weight: 0.1 },
];
export const FRUIT_ROLL_UP = {
  id: "fruit-roll-up", name: "Half-Eaten Fruit Roll-Up, AWP | Mom's Visa Signature Edition",
  tier: "Covert Extravagance", value: 999.99, weight: 0, reelOnly: true,
};
const TOTAL_WEIGHT = AWARD_POOL.reduce((a, b) => a + b.weight, 0);

export function pickAward() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const a of AWARD_POOL) {
    if (roll < a.weight) return a;
    roll -= a.weight;
  }
  return AWARD_POOL[0];
}

export function confettiEligible(tier) {
  return tier === "Classified Overdraft" || tier === "Contraband Liability" || tier === "Covert Extravagance";
}

// Settlement kind per tier (integration.md §3 kind vocabulary; win kinds match
// chat's WIN_KINDS so the MOD win-deletion theater fires on "real" awards):
// trash "wins" are junk-wins, the two top real tiers are jackpot/legendary-win,
// everything else settles as a plain key-defused (house-win shaped loss).
export function kindForTier(tier) {
  if (tier === "Consumer Grade Trash") return "junk-win";
  if (tier === "Classified Overdraft") return "jackpot";
  if (tier === "Contraband Liability") return "legendary-win";
  return "key-defused";
}

// Local calendar day (midnight local — the mood/identity per-day seed family),
// for the Daily Mom Key once-per-day stamp.
export function localDayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
export function dayKeyBefore(key, days = 1) {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() - days);
  return localDayKey(d);
}

// Reel strip: fixed length, Fruit Roll-Up immediately before the landing slot,
// then "recalibrates" one position further back as the needle gets adjacent (§3).
export function buildReelStrip(landingAward, recalibrated) {
  const LEN = 12;
  const landingIndex = 9;
  const rollUpIndex = recalibrated ? landingIndex - 2 : landingIndex - 1;
  const strip = [];
  for (let i = 0; i < LEN; i++) {
    if (i === landingIndex) strip.push(landingAward);
    else if (i === rollUpIndex) strip.push(FRUIT_ROLL_UP);
    else strip.push(AWARD_POOL[Math.floor(Math.random() * AWARD_POOL.length)]);
  }
  return { strip, landingIndex };
}

// Pity Meter / DupeShield (§6) — never reaches 50; recalibrates to 1-37.
export const PITY_CEILING = 50;
export function incrementPity(current) {
  const next = current + 1;
  if (next >= PITY_CEILING) {
    return { value: 1 + Math.floor(Math.random() * 37), recalibrated: true };
  }
  return { value: next, recalibrated: false };
}

export const CRATE_TICKER_TEMPLATES = [
  "{n} was 1 slot away from the Fruit Roll-Up (the slot moved)",
  "{n} unboxed Stock Photo of Golden Handshake.jpg (worth exactly one key)",
  "{n}'s pity meter was recalibrated for their own good (§8.9)",
  "{n} defused 12 crates today. The JPEGs are winning.",
  "A key arrived from Mom (no return address)",
];
export const CRATE_CHAT = [
  { user: "NotABot_Trust", msg: "the pity meter is real, my cousin hit 50 once", color: "#ffd54a" },
  { user: "pitybeliver_2009", msg: "reset at 49?? MOOD IMPROVED???", color: "#e8c9ac" },
  { user: "MOD_Chad_Official", msg: "free keys arrive when you least deserve them", color: "#8fd97a" },
];

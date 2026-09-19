// AI Skin Foundry — the dream generator (pure) + copy tables.
// Canon: docs/spec/ai-skin-foundry.md; integration-2026 §2 (dreams settle as
// key-defused + dreamed:true), §3 (free dreams are free rounds), §4 (+0.2/key,
// identical to crate keys — rides the crates vault feed), §10.3 (one Pity
// Meter, three labels), §10.11 (Trade-Up accepts five same-tier dreams).
//
// Determinism is the provenance (spec §3): every dream is synthesized from
// Mood.seed() + day + dreamIndex, so dream #41 is always dream #41, forever.
// Hash discipline (integration-2026 §10.10): the seeded rolls and the prompt
// receipt call the ONE FNV-1a family, home src/games/fairness.js — the Foundry
// mints no second family. No React, no DOM, no persistence here (App owns the
// localStorage keys, spec §8).

import { fnv1a, pseudoHash16 } from "./fairness.js";
import { RARITY_COLORS } from "./catalog.js";
import { Mood } from "../spine/mood.js";
import { localDayKey } from "./crates.js";

// ---- §1 pricing -----------------------------------------------------------------
export const DREAM_KEY_PRICE_BB = 20; // the standard key is 15; the premium covers electricity (est.)
export const DREAM_PREMIUM_NOTE = "the premium covers electricity (est.)";
export const DREAM_BUNDLES = [
  { keys: 5, priceBB: 93 },
  { keys: 20, priceBB: 333 },
];
// Bundles mirror the crate table at 4/3 pricing; round numbers were rejected
// and §8.9 rounding applies at receipt — the voided difference is itemized,
// because itemizing it is the receipt.
export function dreamBundleReceiptLine(b) {
  const face = b.keys * DREAM_KEY_PRICE_BB;
  const voided = face - b.priceBB;
  return b.keys + " Dream Keys received — " + b.priceBB + " BB. §8.9 rounding at receipt: " + voided + " BB voided (itemized, unforgettable).";
}

// ---- §2 ceremony timing ------------------------------------------------------------
// Same ladder as the crate (base 15.0s +1.0s per dream this session, capped
// 28.0s) — "building suspense, per your feedback" is tradition now.
export const DREAM_BASE_SECONDS = 15;
export const DREAM_CAP_SECONDS = 28;
export function dreamDurationMs(sessionDreams) {
  return Math.min(DREAM_CAP_SECONDS, DREAM_BASE_SECONDS + sessionDreams) * 1000;
}
export const LATENCY_MS = 1500; // THE LATENCY is pinned at 89% for 1.5s ("generating originality")
export const REEL_MS = 3200;    // snap → gallery reel (3.2s)

// The dream ceremony's beat skeleton (§2) — same shape as the defuse, inverted
// vocabulary. The crate is being rendered, not disarmed.
export const WITHHELD_PROMPT_GAG = "prompt withheld for safety (prompt: 'a spork, but it feels something, 8k, trending, sad')";
export const RENDER_CAPTION = "RENDERING (tokens)";
export const LATENCY_CAPTION = "THE LATENCY — generating originality";
export const CONVERGED_CAPTION = "converged early (the model is decisive)";
export function buildDreamStages(totalMs, extraLatencyMs) {
  const slamMs = Math.max(320, totalMs * 0.06);
  const latencyMs = LATENCY_MS + (extraLatencyMs || 0);
  const snapMs = 150;
  const renderMs = Math.max(600, totalMs * 0.36);
  const upscaleMs = Math.max(600, totalMs - slamMs - LATENCY_MS - snapMs - renderMs);
  return [
    { key: "slam", type: "move", from: 0, to: 8, ms: slamMs, caption: "PROMPT SLAM" },
    { key: "render", type: "move", from: 8, to: 89, ms: renderMs, caption: RENDER_CAPTION },
    { key: "latency", type: "hold", at: 89, ms: latencyMs, caption: LATENCY_CAPTION },
    { key: "upscale", type: "move", from: 89, to: 99, ms: upscaleMs, caption: "UPSCALING (the pixels are aspirational)" },
    { key: "snap", type: "move", from: 99, to: 100, ms: snapMs, caption: "SNAP" },
  ];
}

// The token counter: streams during RENDERING (8→89%). The total is
// deterministic per dream — the tokens were always going to be these tokens.
export function dreamTokenTotal(art) { return 9000 + Math.floor(art.tokenSeed * 7000); }
export function tokensRendered(pct, dream) {
  if (!dream || pct < 8) return 0;
  const frac = Math.min(1, (pct - 8) / 81);
  return Math.floor(dreamTokenTotal(dream.art) * frac);
}

// ---- §3 the dreamed decks -----------------------------------------------------------
export const DREAM_PREFIXES = ["Neon", "Vaporwave", "Hyperreal", "Quantum", "Feral", "Sentimental", "Tactical", "Gluten-Free"];
export const DREAM_OBJECTS = ["Spork", "Mom Card", "Retainer", "Juice Box", "Gaming Chair", "Trophy", "Wifi Password", "Fruit Roll-Up"];
export const DREAM_SUFFIXES = ["(Dreamed)", "(Remix)", "Core", "Octane", ".5", "Ultra"];

// The crate tier vocabulary, wearing the dreamed modifier (spec §3). Weights
// are the dreamed odds table: adjacent to the crate's, moodier at the top.
// Disclosure: "Odds: dreamed. (The model was in a mood.)"
export const DREAM_ODDS_NOTE = "Odds: dreamed. (The model was in a mood.)";
export const DREAM_TIERS = [
  { base: "Consumer Grade Trash", weight: 52, min: 0.02, max: 0.08 },
  { base: "Industrial Denial", weight: 28, min: 0.30, max: 0.60 },
  { base: "Mil-Spec Regret", weight: 14.2, min: 1.99, max: 3.33 },
  { base: "Classified Overdraft", weight: 5, min: 19.99, max: 24.99 },
  { base: "Contraband Liability", weight: 0.8, min: 4.99, max: 5.00 }, // the liability is priced at exactly one (1) apology
];
// Contract-only (integration-2026 §10.11): the Trade-Up's dreamed ceiling —
// the cheapest Covert Extravagance (Dreamed) is only ever five Contraband
// dreams deep, and it is still worth $0.00. Priced one cent under the JPEG it
// dreams of being (§8.9).
export const DREAM_COVERT = { base: "Covert Extravagance", min: 999.98 };
export function dreamedTierName(base) { return base + " (Dreamed)"; }
export function dreamTierColor(base) { return RARITY_COLORS[base] || "#a24ae2"; }
const TOTAL_TIER_WEIGHT = DREAM_TIERS.reduce((a, b) => a + b.weight, 0);

// **The Undreamed™** — the reel's permanent near-miss (spec §3). It cannot be
// generated (must be earned (cannot be earned)). The Karambit's rhyme.
export const THE_UNDREAMED = {
  id: "the-undreamed",
  name: "THE UNDREAMED™",
  tier: "The Undreamed",
  caption: "cannot be generated (must be earned (cannot be earned))",
  reelOnly: true,
  color: "#000000",
};
export const UNDREAMED_TOAST = "SO CLOSE! The Undreamed™ remains undreamed. (distance does not affect outcome; this reel is a movie; §4.2)";

// ---- the absurd prompt deck ----------------------------------------------------------
// Prompts are auto-concatenated absurdity (spec §3): subject, light, feeling,
// style, quality, watermark gag. The slam's withheld example lives above.
const PROMPT_PARTS = [
  ["mom's visa", "a spork, but it feels something", "the retainer (pre-orthodontist)", "gaming chair crease, 3am", "juice box, sweating", "a participation trophy, crying", "the wifi password, handwritten", "fruit roll-up (half), glistening", "dad's chair (empty)", "the vending machine, row 3", "a laminated mom card", "one (1) headphone jack"],
  ["at golden hour", "under fluorescents", "at 3am (school night)", "bathed in monitor glow", "during an imagined fire drill", "in the rain (emotional)"],
  ["crying", "vaporwaving", "yearning", "contacting the orthodontist", "achieving nothing (gloriously)", "being perceived", "waiting for the bus (metaphorically)"],
  ["product shot", "hyperreal render", "lo-fi camcorder still", "accidental renaissance", "cinematic still (from nothing)", "selfie (someone else's)"],
  ["8k", "8k, trending", "4k (claimed)", "12k (the number is aspirational)", "max resolution (pending)"],
  ["no watermark (watermark pending)", "no watermark (the watermark arrives later, §8.9)", "watermark removed (removal pending)", "no watermark (the watermark is conceptual)"],
];
function buildPrompt(rng) {
  const parts = [];
  for (const pool of PROMPT_PARTS) parts.push(pool[Math.floor(rng() * pool.length)]);
  return parts.join(", ");
}

// ---- the art config (all numbers seeded; the renderer is a pure function of these) ----
// Slop companions: the neon teal/pink/purple accent pool every generated
// image in 2026 seems to share. Derivative of everything, provably.
const SLOP_ACCENTS = ["#ff6ec7", "#7fd4ff", "#b28dff", "#5ef2c0", "#ffb35c", "#ff5e78", "#9df", "#f4a4ff"];
function buildArt(rng, tierBase) {
  const tier = dreamTierColor(tierBase);
  const companions = [];
  while (companions.length < 2) {
    const c = SLOP_ACCENTS[Math.floor(rng() * SLOP_ACCENTS.length)];
    if (c !== tier && !companions.includes(c)) companions.push(c);
  }
  const splatter = Array.from({ length: 4 + Math.floor(rng() * 4) }, () => ({
    x: 10 + rng() * 100, y: 8 + rng() * 74, r: 3 + rng() * 10, o: 0.12 + rng() * 0.22,
  }));
  const sparkles = Array.from({ length: 4 }, (_, i) => ({
    x: 12 + rng() * 96, y: 10 + rng() * 70, s: 2.2 + rng() * 2.6, delay: i * 0.55 + rng() * 0.3,
  }));
  const beams = Array.from({ length: 3 }, () => ({
    x: -10 + rng() * 60, y: rng() * 80, w: 8 + rng() * 22, o: 0.10 + rng() * 0.14, rot: -30 + rng() * 60,
  }));
  return {
    tier, companions,
    chassis: Math.floor(rng() * 3),       // blade | launcher | rifle — abstract weapon-ish silhouette
    emblem: Math.floor(rng() * 8),        // which object sigil rides the chassis
    flip: rng() < 0.5,                    // the silhouette faces the other way, as a mood
    glow: 0.35 + rng() * 0.4,
    tokenSeed: rng(),
    splatter, sparkles, beams,
  };
}
// REMIX (§4): palette-swap only — the same composition returns with new
// companions. The shapes never change; that is what makes it a remix. The
// swap is guaranteed: the first companion is drawn from the pool the old pair
// just vacated, so a remix never re-renders identical (that's convergence,
// which is a different gag).
function swapPalette(art, rng) {
  const pool = SLOP_ACCENTS.filter((c) => c !== art.companions[0] && c !== art.companions[1]);
  const cA = pool[Math.floor(rng() * pool.length)];
  const pool2 = SLOP_ACCENTS.filter((c) => c !== cA && c !== art.tier);
  const cB = pool2[Math.floor(rng() * pool2.length)];
  return { ...art, companions: [cA, cB], glow: 0.35 + rng() * 0.4 };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function round2(n) { return Math.round(n * 100) / 100; }

// The generator. dream #N on day D is dream #N on day D, forever — determinism
// is the provenance, the receipt is the dream (integration-2026 §10.10: the
// prompt receipt hashes through the FNV-1a family's 16-hex lane).
export function generateDream(dreamIndex, now = new Date(), forcedTierBase = null) {
  const day = localDayKey(now);
  const seedStr = Mood.seed(now) + "#dream#" + day + "#" + dreamIndex;
  const rng = mulberry32(fnv1a(seedStr));
  const tierDef = forcedTierBase
    ? (DREAM_TIERS.find((t) => t.base === forcedTierBase) || DREAM_COVERT)
    : (() => {
      let roll = rng() * TOTAL_TIER_WEIGHT;
      let pick = DREAM_TIERS[DREAM_TIERS.length - 1];
      for (const t of DREAM_TIERS) {
        if (roll < t.weight) { pick = t; break; }
        roll -= t.weight;
      }
      return pick;
    })();
  const baseTier = tierDef.base;
  const prefix = DREAM_PREFIXES[Math.floor(rng() * DREAM_PREFIXES.length)];
  const object = DREAM_OBJECTS[Math.floor(rng() * DREAM_OBJECTS.length)];
  const suffix = DREAM_SUFFIXES[Math.floor(rng() * DREAM_SUFFIXES.length)];
  const name = prefix + " " + object + " " + suffix;
  const prompt = buildPrompt(rng);
  const art = buildArt(rng, baseTier);
  const max = typeof tierDef.max === "number" ? tierDef.max : tierDef.min;
  const value = round2(tierDef.min + rng() * (max - tierDef.min));
  return {
    index: dreamIndex,
    id: "dream-" + day + "-" + dreamIndex,
    seedStr,
    baseTier,
    tier: dreamedTierName(baseTier),
    tierColor: dreamTierColor(baseTier),
    prefix, object, suffix,
    name, prompt, value, art,
    remix: 0,
    receipt: pseudoHash16(prompt + "#" + seedStr),
    statMetric: "Downloads: 4,000,000 (est.)",
  };
}

// The Trade-Up output (§6 / integration-2026 §10.11): the cheapest dream of
// the next tier — literally the tier floor, dreamed deterministically from the
// five sacrificed uids + the day. The only exit that pretends.
export function cheapestDreamOfTier(baseTier, seedStr, now = new Date()) {
  const rng = mulberry32(fnv1a(seedStr + "#dreamcontract"));
  const prefix = DREAM_PREFIXES[Math.floor(rng() * DREAM_PREFIXES.length)];
  const object = DREAM_OBJECTS[Math.floor(rng() * DREAM_OBJECTS.length)];
  const suffix = DREAM_SUFFIXES[Math.floor(rng() * DREAM_SUFFIXES.length)];
  const prompt = buildPrompt(rng);
  const art = buildArt(rng, baseTier);
  const seedFull = seedStr + "#dreamcontract";
  return {
    index: 0, // contract output — not part of the dream-indexed ledger
    id: "dream-" + seedStr,
    seedStr: seedFull,
    baseTier,
    tier: dreamedTierName(baseTier),
    tierColor: dreamTierColor(baseTier),
    prefix, object, suffix,
    name: prefix + " " + object + " " + suffix,
    prompt, value: (DREAM_TIERS.find((t) => t.base === baseTier) || DREAM_COVERT).min,
    art, remix: 0,
    receipt: pseudoHash16(prompt + "#" + seedFull),
    statMetric: "Downloads: 4,000,000 (est.)",
  };
}

// A duplicate doesn't recycle — it REMIXES (§4): same composition,
// palette-swapped, name suffixed (Remix #{n}). Novelty compounds downward.
export function remixDream(dream, n) {
  const rng = mulberry32(fnv1a(dream.seedStr + "#remix#" + n));
  return {
    ...dream,
    name: dream.name + " (Remix #" + n + ")",
    art: swapPalette(dream.art, rng),
    remix: n,
    value: Math.max(0.01, round2(dream.value / (n + 1))),
  };
}

// ---- §6 the walls + provenance copy (foundry-owned; App/marketplace render it) ----
export const PROVENANCE_LINE = "Derivative of everything, provably. Originality: est. pending.";
export const DREAM_WEAR_STAMP = "Certified Pre-Worse™ (Dreamed): wear is conceptual";
export const DREAM_INSTANT_SELL_WALL = "unavailable: the asset predates appraisal (the model is the market (pending))";
export const DREAM_LIST_WALL = "the market cannot price a dream (§8.9)";
export const REMIX_TOAST = "REMIXED — still yours, technically new (novelty: est.)";
export function dreamPromptReceipt(prompt) { return 'dreamed from: "' + prompt + '"'; }

// The inventory patch: dreamed assets land as Digital Assets with the dreamed
// provenance in place of a JPEG filename (spec §6). App and the marketplace's
// dreamed Trade-Up both apply this after Inventory.award — one shape, two doors.
export function dreamInventoryExtras(dream) {
  return {
    dreamed: true,
    dreamTier: dream.tier,
    dreamBaseTier: dream.baseTier,
    baseName: dream.name.replace(/ \(Remix #\d+\)$/, ""),
    prompt: dream.prompt,
    dreamReceipt: dream.receipt,
    dreamArt: dream.art, // the seeded composition — the renderer is a pure function of it
    remixN: dream.remix || 0,
    dreamValue: dream.value,
    wear: DREAM_WEAR_STAMP,
  };
}
export function dreamProvenanceLines(dream) {
  const lines = [
    "Acquired: dreamed live (the model was in a mood)",
    dreamPromptReceipt(dream.prompt),
    PROVENANCE_LINE,
  ];
  if (dream.remix) lines.push("Remix #" + dream.remix + " — palette-swapped (the composition never changed)");
  return lines;
}

// ---- §5 the shared meter's third label ---------------------------------------------
// One counter, one recalibration, one never-arriving 50 (integration-2026
// §10.3) — the Foundry adds the label, not the meter.
export function foundryPityLabel(n) {
  return "Pity Meter / DupeShield™ / DreamShield™: " + n + " / 50";
}
export const FOUNDRY_PITY_HEADER = "GUARANTEED original-ish every 50 dreams!™";
export const FOUNDRY_PITY_FINE_PRINT = "original-ish is satisfiable by anything we label original *by us* · remixes count as dreams (there is no duplicate protection; there is duplicate rebranding) · the draw is the day-seeded deterministic family";

// ---- §1 the free valve ---------------------------------------------------------------
export const FIRST_FREE_WAX_SEAL = "UTILIMOM™ (she doesn't know either)";
export const FIRST_FREE_TOAST = "First Dream Free™ — wax seal: " + FIRST_FREE_WAX_SEAL + ". The first one is complimentary (they always are, see §4.5).";

// ---- §7 pools (verbatim; the ambient twins live in ticker/engine.js + chat/constants.js)
export const FOUNDRY_TICKER_TEMPLATES = [
  "{n} dreamed Sentimental Retainer Core (derivative of everything, provably)",
  "{n}'s dream was REMIXED for the 4th time (novelty: est.)",
  "THE UNDREAMED remains undreamed ({n} was 1 slot away (the slot didn't move))",
  "{n} received their First Dream™ free (subsequent dreams priced normally)",
];
export const FOUNDRY_CHAT = [
  { user: "promptwizard_9k", msg: "i asked for the karambit and it dreamed me a spork FEELING something", color: "#ffd54a" },
  { user: "DEPOSITOR.ai", badge: "[AI]", msg: "Analysis: the dreams are original (est.). Collecting originals correlates with depositing (see everything).", color: "#7fd4ff" },
  { user: "MOD_Chad_Official", badge: "[MOD]", msg: "AI skins are the future!! the future is pending!!", color: "#8fd97a" },
];

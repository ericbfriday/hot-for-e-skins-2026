// Skin Coinflip — pure outcome/copy engine (no React, no DOM).
// Canon: docs/spec/skin-coinflip.md. See App.jsx for the ceremony/UI.
import { GAME_PRICES_BB } from "../spine/constants.js";

export const FLIP_PRICE_BB = GAME_PRICES_BB.coinflip; // 3
export const REMATCH_PRICE_BB = 3;

export const JUNK_STASH = [
  { id: "screenshot", name: "Screenshot of a Skin (Left Half).jpg", value: "$0.99" },
  { id: "coinphoto", name: "Stock Photo of a Coin.jpg", value: "$1.49" },
  { id: "checkerboard", name: "Missing Texture Checkerboard.png", value: "$2.49" },
  { id: "watermark", name: "Watermarked Preview Image.jpg", value: "$1.99" },
  { id: "karambit", name: "Slightly Bent Karambit (Photo).png", value: "$3.50" },
  { id: "handshake", name: "Stock Photo of Golden Handshake.jpg", value: "$4.99" },
];
export const LEGENDARY_ITEMS = [
  { id: "spork", name: "Tactical Plastic Spork", value: "$1,420.69", baseValue: 1420.69 },
  { id: "awp", name: "AWP | Mom's Visa Signature Edition", value: "$8,500.00", baseValue: 8500.0 },
  { id: "fruitrollup", name: "Half-Eaten Fruit Roll-Up", value: "$999.99", baseValue: 999.99 },
];

// §2 outcome table, weights sum to 100.
const TABLE = [
  { kind: "house-win", weight: 60 },
  { kind: "edge", weight: 15 },
  { kind: "photo-finish", weight: 12 },
  { kind: "junk-win", weight: 8 },
  { kind: "nibble", weight: 4 },
  { kind: "legendary-win", weight: 1 },
];
export const TABLE_WEIGHTS = TABLE.reduce((acc, r) => { acc[r.kind] = r.weight; return acc; }, {});

export function rollOutcome(rng = Math.random) {
  const total = TABLE.reduce((a, b) => a + b.weight, 0);
  let r = rng() * total;
  for (const row of TABLE) {
    if (r < row.weight) return row.kind;
    r -= row.weight;
  }
  return TABLE[TABLE.length - 1].kind;
}

export function pickStashItem(rng = Math.random) {
  return JUNK_STASH[Math.floor(rng() * JUNK_STASH.length)];
}
export function pickLegendary(rng = Math.random) {
  return LEGENDARY_ITEMS[Math.floor(rng() * LEGENDARY_ITEMS.length)];
}

// §3 edge outcome justification ladder, verbatim.
export function edgeLadderLine(k) {
  if (k === 1) return "The coin landed on its edge. Tie goes to the server host.";
  if (k === 2) return "Another edge. Ties go to the server host (ToS §5.4). The rim is certified.";
  if (k === 3) return "Edge #3. Reviewed by the admin's cousin. He says it's an edge. He's studying for this.";
  if (k === 4) return "Edge #4. The cousin has recused himself. Ties go to the server host's estate.";
  if (k === 5) return "Edge #5. Quantum drift (§8.9): the coin briefly held both outcomes. We kept the profitable one.";
  if (k === 6) return "Edge #6. The rim is load-bearing now.";
  const variants = [
    "Edge #" + k + ". At this point it's basically a third face. A house face.",
    "Edge #" + k + ". Physics has been notified and declined to comment.",
    "Edge #" + k + ". You've seen " + k + " edges. The record is " + (k + 1) + "*. *the record also goes to the house.",
  ];
  return variants[k % variants.length];
}

// §4 photo finish
export const PHOTO_FINISH_LINE = "PHOTO FINISH: landed {call} by 1.1°. Rounded against you, as traditional (§8.9).";
export function photoFinishBackToBackLine() {
  return "Two overturned wins in a row. The replay is also a reenactment (§4.2²).";
}

export function receiptFor() {
  return {
    lines: [
      { label: "Base flip", amount: 1.2 },
      { label: "Coin Certification (both faces)", amount: 0.6 },
      { label: "Rim Maintenance (the edge)", amount: 0.4 },
      { label: "Maternal Gratuity (customary, not required, automatically applied)", amount: 0.3 },
      { label: "§8.9 rounding (up, as traditional)", amount: 0.5 },
    ],
    total: 3.0,
  };
}

// §8 bot personality streak taunts.
export function streakTaunt(streak, tag) {
  if (streak >= 7) return "Admin_TradeBot_69: at this point I'm just holding your BB for you (§1.3).";
  if (streak >= 5) return "Admin_TradeBot_69: " + streak + " and counting. My cousin says hi (he certified your edges).";
  if (streak >= 3) return "Admin_TradeBot_69: " + tag + " is on a " + streak + "-flip streak. I've started a boat fund.";
  return null;
}

export function tickerLineForOutcome(kind, tag, item) {
  switch (kind) {
    case "house-win":
      return "You lost " + FLIP_PRICE_BB + " BB to the house (shocking)";
    case "edge":
      return "Admin_TradeBot_69 collects the edge-case bounty";
    case "photo-finish":
      return "PHOTO FINISH: " + tag + "'s win overturned by one (1) degree. Referee: the house";
    case "junk-win":
      return tag + " won " + (item ? item.name : "an item") + " off Admin_TradeBot_69 (est. " + (item ? item.value : "") + " — pending, §1.3)";
    case "nibble":
      return tag + " broke even. A crowd gathered.";
    case "legendary-win":
      return tag + " WON " + (item ? item.name : "a legendary") + " off Admin_TradeBot_69 (est. " + (item ? item.value : "") + " — pending, §1.3)";
    default:
      return null;
  }
}

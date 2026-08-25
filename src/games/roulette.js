// Allowance Roulette — pure outcome/copy engine (no React, no DOM).
// Canon: docs/spec/allowance-roulette.md. See App.jsx for the ceremony/UI.
import { GAME_PRICES_BB } from "../spine/constants.js";

export const SPIN_PRICE_BB = GAME_PRICES_BB.roulette; // 8
export const TURBO_FEE_BB = 2; // Velocity Fee
export const INSURANCE_FEE_BB = 1; // Lucky Spin Insurance
export const CHASE_IT_PRICE_BB = 16;

export const JACKPOT_ITEMS = [
  { id: "spork", name: "Tactical Plastic Spork", value: "$1,420.69" },
  { id: "awp", name: "AWP | Mom's Visa Signature Edition", value: "$8,500.00" },
  { id: "fruitrollup", name: "Half-Eaten Fruit Roll-Up", value: "$999.99" },
];
export const JUNK_ITEMS = [
  { id: "junk-consumer", name: "Consumer Grade Trash", value: "$0.75" },
  { id: "junk-milspec", name: "Mil-Spec Regret", value: "$3.40" },
  { id: "junk-industrial", name: "Industrial Denial", value: "$0.11" },
];

// §2 outcome table, weights sum to 100.
const TABLE = [
  { kind: "house-win", weight: 62 },
  { kind: "near-miss", weight: 25 },
  { kind: "junk-win", weight: 8 },
  { kind: "nibble", weight: 4 },
  { kind: "jackpot", weight: 1 },
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

export function pickJunkItem(rng = Math.random) {
  return JUNK_ITEMS[Math.floor(rng() * JUNK_ITEMS.length)];
}
// "always the item adjacent to the one the near-miss used most recently, if any"
export function pickJackpotItem(lastNearMissId, rng = Math.random) {
  if (lastNearMissId) {
    const idx = JACKPOT_ITEMS.findIndex((j) => j.id === lastNearMissId);
    if (idx >= 0) return JACKPOT_ITEMS[(idx + 1) % JACKPOT_ITEMS.length];
  }
  return JACKPOT_ITEMS[Math.floor(rng() * JACKPOT_ITEMS.length)];
}
export function pickNearMissJackpot(rng = Math.random) {
  return JACKPOT_ITEMS[Math.floor(rng() * JACKPOT_ITEMS.length)];
}

export function nearMissToast(item, backToBack) {
  if (backToBack) return "TWO near-misses in a row. That's not luck, that's targeting. (It is.)";
  const variants = [
    "SO CLOSE! The " + item.name + " was 1 slot away.",
    "SO CLOSE! 1 slot off. The " + item.name.split(" ")[0] + " was practically yours.",
    "Adjacent to greatness!",
    "You missed by ONE slot. Statistically, you're due for a loss.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

// §5 loss-streak consolation ladder. `streak` = consecutive losses since
// last fake win. Returns null when no rung fires this streak value.
export function consolationForStreak(streak, moodWord) {
  if (streak === 3) {
    return { rung: 3, kind: "insurance", banner: "You've lost 3 in a row. That's not luck, that's product design. Here's 1 BB on the house.", awardBB: 1 };
  }
  if (streak === 5) {
    return { rung: 5, kind: "pity", banner: "We checked. It's not getting better. Take this.", awardItem: { id: "trophy", name: "Participation Trophy | Gold Foil Wounded Pride", value: "$16.00" } };
  }
  if (streak === 7) {
    return { rung: 7, kind: "badge", banner: "Consistent! badge awarded." };
  }
  if (streak === 10) {
    return { rung: 10, kind: "mom-coupon", banner: "Mom Coupon™ — 1 FREE SPIN, redeemable only when the mood is Generous (today: " + moodWord + ")." };
  }
  if (streak > 0 && streak % 20 === 0) {
    return { rung: streak, kind: "apology", banner: "At this point we're just impressed.", feeBB: 1 };
  }
  return null;
}

export function receiptFor({ turbo, insured } = {}) {
  const lines = [
    { label: "Base game", amount: 4.0 },
    { label: "Handling (the wheel is heavy)", amount: 1.5 },
    { label: "Suspense & Drama surcharge", amount: 1.0 },
    { label: "Maternal Gratuity (customary, not required, automatically applied)", amount: 0.5 },
    { label: "§8.9 rounding (up, as traditional) [from 7.5]", amount: 1.0 },
  ];
  let total = 8.0;
  if (turbo) { lines.unshift({ label: "Velocity Fee (arrives at the same destination, faster)", amount: 2.0 }); total += 2.0; }
  if (insured) { lines.push({ label: "Lucky Spin Insurance (payout: emotional)", amount: 1.0 }); total += 1.0; }
  return { lines, total };
}

export function tickerLineForOutcome(kind, tag, item) {
  switch (kind) {
    case "house-win": {
      const lines = [
        "You lost " + SPIN_PRICE_BB + " BB to the house (shocking)",
        "House collects " + SPIN_PRICE_BB + " BB (fees assessed)",
        SPIN_PRICE_BB + " BB entered the Allowance pipeline",
        "The wheel did its job. You did yours.",
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
    case "near-miss":
      return tag + " was 1 slot off the " + (item ? item.name : "jackpot item") + " (so close, by design)";
    case "junk-win":
      return tag + " won a " + (item ? item.name : "junk item") + " (est. " + (item ? item.value : "") + ") (withdrawal pending)";
    case "nibble":
      return tag + " received 2 BB Rakeback (net: still down)";
    case "jackpot":
      return tag + " WON the " + (item ? item.name : "the jackpot") + " (est. " + (item ? item.value : "") + ")! Withdrawal: pending (ToS §1.3)";
    default:
      return null;
  }
}

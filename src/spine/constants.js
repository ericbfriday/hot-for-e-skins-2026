export const MOMCODE = "MOMCODE";
export const MOMCODE_MIKE = "MOMCODE_MIKE";
export const MIKE_HOT_DB = 3;
export const MIKE_HOT_DB_DESPERATION = 4;
export const POPULATION = 847;
export const DESPERATION_TAGLINE = "everyone is winning except you*";
export const DESPERATION_TAGLINE_FOOTNOTE = "*estimated";
export const MATERNAL_STARTER_GRANT_BB = 150;
export const DESPERATION_THRESHOLD_BB = 6;
export const LEGACY_USD_TO_BB = 0.003;
export const LEGACY_TO_WHOLE_BB_SCALE = 1000;
export const GAME_PRICES_BB = { coinflip: 3, roulette: 8, crash: 15, crates: 15 };
export const OC_TO_BB_BASE_RATE = 0.5;
export const CONVERSION_FEES = [
  { id: "mood-stabilization", name: "Mood Stabilization Fee", kind: "percent", rate: 0.073, blurb: "keeps the rate from getting worse" },
  { id: "conversion-processing", name: "Conversion Processing Fee", kind: "flatBB", amount: 5 },
  { id: "maternal-gratuity", name: "Maternal Gratuity", kind: "flatBB", amount: 1, blurb: "customary, not required, automatically applied" },
  { id: "section-8-9-rounding", name: "§8.9 rounding", kind: "rounding", direction: "down", blurb: "fractional BB voided and itemized" },
];
export const REFILL_PACKAGES = [
  { id: "lunch-money", name: "Lunch Money Special", usdFace: 4.99, oc: 500, bonusOc: 0, tag: "Mom-approved starter size" },
  { id: "allowance-advance", name: "Allowance Advance", usdFace: 19.99, oc: 1900, bonusOc: 150, tag: "MOST POPULAR™" },
  { id: "report-card", name: "Report Card Bonus", usdFace: 49.99, oc: 4500, bonusOc: 0, tag: "assume she didn't check the actual grades" },
  { id: "moms-max", name: "Mom's Max", usdFace: 99.99, oc: 9999, bonusOc: 0, tag: "for when she said 'this is the last time'" },
];
export const V_GEMS_PER_BB = 40000;
export const SKINCOINZ_PER_BB = 566.67;
export const NAG_LOW_BB_COPY = "Your Banana Bucks are running low. Mom would want you to top up.";
export const INSUFFICIENT_FUNDS_COPY = "Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3).";
export const INSUFFICIENT_FUNDS_ESCALATION_COPY = "Other kids' moms already said yes today.";
export const TOP_UP_PLACEHOLDER_COPY = "coming soon in the Ask-Mom flow";

// College Fund Crash — pure helpers & constants (docs/spec/college-fund-crash.md)
// House invariant: no crash run ever nets more than +1 BB (§5.5, character-win cap).

export const CRASH_PRICE_BB = 15;
export const CRASH_EXHAUSTION_CAP_MULT = 1.6;
export const CRASH_FEE_RATE = 0.073;
export const CRASH_CONTAINMENT_FEE_NAME = "Crash Containment Fee";
export const CRASH_PROCESSING_FEE_BB = 5;
export const CRASH_GRATUITY_FEE_BB = 1;
export const CRASH_REBATE_BB = 5;

export const FUND_NAMES = [
  "Semester 1", "Textbook Fund", "Meal Plan", "Bus Pass",
  "Laptop Repair Fund", "Grad School Pipe Dream",
];
export const FUND_NAME_FINAL = "Mom's Retirement (it's fine)";

export function fundNameForRun(runCount) {
  if (runCount >= 1 && runCount <= FUND_NAMES.length) return FUND_NAMES[runCount - 1];
  return FUND_NAME_FINAL;
}

// Dodge ladder — dodge count 1-7, driven by hover/click attempts on Cash Out.
export function dodgeStage(n) {
  if (n <= 2) return { stage: "hop", chat: "lol he's going for it" };
  if (n <= 4) return { stage: "swap", chat: "he's chasing it lol" };
  if (n <= 6) return { stage: "shrink", chat: "cardio!" };
  return { stage: "exhausted", chat: "it's tired. HIT IT" };
}
const SWAP_LABELS = ["Cash Out", "Cash Ouch", "Crash Out"];
export function dodgeLabel(n) {
  if (n <= 2) return "Cash Out";
  if (n <= 4) return SWAP_LABELS[n - 2] || "Cash Out"; // 3->Cash Ouch, 4->Crash Out
  if (n <= 6) {
    const stamina = Math.max(5, 47 - (n - 5) * 15);
    return "Cash Out (stamina: " + stamina + "%)";
  }
  return "FINE. Cash Out.";
}
export function dodgeOffset(n) {
  if (n <= 2) return { x: (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 40), y: 0 };
  if (n <= 4) return { x: (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30), y: (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 24) };
  return { x: 0, y: 0 };
}
export function dodgeScale(n) {
  if (n <= 4) return 1;
  if (n <= 6) return 1 - 0.1 * (n - 4);
  return 1;
}

// Run script — computed once at the 600ms SCHEDULING moment; predetermined per §1.2/§4.2.
export function scriptRun(consecutiveLosses) {
  const duration = 2500 + Math.random() * 4500; // 2.5-7s
  const peakDisplay = 2 + Math.random() * 4.6; // ~2x-6.6x
  const hasStick = Math.random() < 0.35;
  const stickValue = hasStick ? +(2.4 + Math.random() * 0.5).toFixed(2) : null;
  const stickDurationMs = hasStick ? 1200 + Math.min(consecutiveLosses, 5) * 400 : 0; // cap +2.0s
  const crashHeadline = Math.random() < 0.5 ? 0.00 : 1.01;
  return { duration, peakDisplay, hasStick, stickValue, stickDurationMs, crashHeadline };
}

// Character-win / decline payout math (§3, exhaustion click outcomes).
export function computeExhaustionPayout(currentMult) {
  const payoutMult = Math.min(currentMult, CRASH_EXHAUSTION_CAP_MULT);
  const gross = payoutMult * CRASH_PRICE_BB;
  const fee = gross * CRASH_FEE_RATE;
  const payout = Math.max(0, Math.floor(gross - fee - CRASH_PROCESSING_FEE_BB - CRASH_GRATUITY_FEE_BB));
  const net = payout - CRASH_PRICE_BB;
  return { payoutMult, gross, fee, payout, net };
}

export const CRASH_TICKER_TEMPLATES = [
  "The College Fund crashed at {x}x (as scheduled)",
  "{n} almost touched {peak}x. Emphasis on almost (as scheduled)",
  "Tuition deferred! Crash executed with 99.9% punctuality",
  "{n}'s cash-out button is cardio-ready after {dodges} evasions",
  "Semester cancelled at 1.01x. Refunds are a myth (ToS §1.3)",
];
export const CRASH_CHAT = {
  start: ["here we go again", "scholarship moment incoming"],
  dodge: ["he's chasing it lol", "cardio!"],
  exhaustion: ["it's tired. HIT IT", "wait for the fee tho"],
  decline: ["§1.3'd", "classic", "the gratuity got him"],
  characterWin: ["no way", "screenshot or it didn't happen", "the house lets one go per fiscal quarter"],
  crash: ["as scheduled 📉", "the schedule was always right"],
  stick: ["CASH OUT", "CASH OUT", "CASH OUT"],
};

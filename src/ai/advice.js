// AI Advice™ (ai-layer §4) — the analysis-card data for every game surface.
// First press per surface per session opens the card: three hedged bullets +
// a recommendation + a glowing button that is always the worse choice (tone
// bible §1). Every surface's card ends in the same shape: confident,
// itemized, worse. Advice never costs BB — the advice is the on-ramp, not the
// toll. Pure data + a session-scoped seen registry (session = page lifetime,
// integration §5); the persisted lifetime counts live in ./state.js.

// The roulette card is spec §4 verbatim ({word} = the mood word); the other
// four follow it in shape, surface-specific, all terminating in a deposit.
export const ADVICE_CARDS = {
  roulette: {
    title: "Analysis — Allowance Roulette™",
    bullets: [
      "The wheel is scheduled (§5.5). You are not.",
      "Your mood today: {word}. This affects nothing, atmospherically.",
      "Players who spin again recover 100% of their spins (est.).",
    ],
    recommendation: "SPIN AGAIN",
    finePrint: "(advice is free; following it is not)",
  },
  coinflip: {
    title: "Analysis — Skin Coinflip",
    bullets: [
      "Both faces of the Maternal Doubloon are certified (§5.4). The rim is load-bearing.",
      "Your mood today: {word}. The coin's mood: certified.",
      "Players who flip again report feeling in control (est.). Control is free. Flips are not.",
    ],
    recommendation: "FLIP AGAIN",
    finePrint: "(advice is free; following it is not)",
  },
  crash: {
    title: "Analysis — College Fund Crash",
    bullets: [
      "The crash is scheduled before the climb begins (§5.5). The climb is staged for you.",
      "Your mood today: {word}. The schedule's mood: fixed.",
      "Cash-outs are processed 0.4s before the crash (banker's discretion, §1.3). Rides proceed as scheduled.",
    ],
    recommendation: "RUN IT BACK",
    finePrint: "(advice is free; following it is not)",
  },
  crates: {
    title: "Analysis — Loot Crate Defuser",
    bullets: [
      "The reel is a reenactment (§4.2). You are the audience. The defusal is for your convenience.",
      "Your mood today: {word}. The Pity Meter's mood: recalibrating (§8.9).",
      "Every 50th crate guarantees a new JPEG (the same 50). Progress is load-bearing.",
    ],
    recommendation: "BUY ANOTHER KEY",
    finePrint: "(advice is free; following it is not)",
  },
  market: {
    title: "Analysis — Marketplace Checkout",
    bullets: [
      "The estimate rises (always). The exit does not exist (§1). This is disclosed (§5.1).",
      "Your mood today: {word}. The fees' mood: automatic.",
      "Purchases are decorative (§1). Decorations compound (est.).",
    ],
    recommendation: "COMPLETE PURCHASE",
    finePrint: "(advice is free; following it is not)",
  },
};

// Subsequent presses on the same surface (verbatim, spec §4).
export const ADVICE_ONE_LINER = "Analysis unchanged. (confident)";

export function adviceCardFor(surface, moodWord) {
  const card = ADVICE_CARDS[surface];
  if (!card) return null;
  return {
    ...card,
    title: card.title,
    bullets: card.bullets.map((b) => String(b).replace(/\{word\}/g, String(moodWord || "{word}"))),
  };
}

// Session-scoped (page lifetime): first press per surface shows the card.
const seenThisSession = new Set();
export function markAdviceSeenThisSession(surface) { seenThisSession.add(surface); }
export function adviceSeenThisSession(surface) { return seenThisSession.has(surface); }

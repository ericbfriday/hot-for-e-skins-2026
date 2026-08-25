// Live chat — persona decks, keyword funnel, and copy tables.
// Canon: docs/spec/live-chat.md. Chat owns the personas, the timing, and the room.

export const SCROLLBACK_MAX = 50;
export const FADE_MS = 90000; // §1: entries fade toward ~2% contrast after 90s
export const ARCHIVE_MS = 180000; // §1: collapse into the ledger line at 3 minutes
export const ARCHIVE_LINE = "— chat history archived to the treehouse ledger (§10.2) —";

export const CADENCE_BASE_MIN_MS = 4500;
export const CADENCE_BASE_MAX_MS = 8000;
export const CADENCE_PRESSURE_MIN_MS = 2000;
export const CADENCE_PRESSURE_MAX_MS = 3500;

export const QUIET_WINDOW_MIN_MS = 8000;
export const QUIET_WINDOW_MAX_MS = 12000;
export const QUIET_WINDOW_LINES = ["who?", "bot lobby"];

export const WHALE_NAME = "Timmy_Second_Mortgage";
export const WHALE_LINES = [
  "mom said one more deposit and we're evicted. anyway. mom's max time",
  "sold my retainer. orthodontist says i'm 'a lost cause' (the skin says otherwise)",
  "the landlord is a fan of the site now. small world",
  "grandma's house is in escrow. MY escrow. it's basically an investment",
];

export const CONSCIENCE_NAME = "definitely_your_conscience";
export const CONSCIENCE_STICK_LINE = "take it… take it…";
export const CONSCIENCE_TOO_LATE_LINE = "too late";

// §2 — ambient persona pool. Weights sum to 95; the whale is a fixed 5% slot handled separately.
export const ARCHETYPES = [
  {
    key: "hype", weight: 30, color: "#ffd54a",
    deck: ["LETS GOOOO", "W RARE", "KEYS KEY KEYS", "he's HIM", "CLIP IT"],
  },
  {
    key: "shill", weight: 15, color: "#8fd97a",
    deck: [
      "just pulled the Fruit Roll-Up AGAIN (3rd today)",
      "turned 8 BB into a down payment (screenshot pending)",
      "site is fair, i win constantly",
    ],
  },
  {
    key: "doomer", weight: 10, color: "#8a7a9a",
    deck: ["the schedule is real. accept it.", "as scheduled 📉", "depositing just delays the schedule"],
  },
  {
    key: "bailout", weight: 10, color: "#e8c9ac",
    deck: ["anyone lend 8 bb i'm due", "spot me one spin (will repay in esteem)"],
  },
  {
    key: "newmark", weight: 10, color: "#cfe4ff",
    deck: ["is this legit?", "how do i withdraw?", "what's a mood"],
  },
  {
    key: "moodanalyst", weight: 10, color: "#e2a2ff",
    deck: [
      "admin woke up Vindictive today",
      "the pity meter reset at 49 for a REASON",
      "HFES-10 never dips. ever. think about it",
    ],
  },
  {
    key: "bot", weight: 10, color: "#a9705a", snakeCase: true,
    deck: ["same", "yes", "i am having fun"],
  },
];
export const ARCHETYPE_TOTAL_WEIGHT = ARCHETYPES.reduce((a, b) => a + b.weight, 0) + 5; // +5 for the whale

export const MOOD_CHATTER = {
  Vindictive: ["mood is Vindictive, rate is cooked", "blackout day. nobody convert."],
  Petty: ["rate is never good twice. suspicious (§8.9)", "mood is Petty. tell your friends not to convert."],
  Noncommittal: ["mood is Noncommittal. the admin shrugged."],
  "Benevolent-ish": ["Generous tomorrow? the admin said maybe (he didn't)"],
  Generous: ["GENEROUS DAY GET IN", "mom coupon day!!!"],
};

export const QUICK_PHRASES = [
  { key: "w", label: "W", text: "W" },
  { key: "l", label: "L (me)", text: "L (me)" },
  { key: "withdraw", label: "how withdraw?", text: "how withdraw?" },
  { key: "rigged", label: "is this rigged?", text: "is this rigged?" },
  { key: "mom", label: "MOM", text: "MOM" },
];

export const RATE_LIMIT_WINDOW_MS = 10000;
export const RATE_LIMIT_BASE_S = 10;
export const GRATUITY_EVERY_N = 10;
export const GRATUITY_BB = 1;
export const GRATUITY_LINE = "Chat Gratuity — 1 BB — customary, not required, automatically applied.";
export const GRATUITY_WAIVED_LINE = "waived (nothing to take) — §1.3";
export const FLOOD_LINE_TEMPLATE = "You're typing faster than you're depositing. Cooldown: {s}s (§8.9).";
export const FLOOD_FINE_PRINT = "Rate limits protect the chat from enthusiasm.";
export const COOLDOWN_CLICK_LINE = "cooldown, king";
export const NO_EDIT_LINE = "Messages are permanent (they aren't) (§10.2).";
export const WHISPER_NOT_REPLYABLE_LINE = "MOM has whispers disabled (she's busy).";

export const MOM_WHISPER_DECK = {
  idle: "I notice you're not depositing. I notice everything. ❤",
  abandoned: "You left something in your cart. My heart.",
  refill: "I knew you had it in you.",
  momsMax: "That's my special kid.",
  momKeyword: "Tell her I said hi. And also the code is MOM.",
};

export const TIMEOUT_REASONS = {
  truth: "truth (§5.3)",
  vibe3: "Tier 3 vibe violation",
  minor: "asking for a minor",
  redundant: "redundant (already disclosed in fine print)",
};
export const TIMEOUT_DURATION_MS = 60000;
export const TIMEOUT_AMBIENT_LINES = ["he got Chad'd", "F"];
export const REDACTION_LINE = "[deleted — misinformation: the reel is a reenactment (§4.2), which is different]";
export const WIN_DELETE_LINE = "[deleted by MOD — fake (yours specifically)]";
export const WIN_BREATHE_LINES = ["W", "no way"];

export const MINOR_ESCALATION = [
  "you must be 18+ to ask that (§1.2)",
  "final warning: asking for a minor is a Tier 3 vibe violation",
];

export const RAIN_LINE = "🌧️ RAIN INCOMING";
export const RAIN_THANKS = "ty admin!!";
export const RAIN_INELIGIBLE_LINE = "You were eligible for 0.0s of rain (rounded down, §8.9).";
export const RAIN_KEYWORD_LINE = "Rain is region-locked (your region: no)";

export const DEFAULT_NONRESPONSE = {
  who_asked: "who asked",
  win_misread: "W",
  pity: "same",
};

export const ONLINE_TOOLTIP = "{n} online. 1 is you. The rest are the house (§1.1).";

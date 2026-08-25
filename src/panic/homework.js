// MOM'S HOME — the Homework disguise (panic-button.md §2). Pure logic, no
// React, no timers: App owns the clock, this owns the fiction. The essay is a
// Google-Docs-style document with a generated title, a live-ticking word count
// that creeps upward while hidden (return after an hour to a 2,300-word essay),
// a pre-populated grade, and no way out — "This document cannot be saved,
// downloaded, or recovered (ToS §1.3)." The homework is itself a fake win:
// effort that can never be cashed out.

// ---- state keys (localStorage; everything the panic surface persists) --------
export const PANIC_DISGUISE_KEY = "hfes_panic_disguise"; // the flag that survives tab close
export const PANIC_PRESSES_KEY = "hfes_panic_presses";   // { day, count } — suspicion ladder, per calendar day
export const PANIC_HINT_KEY = "hfes_panic_esc_hint";     // single-tap ESC tooltip seen once, thereafter silence
export const PANIC_FORFEIT_KEY = "hfes_panic_forfeit";   // in-flight round killed by tab close, ruled next session

export const HUSH_GRATUITY_BB = 1;
// 0.48 words/sec ≈ 29/min: a mid-draft start (~550) lands at ~2,280 words
// after an hour — "Return after an hour to a 2,300-word essay."
export const WORDS_PER_SEC = 0.48;

// ---- canonical copy (panic-button.md §8, verbatim) ---------------------------
export const ESC_TOOLTIP = "Panicking? Triple-tap.";
export const CRATE_ESC_ANSWER = "The crate cannot be closed. (unskippable)";
export const ESSAY_EXPORT_LINE = "This document cannot be saved, downloaded, or recovered (ToS §1.3).";
export const RUNG2_MARGIN_COMMENT = "This is the third essay on mitochondria this week. See me.";
export const SUSPICION_TOAST = "Mom is suspicious of how much homework you do. (So are we. §12.0)";
export const RESTORE_LABEL_GONE = "Close (she's gone)";
export const RESTORE_LABEL_KNOWS = "Close (she knows)";
export const MOOD_FOOTNOTE = "Mood drifts at the daily boundary (§8.9). Claims of intraday drift are a load-bearing feature of our marketing.";
export const MOOD_CROSSED_LINE = "For once, we weren't lying.";
export const HUSH_LINE = "Maternal Gratuity (Hush) — 1 BB — customary, not required, automatically applied.";
export const HUSH_WAIVED_LINE = "Maternal Gratuity (Hush) — waived (nothing to take) — §1.3.";
export const RG_TAGLINE = "Player Protection, Perfected™ — hides all gambling activity in 0.2 seconds.";
export const PROVABLY_MOM_CHAT = { user: "PROVABLY_MOM", msg: "I can see the homework from here. Deposit responsibly.", color: "#ff9ad5" };

// ---- the subject salad (§2: two-part template titles; never the same
// subject twice in a row per session — the generator knows what a rut looks like)
const SUBJECTS = {
  Biology: {
    partA: [
      "Photosynthesis and Why It Matters", "The Mitochondria", "Osmosis in Potato Slices",
      "Cell Division (Mitosis)", "The Food Chain of My Backyard", "Why Plants Are Green (Probably)",
      "The Heart and Where Blood Goes", "DNA: The Blueprint of Me",
    ],
    partB: [
      "A Look Inside Leaves", "Powerhouse and Beyond", "A Lab Report I Mostly Did",
      "Causes and Effects", "An Investigation", "What I Learned", "Evidence and Conclusions",
      "A Closer Look",
    ],
    paragraphs: [
      "Photosynthesis is when plants make their own food using sunlight, water, and a chemical called chlorophyll, which is also why they are green. This is important because without plants there would be no oxygen and also no vegetables, which some people would say is a win but scientifically it is not.",
      "The mitochondria is known as the powerhouse of the cell. This is because it makes ATP, which is energy the cell can spend, kind of like an allowance but smaller. My teacher says everyone forgets this on the test but I will not, because I have now written it down twice.",
      "In conclusion, cells are very small but they are working hard the whole time, even when you are not doing anything, which is something to think about. Further research is needed but not by me.",
    ],
  },
  History: {
    partA: [
      "Manifest Destiny and the Louisiana Purchase", "The Oregon Trail", "Causes of the War of 1812",
      "The Industrial Revolution", "Ancient Rome and Its Roads", "The Cold War",
      "The Silk Road", "The Great Depression and the New Deal",
    ],
    partB: [
      "Causes and Effects", "Who Actually Made It", "A Timeline of Events",
      "and Other Things That Happened", "What I Think Happened", "A Deeper Analysis",
      "Lessons for Today",
    ],
    paragraphs: [
      "The Louisiana Purchase was when the United States bought a huge amount of land from France even though France did not really own all of it, which history calls diplomacy. This led to Manifest Destiny, which was the idea that the country was destined to stretch from sea to sea, an idea the country had about itself, for itself.",
      "Many pioneers traveled the Oregon Trail, and most of them walked beside the wagon instead of in it, which they do not show in the game. Dysentery was a leading cause of death, which is also not in the game, because some history is too sad for a floppy disk.",
      "In conclusion, history is basically one long chain of causes and effects, and if you understand one cause you can guess the effect, unless there is a war, in which case there are at least three more causes you did not write down.",
    ],
  },
  English: {
    partA: [
      "Theme of Birds in To Kill a Mockingbird", "Symbolism of the Green Light in The Great Gatsby",
      "Romeo and Juliet", "The Outsiders and Outsider-ness", "Lord of the Flies",
      "Character Arc of Lennie in Of Mice and Men", "The Unreliable Narrator",
    ],
    partB: [
      "A Literary Analysis", "Whose Fault Was It (Essay)", "Why the Book Was Better",
      "An Analysis in Three Paragraphs", "A Close Reading", "Themes and Motifs",
      "What the Author Meant (Probably)",
    ],
    paragraphs: [
      "Throughout the novel, birds function as a symbol of innocence, which is why it is a sin to kill a mockingbird, because mockingbirds do not do anything to anybody and just make music for everyone, unlike the other characters, who are constantly doing things to everybody.",
      "The green light at the end of Daisy's dock represents Gatsby's hopes for the future, which is ironic because the light is just a light and the future does not happen for him. The author uses this irony on purpose, which is called craft.",
      "In conclusion, the book means more than it lets on, and the birds know it. If I had written the ending it would have been different, but that is not what literary analysis is.",
    ],
  },
};
const SUBJECT_NAMES = Object.keys(SUBJECTS);

export const TEACHERS = [
  { name: "Henderson", honorific: "Ms." },
  { name: "Okafor", honorific: "Mr." },
  { name: "Protsenko", honorific: "Ms." },
  { name: "Gutierrez", honorific: "Mr." },
];
export const GRADE_COMMENT = "Solid work, chase that thesis!";
export const GRADE_SCORE = "87/100";

export function teacherDisplay(teacher) {
  const t = TEACHERS.find((x) => x.name === teacher) || TEACHERS[0];
  return t.honorific + " " + t.name;
}

export function gradeLabel(teacher) {
  return "Graded: " + GRADE_SCORE + " — \"" + GRADE_COMMENT + "\" — " + teacherDisplay(teacher);
}

// ---- deterministic filler (same seed family as mood/identity/catalog) ---------
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

// The creeping tail of the essay: deterministic given (seed, count), so the
// disguise rehydrates across tab close into the same growing document.
const GROWTH_PHRASES = [
  "furthermore", "in addition", "as previously stated", "which is important",
  "the evidence suggests", "according to the textbook", "in conclusion",
  "many scientists agree", "this proves that", "it is clear that", "for example",
  "as we can see", "overall", "another key point", "this matters because",
  "in my opinion", "some people say", "but they are wrong", "to summarize",
  "ultimately", "as stated above", "the data shows", "which cannot be ignored",
  "and so on", "in the grand scheme of things", "arguably", "on the other hand",
  "nevertheless", "it goes without saying", "this supports my thesis",
  "the results are conclusive", "more research is needed", "as shown in figure 1",
  "which I will discuss later", "to reiterate", "in summary",
];

export function growthParagraphs(seed, wordCount) {
  const rng = mulberry32(hashString("panic-essay#" + seed));
  // generate to an exact word budget: the chip's number is the real number of
  // words on the page (Mom might count; the house doesn't cheat at homework)
  const words = [];
  let total = 0;
  while (total < wordCount) {
    const phrase = GROWTH_PHRASES[Math.floor(rng() * GROWTH_PHRASES.length)];
    const parts = phrase.split(" ");
    for (const w of parts) {
      if (total >= wordCount) break;
      words.push(w);
      total++;
    }
  }
  // chunk into paragraphs of 55–85 words so the tail looks written, not pasted
  const paras = [];
  let idx = 0;
  while (idx < words.length) {
    const size = Math.min(words.length - idx, 55 + Math.floor(rng() * 31));
    paras.push(words.slice(idx, idx + size).join(" ").replace(/([.?!]?)$/, "."));
    idx += size;
  }
  return paras;
}

// ---- the disguise object -----------------------------------------------------
// prevSubject: per-session avoid-rut rule — never the same subject twice in a
// row. rand is injectable for tests; App passes Math.random.
export function generateDisguise(prevSubject, rand = Math.random) {
  let pool = SUBJECT_NAMES.filter((s) => s !== prevSubject);
  if (pool.length === 0) pool = SUBJECT_NAMES;
  const subject = pool[Math.floor(rand() * pool.length)];
  const bank = SUBJECTS[subject];
  const a = bank.partA[Math.floor(rand() * bank.partA.length)];
  const b = bank.partB[Math.floor(rand() * bank.partB.length)];
  const connector = rand() < 0.5 ? ": " : (rand() < 0.5 ? " — " : ", ");
  const teacher = TEACHERS[Math.floor(rand() * TEACHERS.length)].name;
  return {
    subject,
    title: a + connector + b,
    teacher,
    seed: String(Math.floor(rand() * 1e9)),
  };
}

export function essayParagraphs(subject) {
  const bank = SUBJECTS[subject] || SUBJECTS.Biology;
  return bank.paragraphs.slice();
}

export function staticWordCount(subject) {
  return essayParagraphs(subject).join(" ").split(/\s+/).filter(Boolean).length;
}

export function startingWordCount(rand = Math.random) {
  return 400 + Math.floor(rand() * 301); // mid-draft: 400–700 words
}

export function wordCountAt(startWords, hiddenAt, now = Date.now()) {
  const elapsed = Math.max(0, now - hiddenAt);
  return startWords + Math.floor((elapsed / 1000) * WORDS_PER_SEC);
}

// ---- the suspicion ladder (§3): rungs reset at the daily boundary, same seed
// family as the mood word — suspicion, like mood, is a daily property.
export function rungFor(presses) {
  if (presses >= 3) return 3;
  if (presses === 2) return 2;
  return presses <= 0 ? 0 : 1;
}

export function restoreLabelFor(rung) {
  return rung >= 3 ? RESTORE_LABEL_KNOWS : RESTORE_LABEL_GONE;
}

// ---- tab-swap chrome (§2) ----------------------------------------------------
export function docTitleFor(subject, draftNo) {
  return "Homework — " + subject + " Essay (draft " + draftNo + ") - Google Docs";
}

// A doc icon (Google-Docs-ish): white page, folded corner, blue lines.
export const FAVICON_DOC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f1f3f4'/%3E%3Cpath d='M8 3h12l6 6v20H8z' fill='%23ffffff' stroke='%23dadce0'/%3E%3Cpath d='M20 3v6h6z' fill='%23e8eaed' stroke='%23dadce0'/%3E%3Cg stroke='%234285f4' stroke-width='2'%3E%3Cline x1='12' y1='14' x2='22' y2='14'/%3E%3Cline x1='12' y1='18' x2='24' y2='18'/%3E%3Cline x1='12' y1='22' x2='20' y2='22'/%3E%3C/g%3E%3C/svg%3E";

// ---- the forfeit (§5): "The house ruled your abandoned College Fund Crash a
// forfeit (§4.1 Quickscope clause)." Timers die with the tab; the ruling lands
// next session.
export const SURFACE_DISPLAY = {
  crash: "College Fund Crash",
  roulette: "Allowance Roulette",
  coinflip: "Skin Coinflip",
  crates: "Loot Crate Defuser",
};

export function forfeitLineFor(surface) {
  return "The house ruled your abandoned " + (SURFACE_DISPLAY[surface] || "round") + " a forfeit (§4.1 Quickscope clause).";
}

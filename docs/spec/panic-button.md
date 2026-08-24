# MOM'S HOME panic button — brainstorm resolution

Resolves [#14](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/14) on the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Decision-complete; implementation tickets should cut mechanically from this.

## Thesis

The panic button is the site's only frictionless exit — and it's frictionless *on purpose*, because hiding is not leaving. Depress the research inversion (dark-patterns.md §4.7: refill friction asymmetry weaponized): deposits are one click, quitting is a labyrinth, and the one thing that works instantly is the thing that conceals the site from Mom while the session — and the burn-down — continues. The house doesn't fear Mom. Mom takes a cut.

Secondary target: the boss key. Classic productivity-gag hardware, resurrected here as a "Responsible Gaming" flagship nobody asked to be honest.

## Decisions

### 1. Trigger

- **Keep the button.** Bottom-right, pulsing red, `MOM'S HOME` in Bangers. The loudest element on the page is the one pretending to be discreet — don't fix that.
- **Add triple-tap ESC** (three presses within 1.5s) as the hands-free trigger. Triple-tap is a deliberate panic cadence: single ESC is a modal reflex, triple is commitment. It is also — pointedly — the fastest reliable gesture the site offers, documented as **ToS §12.0 (Emergency Maternal Protocol)**.
- **Single-tap ESC does nothing** except a 2.6s tooltip: *"Panicking? Triple-tap."* First use only, thereafter silence.
- **Contrast joke (required):** pressing ESC during a crate opening answers *"The crate cannot be closed. (unskippable)"* — you can't skip the crate, but Mom skips everything.
- No mobile hotkey; the button suffices.

### 2. The disguise surface: the Homework disguise

Retire the Wikipedia linear-equations page (suspicious on second viewing: why is this child reading about coefficients with no scrollbar use?). Replace with a **Google-Docs-style essay document**:

- **Generated plausible title** from a two-part school-subject template salad, e.g.:
  - *"Photosynthesis and Why It Matters: A Look Inside Leaves"*
  - *"The Mitochondria: Powerhouse and Beyond"*
  - *"Manifest Destiny and the Louisiana Purchase: Causes and Effects"*
  - *"Theme of Birds in To Kill a Mockingbird: A Literary Analysis"*
  Subject pools: biology, history, English. Never the same subject twice in a row per session (the generator knows what a rut looks like).
- **Live-ticking word count** starting mid-draft (400–700 words) and creeping upward every few seconds while hidden. Return after an hour to a 2,300-word essay. Export is unavailable: *"This document cannot be saved, downloaded, or recovered (ToS §1.3)."* The homework is itself a fake win — effort that can never be cashed out.
- **Grade populated in the toolbar:** `Graded: 87/100 — "Solid work, chase that thesis!" — Ms. Henderson` (teacher name from a pool; Henderson, Okafor, Protsenko, Gutierrez).
- **Tab swap:** document title becomes `Homework — Biology Essay (draft 3) - Google Docs`, favicon becomes a doc icon. Restores on reveal.
- Serif UI, off-white page, one column, plausible margin clutter. No game pixels anywhere — the underlying site gets fully replaced, not blurred.

### 3. Suspicion ladder

Escalates on press-count per calendar day:

| Rung | Presses | Behavior |
|---|---|---|
| 1 | 1 | Clean essay. |
| 2 | 2 | Essay + a red teacher margin comment: *"This is the third essay on mitochondria this week. See me."* |
| 3 | 3+ | Rung 2 + on restore, the suspicion toast fires: *"Mom is suspicious of how much homework you do. (So are we. §12.0)"* — and the restore button label changes from **"Close (she's gone)"** to **"Close (she knows)"**. |

Rungs reset at the daily boundary (same seed as the mood word — suspicion, like mood, is a daily property of the universe).

### 4. Audio

- **Instant, total kill on trigger.** Hard-kills every sound including anything queued. This is the site's one honest safety feature and it stays honest.
- **Audio restores automatically on reveal**, at prior volume, unasked: *"Audio restored automatically. The house insists."* Ambient casino audio is a retention feature; of course it comes back on.

### 5. State & restore semantics

| Thing | While hidden | On restore |
|---|---|---|
| BB balance / gamertag | Persist (localStorage, untouched canon) | Minus the Hush Gratuity (below) |
| In-flight round (crash, roulette, crate) | **Keeps running and loses.** The server does not pause for your personal problems. (There is no server. The timeouts literally keep running.) | Result surfaces in the welcome-back modal |
| Ticker / chat | Keep accumulating, timestamped | Backlog visible as "what you missed," newest first |
| Mood word | Unchanged (deterministic daily seed) | See modal, below |
| Disguise flag | **Persists across tab close.** Panic, slam the laptop shut, reopen later → the site opens as homework until "Close (she's gone)" | Reveals site + welcome-back modal |
| Round in flight at tab close | Timers die with the tab | Round ruled a forfeit, house wins by default: *"The house ruled your abandoned College Fund Crash a forfeit (§4.1 Quickscope clause)."* |

**Hush Gratuity:** 1 BB, deducted on every restore, itemized on the panic receipt: *"Maternal Gratuity (Hush) — 1 BB — customary, not required, automatically applied."* Floored at 0 BB; if the balance is already 0: *"waived (nothing to take) — §1.3."* It's the dormancy fee wearing an apron. It does not touch the locked conversion fee lineup (#2); it is a separate, maternal levy.

### 6. The welcome-back modal

Fires on every reveal (button or reload):

- Headline: **"Welcome back, {gamertag}."**
- Body, always: *"While you were studying, the server admin's mood changed."*
- Expansion: **"show today's mood word"** → reveals the actual word.
  - Same word as before hide (the usual case — the mood is a deterministic daily seed and *cannot* change intraday): footnote *"Mood drifts at the daily boundary (§8.9). Claims of intraday drift are a load-bearing feature of our marketing."*
  - Hide crossed midnight (possible via the persisted disguise flag): the word genuinely changed → *"For once, we weren't lying."*
- **Panic receipt**, itemized:
  - `Maternal Gratuity (Hush) — 1 BB`
  - Round results, if any: *"Your College Fund Crash kept running. It crashed at 1.01x while you were studying. Cash-out was evaded 0 times (you weren't here to try)."*
  - Missed ticker summary: *"While you were gone, definitely_not_a_bot won a Karambit. This is your fault."*
- Dismiss: **"Resume losing"**.

## Relationship to Responsible Gaming parody

MOM'S HOME is marketed in-site as the flagship Responsible Gaming™ feature: **"Player Protection, Perfected™ — hides all gambling activity in 0.2 seconds."** The joke: real self-exclusion tools are buried five menus deep and reverse-UX'd into uselessness, while the one protection tool with instant, reliable, zero-friction access protects you from Mom, not from the site.

**Constraint for the future RG ticket** (map fog, now sharpening): any genuine RG-parody control must take strictly more interactions than the panic trigger — deposit: 1 click; panic: 1 click / 3 taps; self-exclusion: ≥4 clicks ending in "Have you tried asking Mom?" (consistent with the refund flow, dark-patterns.md §3.1). The click-count asymmetry *is* the satire; measure it in the implementation.

## Copy inventory (canonical strings)

- ToS §12.0: *"(Emergency Maternal Protocol): In the event of maternal proximity, triple-tap ESC. This is the only three-tap sequence the site takes seriously."*
- ESC tooltip: *"Panicking? Triple-tap."*
- Crate + ESC: *"The crate cannot be closed. (unskippable)"*
- Essay export: *"This document cannot be saved, downloaded, or recovered (ToS §1.3)."*
- Rung-2 margin comment: *"This is the third essay on mitochondria this week. See me."*
- Suspicion toast: *"Mom is suspicious of how much homework you do. (So are we. §12.0)"*
- Restore labels: *"Close (she's gone)"* → rung 3: *"Close (she knows)"*
- Audio: *"Audio restored automatically. The house insists."*
- Modal: *"Welcome back, {gamertag}."* / *"While you were studying, the server admin's mood changed."* / dismiss: *"Resume losing."*
- Hush line: *"Maternal Gratuity (Hush) — 1 BB — customary, not required, automatically applied."*
- Forfeit: *"The house ruled your abandoned College Fund Crash a forfeit (§4.1 Quickscope clause)."*
- Optional new chat line: `{user:"PROVABLY_MOM", msg:"I can see the homework from here. Deposit responsibly."}`

## Non-goals

- No evidence wipe / balance confiscation beyond the 1 BB Hush Gratuity — persistence of balance and gamertag is standing canon (#1), and Mom confiscating the whole balance would end the burn-down the house is owed.
- No multi-surface disguise suite (grade portal, slideshow) — the suspicion ladder escalates *copy*, not surface count. One surface, three rungs.
- No spec'ing of the broader RG parody here; this doc only fixes the click-count constraint above.

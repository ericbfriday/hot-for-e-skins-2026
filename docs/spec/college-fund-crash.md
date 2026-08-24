# College Fund Crash — locked spec

Resolution for [issue #7](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/7). Decision-complete; implementation tickets cut mechanically from this. Costs per the locked economy ([#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2)): **15 BB per run**; Maternal Starter Grant 150 BB; failed-spend copy verbatim; house always wins.

Parody targets from the dark-pattern catalogue ([#4](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/4)): near-miss reels (2.1), the cash-out mirage (3.2), buy-button label swaps (3.1), fake streak social proof (1.2), loss-leaders (4.5), rakeback (4.2).

## 1. Run lifecycle

1. **Entry**: `Start Run (15 BB)` spends 15 BB via the standard spend path (failed spend → verbatim insufficient copy; 3rd+ failure escalates verbatim).
2. **Scheduling gag**: 600ms `SCHEDULING…` interstitial: "Crash scheduled. Provably fair. (Schedule not disclosed, ToS §2.4.)" The run's full script — duration, peak, near-miss window, cash-out behavior — is predetermined at this moment. "As scheduled" is literal.
3. **Climb**: multiplier climbs from 1.00x at ~0.8x/s for a scripted 2.5–7s (displayed peaks ~2x–6.6x).
4. **Crash headline**: always **0.00x or 1.01x** (coin flip) — the designed insult, regardless of the displayed peak. The discontinuity is canon: "the displayed multiplier is nostalgic, not contractual (ToS §8.9)." Result panel: "CRASHED at {1.01|0.00}x (as scheduled). Peak display: {peak}x. The peak display was decorative."
5. **Between rounds**: interstitial (§6).

## 2. Near-miss plateau ("the stick")

- **35% of runs** script a plateau in the **2.4x–2.9x band** (never 3x+ — "the house doesn't tease amounts it can't shame you about").
- Choreography at the stick: multiplier freezes and *trembles* for 1.2s at exactly 2.4x (or up to 2.9x); the cash-out button briefly turns green, grows 20%, label "NOW would be good"; chat erupts "CASH OUT CASH OUT CASH OUT".
- The stick always releases; the run always ends 0.00x/1.01x. Post-crash copy: "You had {2.40–2.90}x. Everyone saw it. (Playback not available, ToS §1.3.)"
- **Streak escalation**: each consecutive crash in the session adds +0.4s to stick duration (cap +2.0s). At 3+ consecutive crashes, fake chatter `definitely_your_conscience` types "take it… take it…" during the stick, then "too late" after the crash.

## 3. Cash-out evasion choreography (the exhaustion gag)

Escalation ladder, driven by dodge count (hover or click attempts on the button):

| Dodges | Behavior |
|---|---|
| 1–2 | Horizontal hop ±30–70px (current behavior). Chat: "lol he's going for it" |
| 3–4 | Vertical hop + label swap per hover: "Cash Out" → "Cash Ouch" → "Crash Out" (exit-path button swap, mirroring FTC-Epic's buy-button confusion) |
| 5–6 | Button shrinks 10% per dodge; fake stamina readout in label: "Cash Out (stamina: 47%)" |
| 7 | **Exhaustion**: button stops dodging, turns green, label "FINE. Cash Out." — the one clickable moment |

- Dodge counter is per-run; resets each run ("the button recovers between runs; it's professional").
- The schedule never allows the exhaustion moment during a near-miss stick (sticks happen on no-exhaustion scripts), so exhaustion cash-outs always occur below 1.6x. **House invariant: no crash run ever nets more than +1 BB.**

### Exhaustion click outcomes

- **First exhaustion-click per session (page lifetime) — the scripted win**: intercepted 400ms "PROCESSING CASH-OUT…", then succeeds. Payout = peak × 15 BB minus the fee lineup, itemized on a receipt: Crash Containment Fee 7.3%, Pre-Crash Processing Fee 5 BB, Maternal Gratuity 1 BB ("customary, not required, automatically applied"), §8.9 rounding (down). At the 1.6x cap: 24 − 1.75 − 5 − 1 − rounding = **16 BB (net +1 BB)**. At 1.2x: net −5 BB — most "wins" still lose money. Receipt footer: "Withdrawable balance: $0.00 (unchanged). One (1) character-building win per session (ToS §2.4)." Ticker: "{gamertag} DEFEATED THE HOUSE (net: +1 BB, house retains dignity)". Reloading to farm it is legal and worthless (the cap guarantees it).
- **Every subsequent exhaustion-click**: same 400ms "PROCESSING…", then the run crashes anyway at the current display: "Cash-out received 0.4s before the crash. Processing… declined (banker's discretion, ToS §1.3)." Button relabels "Cash Out (unavailable until you calm down)".

## 4. College-fund framing — the fund name ladder

Each run's panel header: "RUN #{n} — {fund name}". Ladder auto-escalates with session run count:

1. Semester 1 → 2. Textbook Fund → 3. Meal Plan → 4. Bus Pass → 5. Laptop Repair Fund → 6. Grad School Pipe Dream → 7+ (fixed): "Mom's Retirement (it's fine)".

On crash: "{fund name} fully liquidated (as scheduled)." On the character win: "{fund name} survives with {net} BB. Use it wisely (you won't)."

## 5. Spectator theater copy decks

Feeds tickets [#10 ticker](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/10) / [#11 chat](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/11); crash owns these lines:

- **Ticker (one per crash, rotate)**: "The College Fund crashed at {x}x (as scheduled)" · "{gamertag} almost touched {peak}x. Emphasis on almost (as scheduled)" · "Tuition deferred! Crash executed with 99.9% punctuality" · "{gamertag}'s cash-out button is cardio-ready after {n} evasions" · "Semester cancelled at 1.01x. Refunds are a myth (ToS §1.3)"
- **Chat**: run start — "here we go again", "scholarship moment incoming"; on dodge — "he's chasing it lol", "cardio!"; on exhaustion — "it's tired. HIT IT", "wait for the fee tho"; on decline — "§1.3'd", "classic", "the gratuity got him"; on character win — "no way", "screenshot or it didn't happen", "the house lets one go per fiscal quarter"; on crash — "as scheduled 📉", "the schedule was always right".

## 6. Between-round interstitial (loss chasing)

- Primary button: **Run It Back (15 BB)** — big, glowing, adjacent. Secondary: **ExpressCashout™** — permanently disabled, label "ExpressCashout™ (eta: {today's mood word})", click shows "Pending since you arrived (ToS §1.3)." (cash-out mirage; mood-word tie-in from #2).
- After 2 consecutive crashes: add copy "Crashes come in threes. This is a fact we made up."
- After every 3rd consecutive crash: **Consolation Rebate** — 5 BB auto-credited, receipt line "Consolation Rebate (non-stackable, non-withdrawable, non-consoling)". Deliberately useless alone: 5 BB can't buy a 15 BB run. Ticker: "Consolation issued. You're {15−balance} BB from another run. So close." (rakeback/drip-feed gag aimed at Ask-Mom).
- Below 15 BB: "Run It Back" disables as "Run It Back (need 15 BB, have {x})" and **swaps into** "Ask Mom (15 BB away)" → deposit flow. Proactive nag below 6 BB unchanged (#2).
- Burn-down sanity: fresh grant fully committed to crash dies in ~11 runs (~4–6 min) counting rebates (+5 at runs 3/6/9) — matches the ~5-minute first-refill target.

## 7. State scope

- Balance persists (localStorage, existing). Crash streak, dodge counts, fund-ladder position, and character-win-used are **session-scoped** (page lifetime) — reload resets the theater but never the balance. The house remembers the money, not the feelings.

## 8. New ToS canon

- **§2.4 (Scheduling)**: "All outcomes are scheduled in advance for your convenience. Everyone wins once. It builds character."

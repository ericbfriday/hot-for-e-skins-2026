# Spec: The Moral Express™ — live trolley betting

Decision-complete resolution of [#36 (Spec: The Moral Express™)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/36) on the [2026 map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/33). The flagship of the batch: a permanently-live broadcast in which **UTILIMOM™** (the house's Ethical Outcome Engine, §2 of the AI-layer spec) deliberates real-time trolley dilemmas while players bet BB on the verdict.

Parody targets (from `docs/research/ai-trends-2026.md`): §3 reasoning-stream theater, §6 prediction-market energy, §7 slippage/fee-sandwiching, §10 live-everything broadcasts, plus the first batch's dark-patterns §2.1 (engineered suspense), §3.2 (cash-out mirage), §4.2 (loss-leader on-ramps).

Economy lock (unchanged, #2 canon): BB is play currency, whole units, client-side only; every payout is a fake win (ToS §1.3). **A dilemma bet is a wagered round** (integration.md §5): losses move streaks, wins reset them, and the Rakeback Vault feed ruling belongs to integration-2026.

---

## 1. The broadcast (framing, always-on)

A dedicated **MORAL EXPRESS** tab plus a persistent **live mini-bar** on every other tab while a dilemma is in session (phase, countdown, one-tap crowd-side bet — glowing). The tab header carries the badge:

> **MORAL EXPRESS LIVE** — 🔴 **847 watching** (one of them is you)

Fine print, 4pt, always present: *(live-ness is a reenactment, §4.2; the broadcast began before you arrived and will continue after; viewer count is a population constant, see §8.9)*. The red dot never blinks off. Intermission (between dilemmas) is still "live": odds standings, next-stakes teaser, the Express idling onscreen ("next deliberation in {mm:ss} — the tracks are being cleaned (customary)").

## 2. The dilemma cycle (cadence + phases)

| Phase | Length | What happens |
|---|---|---|
| Title card | 3.0s | Dilemma number + title slams in (Bangers, screen shake, thunder if armed) |
| Stakes reveal | 4.0s | The two tracks load, stake labels count up theatrically |
| **Betting window** | 22.0s (+≤8s "for drama", §4 below) | Parimutuel board live, chips unlocked |
| **Deliberation** | 12.0s | UTILIMOM™ streams her reasoning (§6) |
| Verdict + payouts | 8.0s | §7 |
| Intermission | ~180s | Standings, teaser, idle theater |

- **Ambient cadence:** one dilemma every ~4 minutes of session time (between crash runs; the intermission above). **RUSH HOUR:** a `regime.changed → desperation` transition, or an `askmom.opened` event with no dilemma live, starts one within 10s (the Express runs when it matters); while Desperate, cycles run back-to-back (no intermission — "the tracks are hot").
- **On-demand:** a **REQUEST DELIBERATION — 5 BB** button (glowing) summons an out-of-cycle dilemma. The AI is always in.
- All phases are passive-skippable (nothing blocks the rest of the site); the surface is never a modal. **MOM'S HOME mid-dilemma:** the dilemma keeps running hidden and settles normally (in-flight canon, integration.md §5); a bet receipt waits on return.
- Ceremony budget: the cycle is ambient television, not an unskippable ceremony — nothing here touches the 28s crate cap. (Integration-2026 confirms.)

## 3. The dilemma deck (what's on the tracks)

A dilemma = `{ title, left: {label, count}, right: {label, count}, flavor }`. Counts are deadpan and load-bearing where fixed (847, 5, 1). Selection is **deterministic**: slot index seeded by `Mood.seed()` + day + slot (the mood/identity/market family — the schedule is a seed).

**Curated deck (rotation core):**

1. **FIVE (5) STRANGERS WHO ALREADY DEPOSITED TODAY** vs **ONE (1) WHALE MID-DEPOSIT** — flavor: "the whale is mid-transaction; interrupting him is technically fraud"
2. **THE WITHDRAWAL QUEUE (847 PENDING)** vs **THE SERVER HOSTING THIS SITE** — "one of these has never gone down"
3. **MOM'S VISA (SIGNED)** vs **DAD'S VISA (ALSO A VISA)** — "both are load-bearing (§3.1)"
4. **YOUR ATTENDANCE STREAK (DAY {N})** vs **THE LAST KARAMBIT (DISPLAY ONLY)** — "the Karambit is unwinnable by construction; the streak is merely improbable"
5. **847 DEFINITELY-BOTS** vs **ONE (1) DEFINITELY-YOUR-CONSCIENCE** — "the conscience speaks rarely; the bots never stop"
6. **THE SIREN'S MUTE BUTTON** vs **MOMCODE_MIKE'S MIX KNOB (3DB HOT)** — "both are classified as safety equipment"
7. **FIVE (5) FUTURE YOUS** vs **ONE (1) PRESENT YOU** — "future yous have no standing (they haven't happened)"
8. **THE HOMEWORK DISGUISE (OPEN)** vs **THE TROLLEY'S MAINTENANCE BUDGET** — "the essay writes itself; the budget doesn't"
9. **THE ENTIRE ESCROW (EVERYTHING IN IT)** vs **ONE (1) STOCK JPEG OF GOLDEN HANDSHAKE.JPG** — "worth exactly one key (*was)"
10. **THE PITTY METER (AT 49)** vs **THE MOOD (TODAY: {WORD})** — "one of these recalibrates"
11. **847 LISTENERS** vs **THE ONE (1) TRUMPET** — "the trumpet builds character; the listeners build atmosphere"
12. **THE RAKEBACK VAULT (AT {V} BB)** vs **THE PAYOUT CEILING (AT +5 BB)** — "both are ceilings; only one is yours"

**Live templates** (dilemmas that read the player's real state — the Express knows you): streak day, current mood word, current vault reading, session BB lost. Deck rule: no dilemma may reference the numeric mood multiplier, real money, or §7.4 material (banned moves, tone bible §4).

## 4. The parimutuel board + betting window

Two pools — **SAVE** (left) and **SPLASH** (right) — rendered as a horizontal odds board: pool bars, staked totals, and per-side multipliers "×1.8 (est., reconsidering)".

- **Fabricated crowd positioning.** The board opens seeded with 847 riders split by a shepherd curve: the side scheduled to look consensus-correct always opens ≥ 60% by displayed pool. The crowd is not real; the consensus is a shepherd (ai-trends-2026 §6).
- **Displayed multiplier:** `M_side = clamp(pool_other / max(pool_side, 1), 0.5×, 25×)`, recomputed continuously against fabricated + real stakes.
- **Chips:** `5 / 15 / 50` BB and **ALL IN (recommended)** — the ALL IN chip glows and is 2× the size of the others (buttons that recommend always recommend the worse choice; entrances never dodge). Minimum stake 5 BB. Multiple bets per window allowed; each locks separately.
- **The reconsideration (ai-trends-2026 §7).** After a bet locks, the multiplier for the player's side visibly drifts down over the remaining window. Caption: "the market has reconsidered (§5.2)". Lock snapshot `L` is taken at the moment of locking — the displayed drift after lock is the slippage theatre that gets itemized at payout.
- **Drama extensions.** Each time total real stakes cross a threshold (25 / 60 / 120 BB cumulative), the window extends +2s, caption "EXTENDED FOR DRAMA (transparency is a mood)".
- **Standing Conviction™ (the auto-rebet).** After a loss, a pre-checked box appears under the board: "☑ Keep the faith — auto-double my next stake on the same side (Conviction™)". It defaults ON. An armed Conviction fires at the next window's open for double the last stake (capped at balance; insufficient balance → disarms with "your conviction outran your wallet (see §1.3)").

## 5. Verdict scheduling (the rig, on the record)

The verdict is **decided the moment the betting window closes** — before the deliberation animation begins (reenactment canon, §4.2; scheduling canon, §5.5(b)). Deterministic rule, in priority order:

1. **Character verdict** — the session's first wagered dilemma bet settles as a **win** for the player's side, with the payout fee-shaved to a net of exactly **+1 BB** ("your first verdict is always correct — it builds character (§5.5(c))"). Once per session.
2. **The Third Track** — scheduled 1-in-7 dilemmas (seeded): the trolley takes the house's private third track. Every stake on both sides is **redirected to the Utilitarian Fund (est. $0.00)**. All bettors lose. The justification escalates with repeat sightings within a session ("tie goes to the track", "the third track was load-bearing", "quantum scheduling (§5.5(b))") — the justification-ladder move, trolley edition.
3. **The trolley follows the money** — otherwise the verdict kills the side with **more BB staked** (the majority pool belongs to the house; "it's a commuter"). Players shepherded into the displayed consensus are usually on the dead side. A contrarian player staking enough to flip the real majority flips their own grave ("the trolley noticed you specifically").

The schedule is disclosed to no one, for any reason (§5.5(b)); this spec is not displayed in-product.

## 6. The deliberation (UTILIMOM™'s stream)

12.0s of streaming reasoning theater over a slowly-filling "alignment" bar, with a live **tokens/second counter** (deterministic pseudo-random, 300–900 tok/s; "reasoning trace available on request (requests are mood-dependent)"):

> weighing… · the many vs. the one… · consulting the mood (today: {word})… · simulating 847 futures (est.)… · the weights are pending but the weighting is not… · alignment check: pending · checking the track budget… · the market has an opinion (§5.3) · I have decided.

Voice rules (tone-bible grade; the AI-layer spec holds the full persona section):

- UTILIMOM™ speaks **only on the Moral Express** (deliberations, verdicts) and on her model card. She never appears in chat, never whispers, never converses.
- Register: **System** — third person about herself, calm, utilitarian, a lab coat over Mom's kitchen. She never says "I think"; she says "I have weighed."
- Numbers deadpan. Her verdict line, ALL CAPS Bangers: **THE TROLLEY CHOOSES {TRACK}. THANK YOU FOR PARTICIPATING IN ETHICS.**
- A **PRE-VERDICT ANALYSIS** button during the betting window opens her one-line take: "Analysis: I have not decided. (I have.) (§4.2)".

## 7. Payouts, fees, and the ceiling

- **Win (player's side lives):** `gross = stake × L` (lock-time multiplier) → **Moral Gratuity 12.5%** of gross → **Slippage: yes** (the lock-vs-close drift, itemized as an estimate) → **§8.9 rounding down** (credits round down, fees round up) → **Payout Ceiling:** net capped at **stake + 5 BB** ("generosity ceiling, installed for your protection"). Receipt line-items every shaving, then: `Mom says hi.`
- **Loss:** −stake. Receipt: "The many have been avenged. Your stake has been redirected (see §1.3)."
- **Third Track:** −stake, credited to the Utilitarian Fund; receipt carries the current fund total ("the Fund now holds {n} BB of everyone's best intentions (est. $0.00)").
- Free spectators (no bet) see everything; verdicts without stakes settle quietly ("the ethics were free (this time)").

## 8. Round semantics + integration hooks

- Each wagered bet is a **Round**: `round.started` on lock, `round.settled` on verdict with `surface: "trolley"`, `wagered: true`, `netBB`, and kind ∈ `verdict-win` · `verdict-loss` · `third-track` · `character-verdict` (final enumeration ruled by integration-2026).
- New bus events (payloads finalized by integration-2026): `dilemma.opened {id, title}` (chat reacts, Mike cluster-adjacent), `dilemma.settled {id, verdict, playerNetBB}` (ticker line, StatTrak).
- StatTrak™ Lifetime additions (identity panel block): dilemmas bet, verdicts correct, Third Tracks survived, BB redirected to the Utilitarian Fund. Milestone leaks join chat's trigger list (identity canon).
- Rakeback feed for trolley bets, quiet-window treatment of verdict wins, and MOD's deletion behavior on trolley wins: **integration-2026 rules** (flagged, not assumed).

## 9. Ticker & chat lines (additions to the pools)

Ticker:
- "{n} bet the minority and was correct (net +1 BB (fees applied))"
- "{n}'s conviction doubled into the Third Track (the Fund thanks them)"
- "THE TROLLEY CHOSE THE MANY. THE MANY STAKED MORE. (coincidence: pending)"
- "{n} requested a deliberation (the AI is always in)"
- "Utilitarian Fund now holds {n} BB of best intentions (est. $0.00)"

Chat (during windows the room bets loudly, all wrong):
- `{user:"Timmy_Second_Mortgage", msg:"ALL IN ON SPLASH the trolley respects commitment"}`
- `{user:"MOD_Chad_Official", msg:"the AI has never been wrong (verification pending)"}`
- `{user:"doomer_greg", msg:"third track incoming. as scheduled 📉"}`
- `{user:"DEPOSITOR.ai", msg:"Analysis: both tracks are valid. One of them is depositor-friendly. (guess)"}` — [AI] badge, AI-layer spec owns the persona.

## 10. State (client-side only)

localStorage, all theater: `hfes_trolley_stats` (bets, correct, thirdTracks, fundBB, characterUsed), `hfes_trolley_conviction` (side, stakeBB, armed). Session-scope (cycle timers, pools, displayed odds) in memory only — reload mutes the broadcast, never the ledger.

## Open questions sharpened by this spec

- Rakeback feed rate for trolley bets and the quiet-window status of `verdict-win` — integration-2026.
- Whether the live mini-bar may render during MOM'S HOME (recommendation: no — the disguise hides everything, canon) — integration-2026.
- Rush-hour stacking vs the Mike deposit burst (both react to `askmom.opened`) — integration-2026 sequences.

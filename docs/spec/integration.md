# Integration pass — compose all surfaces

Resolution of [#18](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/18) on the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Decision-complete: this document composes the fourteen surface specs into one whole, assigns every shared mechanic a single home, and rules every flagged collision. Implementation tickets cut mechanically from this. It is the last word: where a surface spec disagrees with a ruling here, this document wins.

**Thesis, one line:** the site is one house with fourteen rooms, and the rooms must share a nervous system — one mood, one clock, one crowd, one vault, one band — because a con works best when every surface agrees with the others without ever agreeing to.

---

## 1. The spine (shared core: module homes)

Four pieces of infrastructure are consumed by many surfaces and owned by none. They live together in one shared core — **the spine** — and no surface spec may re-home them:

| Module | Owns | Canonical consumers |
|---|---|---|
| **Mood** | the deterministic daily seed, the five words, the multiplier, boundary events (§2) | economy, Ask-Mom, crash, roulette, ToS, identity (Compliance Filter), chat, panic, House Band |
| **Bus** | the game-event bus, all names/payloads (§3) | every surface |
| **Interruptible** | the can-I-interrupt registry (§4) | self-limit (reminder, reality check); providers: panic, crates, ToS, Ask-Mom |
| **HouseBand** | all audio, one engine (audio-gags §1; confirmed home: the spine) | every surface |
| **Constants** | shared numbers: `MIKE_HOT_DB = 3` (4 in Desperation), `POPULATION = 847`, `DESPERATION_TAGLINE`, pity/recalibration bands | ticker, chat, House Band |
| **regime state** | the single current regime variable (`normal` \| `desperation` \| `flood`); **ticker owns the rules**, spine stores the truth (§6) | ticker, chat, House Band, roulette banner |

Rules: the spine persists nothing except what its owning specs already persist (`hfes_muted` for the Band, mood date for Mood). The bus and regime state die with the tab, like the ticker. No surface reads another surface's localStorage — surfaces ride the bus (identity §9 rule, extended site-wide).

## 2. `getMoodWord()` — the mood module (home: spine; rules: economy)

The economy ticket (#2) locked the behavior; the spine is the home. Interface, final:

- `Mood.word(date?)` → one of the five words. **The only display-facing function.** Every mood-word string on the site renders through it.
- `Mood.multiplier(date?)` → the number in [0.5, 2.0]. Callable by exactly one consumer: the conversion receipt math (Ask-Mom §9). No surface may render, log, or sonify it (§8.9(b); audio non-goal).
- `Mood.seed(date?)` → the deterministic daily seed, shared by: the Compliance Filter's leetification rate (identity §3), the Suspicion ladder reset (panic §3), rain scheduling (chat §11), HFES-10/volatility/rollback (marketplace §11), the defuse/mood-stock families.
- `Mood.onChange(cb)` → fires at the local-midnight boundary and on session start (as `mood.changed`, §3).

Known consumers confirmed (five named in the mandate plus four discovered): economy rate, Ask-Mom receipts, crash ExpressCashout™ eta, roulette mood line, ToS §9.2 toast — plus identity's Compliance Filter, chat weather chatter, panic's welcome-back reveal, and the House Band's BED crossfade. One word, one home, one source.

## 3. The game-event bus (chat §13 is the seed; finalized here)

One in-memory bus, page lifetime, no replay for late subscribers, no persistence. `Bus.emit(name, payload)` / `Bus.on(name, fn)`. **The bus carries settled facts; theater with exactly one owner calls its module directly** (a receipt plays its own fee pops; a toast owns its own copy). Events are past-tense — the bus, like the site, only reports history that already went wrong.

| Event | Payload | Emitter | Consumers |
|---|---|---|---|
| `gate.accepted` | `{firstVisit}` | age gate | identity (assign tag), Band (gesture → welcome sting), ticker (join line, first visit), economy (grant toast, first visit) |
| `session.started` | `{returning}` | spine on load | ticker (seeds), chat (online counter), marketplace (Rollback check), retention (Comeback Key check), panic (persisted-disguise check), Mood |
| `mood.changed` | `{word, prev, crossedMidnight}` | Mood | Band (`setMood`), ticker (system line), chat (weather beat), Bonus OC void machinery, Mike controller (Mom Coupon day-flip cluster) |
| `bb.spent` / `bb.credited` | `{amount, reason}` | any surface spending/crediting | Band (polite debit / credit chime), ticker (Desperation arm check), StatTrak, chat (gratuity waiver at 0 BB) |
| `spend.failed` | `{surface, costBB, sessionFailures}` | any game | Ask-Mom (E3 persistent button; escalation copy is game-owned) |
| `round.started` | `{surface, roundId, priceBB, wagered}` | games | Band (sting), chat (crash canon), panic (in-flight registry) |
| `round.beat` | `{surface, roundId, beat}` — beat ∈ `stick` \| `dodge` \| `exhaustion` \| `drop` \| `recalibration` | games | chat (crash/coinflip spectator lines), Band (per-beat sounds) |
| `round.settled` | `{surface, roundId, wagered, priceBB, netBB, kind, itemAward?, nearMissItem?, streakAfter:{site, surface}}` | games | ticker (player line, laundering, re-attribution, styling), chat (quiet window, MOD deletion, pressure cadence, bot taunts, MOD loss nag), StatTrak, Rakeback Vault (§8), Attendance/Comeback clocks, loss-streak sequencer (§7), reality check (win kinds), marketplace (StatTrak™ counters on losses) |
| `round.forfeit` | `{surface, reason: 'panic'\|'tab-close'}` | panic | panic receipt, ticker (forfeit line), StatTrak (counts as a loss for streaks) |
| `askmom.opened` | `{source}` — source per ask-mom §16.5 | Ask-Mom | ticker (Mike 3-line burst), chat (first-open Mike line + pile-on), Chase-ribbon eval, Interruptible (provider on) |
| `askmom.abandoned` | `{}` | Ask-Mom | chat (guilt whisper + personas + MOD), ticker (stranger line, ≤30s) |
| `deposit.completed` | `{packageId, oc, bonusOc, usdFace, source, firstEver, whileExcluded}` | Ask-Mom | chat (eruption + MOD pin, package-scaled), ticker (deposit-triumph line, MOM proud line, Desperation exit + grace line §9), VIP ladder, StatTrak (`usdBorrowed`, first-refill milestone), One-Click counter, Turbo unlock (`firstEver`), self-limit ratchet, deposit-streak chip, Mom's Max extras (ToS `rearmConsentMeter()`, Mike respect line, tier toast), Band (success sting; Desperation-exit fanfare), identity milestone leaks |
| `withdrawal.created` | `{usdEst}` | games + marketplace | StatTrak (pending++), chat (first-withdrawal milestone), marketplace (escrow card) |
| `identity.assigned` | `{tag}` | identity | ticker (join line) |
| `identity.renamed` | `{kind}` | identity | chat (first-rename milestone) |
| `stats.milestone` | `{field, value}` | identity | chat (leak trigger list — owned there) |
| `regime.changed` | `{to, from}` | ticker (rules owner, §6) | Band (`setRegime`), chat (cadence), Mike controller, roulette banner sync |
| `mike.win` | `{class, k}` | Mike controller (§6) | ticker (render), chat (low-rate reaction), Band (stinger at `MIKE_HOT_DB`) |
| `panic.hidden` / `panic.revealed` | `{pressesToday}` / `{hiddenMs, missed}` | panic | Band (`killAll`/restore), ticker (backlog + doubled cadence), chat (backlog + room lines), panic receipt (Hush via `bb.spent`), self-limit (reminder backlog), Attendance/Comeback clocks (absence, §5) |
| `streak.died` | `{days}` | retention | ticker (obituary), chat, Mike controller (±30 min heater) |
| `streak.milestone` | `{days}` | retention | crates (matte upgrade, day 7), roulette (Mom Coupon, day 30), marketplace (Memorial rename, day 100) |
| `market.event` | `{kind, item, bb}` — kind ∈ `sold` \| `instant-sold` \| `rollback` \| `lowball` \| `listed` | marketplace | ticker (settlement lines), Band (register family), escrow |
| `limit.event` | `{kind, detail}` — per self-limit §6 table | self-limit | ticker (system lines), chat (MOD/shills/whispers, Mike house-sit burst), StatTrak |
| `rain.event` / `momweather.event` | `{recipients, bb}` | chat | chat lines, Band (thunder) |

`round.settled.kind` enumeration (site-wide vocabulary): `house-win` · `near-miss` · `junk-win` · `jackpot` · `legendary-win` · `edge` · `photo-finish` · `nibble` (break-even) · `character-win` · `crash-run` · `key-defused`. Win kinds (for quiet window, MOD deletion, reality check, fanfare): `junk-win`, `jackpot`, `legendary-win`, `character-win` — plus `nibble` is **not** a win for silence purposes (the crowd gathered; ticker has its own line).

## 4. The interruptible-state bus (ownership: spine registry; semantics: panic)

Self-limit's recommendation adopted with one refinement: the registry is spine infrastructure (like the Band), but its **semantics follow panic precedence** — MOM'S HOME outranks everything, exactly as P0 outranks the Band's queue.

- Providers publish `{surface, canInterrupt: bool}`: panic (disguise active → no), crates (ceremony in progress → no, unskippable), ToS (modal open → no, politely), Ask-Mom (flow open → no — *"a reminder must never interrupt a deposit"*). Everything else defaults yes.
- `Interruptible.canInterrupt()` is false if any provider says no.
- Consumers: the session reminder (defers → panic backlog) and the reality check (defers, then fires at the next interruptible moment; if none arrives within 30s it self-resolves as "handled for you" and increments `remindersHandledForYou`).
- Exempt from interruption rules entirely: MOM's whispers, deposit stings, the Siren, the BASS_DROP ("these are not interruptions; they are service").

## 5. Unified definitions (the dictionary every surface shares)

- **Round** — any settled play, wagered or free (free spins, Mom Keys, Comeback/Consolation Keys, house-sat fills).
- **Wagered round** — a round that spent ≥ 1 BB of the player's own balance. The only kind that counts for: the site loss streak, per-game streaks, the Rakeback Vault feeds, the Attendance Streak, and the Comeback Key clock. Free rounds move nothing but feelings.
- **Loss** — a wagered round with net BB < 0 (forfeits count). The break-even nibble is a loss for streak purposes (the house reads ties to itself); it is not a win for silence purposes.
- **Win (morale purposes)** — a wagered round awarding a fake win (`junk-win`, `jackpot`, `legendary-win`) or the `character-win`. Resets the site streak and the owning surface's ladder. Free-round fake wins reset only their own surface's ladder (roulette canon), never the site streak — *free wins don't count; the house keeps the books.*
- **Session** — page lifetime (crash §7 / crate §10 / coinflip §14 / ask-mom §2 canon, now universal). Reload resets all theater; balance, identity, and persisted counters never reset. Tab close kills in-flight rounds as forfeits. Multiple tabs: last-write-wins, *"the house allows it."*
- **Attendance day** — a local calendar day (midnight local, the same seed family as the mood) on which ≥ 1 **wagered** round settles. Day 1 is the age gate's first round.
- **MOM'S HOME time = absence** — disguise time counts as absence for the Attendance Streak (no credit) and toward the Comeback Key's 2h clock (retention canon), is deferral time for reminders, and is **not** absence for the mood (unchanged), the balance (Hush Gratuity on restore), or anything already running (in-flight rounds and deposit ceremonies keep running and complete hidden).
- **House-sit rounds** (exclusion fills) — count for the Attendance Streak and accrue Rakeback under the player's name (*the streak never asked who wagered them*); they never touch the player's loss streaks (the fill-in never loses), the ticker's player ratio (they are cast-scripted entries wearing gold, §9), or inventory (non-transferable, they're his).
- **One rounding doctrine** (harmonizing §8.9 citations site-wide): §8.9 rounds **down whatever is owed to you and therefore up whatever is owed by you** — one rule, two directions, zero exceptions. Conversion remainders round down (frozen §8.9(c)); game prices round up from 7.5 (economy canon); fees round up ("also for you", marketplace canon). Every existing citation stands.

## 6. One conductor: regimes, heaters, and Mike

- **Regime.** The ticker owns the rules (Desperation: arm at BB < 6, exit on refill completion, re-arm after 60s if still < 6; flood: Generous-day cadence ×0.6). The spine stores the current regime; every transition emits **one** `regime.changed`, consumed by the House Band (`setRegime`), chat cadence, and the roulette banner sync. Never three watchers; always one conductor.
- **Desperation tagline.** `everyone is winning except you*` (footnote `*estimated`) is **one string constant** (`DESPERATION_TAGLINE`, spine Constants), owned by the ticker. It renders in **at most one prominent slot at a time**: the roulette streak banner while the roulette tab is active, the ticker subtitle otherwise — never both. Roulette §4's escalation and ticker §8's subtitle were the same line written twice; the fix is one owner, one slot, no on-screen duplication.
- **Mike controller.** One scheduler, home: the chat module (chat §3 canon — *chat owns the choreography clock; the ticker renders*). Inputs: standing slot (one win per 10 ambient minutes), heater windows (retention §5: the first session until the first deposit; any BB < 6 window; ±30 min after `streak.died`), deposit-cluster (3-line burst on `askmom.opened`), and the 30–45s pre-pressure Mike cluster (chat §3). During a heater, cadence is **every ~90s**, superseding the standing slot (ruling on the ticker-vs-retention cadence clash: the heater is the event; the standing slot is the idle baseline; ticker §8's "every 5 minutes" figure is superseded — Desperation is always a heater). Every `mike.win` renders at `MIKE_HOT_DB` (+3 dB; +4 in Desperation) — one constant, one owner, consumed by ticker/chat stingers and the Band alike.

## 7. Loss-streak sequencing (crate 3-loss vs coinflip 7-loss vs everyone else)

Two independent streak counters, both fed by `round.settled`:

- **Site streak** — wagered-round losses across all games; **persisted** (identity `hfes_stats.lossStreak`; the welcome-back toast preserves it — canon). Drives: the Consolation Key™ (3rd consecutive, once per session), MOD's 5-loss nag, the chat "Consistent!" milestone (7, StatTrak), and pressure cadence.
- **Surface streaks** — per-game, session-scoped: roulette ladder (3/5/7/10), coinflip streak (bot taunts at 3/5/7; the 1 BB bot pity at 7, once per session), crash counter (rebate every 3rd, stick +0.4s per loss).

**Stacking order** (the anti-double-fire ruling): when one settlement triggers multiple consolations, all fire, in this order, never concurrently:

1. The surface's own ladder/taunt (the game's beat, inside its result theater);
2. The site-wide envelope (Consolation Key™ — envelope animations serialize; Comeback/Mom Keys queue behind it);
3. Social reactions (chat pressure, milestone leaks, ticker lines).

Caps are per-award: the Consolation Key is once per session regardless of later resets; the bot's 1 BB is once per session; roulette's ladder re-arms after each reset. The 7th consecutive coinflip loss that is also the site's 7th therefore pays the bot's 1 BB and the "Consistent!" leak — different awards, fixed order, no envelope collision (the Key fired at site-loss #3).

## 8. One Rakeback Vault, four feeds (owner: retention; state: spine-adjacent)

- **Single vault**, persisted fractional BB: `hfes_rakeback` `{bb, recalibrations}` — display-only fiction, one number site-wide.
- **Feeds** (on `round.settled`, wagered rounds only): coinflip +0.1 BB/flip · roulette +0.1 BB/spin (turbo, insured, and Chase It™ spins included — one spin is one spin) · crash +0.1 BB/run · crate key +0.2 BB/key (bundled keys feed per key; the decorative Bonus Key feeds nothing). Double-or-Nothing flips are 0 BB — not wagered rounds, no feed, no streak movement (a relabeling ceremony, not a round).
- **Recalibration**: at ≥ 99.9 BB the vault recalibrates to a random 1–37 BB (*mood improved! (§8.9)*) — the Pity Meter's move, rhymed on purpose. The 100 BB claim button stays permanently disabled (`keep losing! (encouragement)`); 100 is unreachable by construction.
- **Surfacing**: the canonical receipt line — `Rakeback accrued: {x} BB (vault: {y} / 100 BB) (claimable: see §1.3)` — on every **wagered-round receipt** (spin, flip, run, key; not conversions, not fees). The roulette tab's vault widget remains the featured display, rendering the same shared number.
- **House-sit rounds accrue** (under your name, to no avail). Free keys feed nothing.

## 9. Ticker/chat deck reconciliation

- **Ask-Mom §16.9 lines — adopted verbatim.** Ticker candidates enter the ticker's deposit-reaction pool; chat candidates enter the ambient decks, **except** `MOM [VIP HOST]: the mood is {word} today. deposit anyway`, which becomes a **whisper** (MOM does not speak in public chat — chat §3; the line survives, privately). `GrandmasCreditCard: who keeps charging $4.99 to this card` joins the ambient pool as a load-bearing regular.
- **Coinflip's reserved ticker slot — filled.** Coinflip §11's six lines are adopted verbatim into the pools; ambient coinflip templates (`{n} called {MOM|§8.9}. The coin disagreed (politely)`, etc.) join the mid/junk tiers. The `[BOT]` cast line rides the identity §9 entry shape.
- **Player-ratio rule, amended** (self-limit open question): *"the player appears exactly as often as their real session events — wagered rounds, forfeits, deposits — plus the fill-in's real (house-sat) record while excluded; ambient filler owns the clock."* House-sat lines are real in-fiction events wearing gold; they are not fabrications and do not break the ratio.
- **Grace line dedupe.** `{n} is back. The house missed {n} (financially).` has one owner — **the ticker** — and a 60-second cooldown, last-trigger-wins. A refill that completes while excluded (or within 60s before returning) suppresses the Desperation-exit grace line; the return's line renders alone. Break completion uses `nevermind` — unaffected.
- **Chat online baseline: 847.** Chat §1's `840 + floor(session BB lost / 10)` conflicts with ticker §10's load-bearing 847 (Winners-today suffix; marketplace's queue position 847 of 847). Ruling: the baseline is **847** — `847 + floor(session BB lost / 10)`, capped 999 — and `POPULATION = 847` joins spine Constants. The crowd is always 847 big; one is you.
- **Bot spelling.** Canonical: `AdminTradeBot_69` (identity §2.3, the reserved-cast registry, wins). The underscore variants in identity §8 and coinflip §1's preamble re-spell. The bot does not comment.

## 10. The final ToS section map

Frozen clauses stay verbatim; new clauses are append-only; Articles 1, 4, 8 never renumber. The complete map (F = frozen verbatim in tos-age-gate.md; A = adopted verbatim from the named spec; N = new copy below, canonized here):

| Article | Clause | Status |
|---|---|---|
| 1 | §1.1 Older Brother · §1.2 DOB · §1.3 Identity Verification | F |
| 2 | §2.1 Emotional Tender · §2.2 Banana Bucks · §2.3 Bonus Credits · **§2.4 Derived Denominations** · §2.5 One-Way · §2.6 Starter Grant | F — §2.4 untouched; crash's citations re-pointed to §5.5 |
| 3 | §3.1–§3.5 (Cardholder … Refill Packages) | F |
| 4 | §4.1 Dispute Resolution | F |
| 4 | **§4.2 Reenactments** | N (below) — roulette's asserted home, now real |
| 5 | §5.1 Provably Fair™ · §5.2 Odds · §5.3 The House | F |
| 5 | **§5.4 Edge Outcomes** | A — coinflip §15 verbatim |
| 5 | **§5.5 Scheduling & Character Building** | N (below) — crash's Scheduling, re-homed off frozen §2.4 |
| 6 | §6.1 Pending · §6.2 ExpressCashout | F |
| 7 | §7.1–§7.4 (Self-Exclusion … Honest Paragraph) | F |
| 8 | §8.1–§8.5 fees · §8.6 reserved · **§8.7 Rim Maintenance** · §8.8 reserved · §8.9 Currency Volatility | §8.7 N (below); rest F |
| 9–11 | as frozen | F |
| 12 | **§12.0 Emergency Maternal Protocol** | A — panic spec copy verbatim; the only zero-numbered clause, like the panic is the only instant exit |
| 12 | §12.1–§12.4 | F |

**§4.2 (Reenactments).** *All reels, wheels, coins, multipliers, progress bars, and replays are reenactments of outcomes decided before the animation began. The performance is staged for your convenience. Disputes concerning the outcome concern the outcome; disputes concerning the performance concern nothing (see §4.1). Near-misses are choreography, and the choreographer is on staff.*

**§5.5 (Scheduling & Character Building).** *(a) All outcomes are scheduled in advance for your convenience. (b) The schedule is disclosed to no one, for any reason. Disclosure is a mood. (c) Everyone wins once. It builds character.* — (a) and (c) are crash's proposed §2.4 body verbatim; all crash copy citing "§2.4" re-cites §5.5 (`SCHEDULING…` interstitial, the character-win receipt footer, the fund-ladder flavor).

**§8.7 (Rim Maintenance).** *Each flip bears a Rim Maintenance fee, compensating the house for certifying both faces of the Maternal Doubloon and, especially, the rim. The rim is load-bearing (see §5.4). Maintenance is customary, not required, and automatically applied.* — coinflip §10's receipt line gets its clause body.

Standing note: retention's "no new ToS clauses" constraint meant *retention mints none* — it cites §12.0, which panic provides. No conflict.

## 11. Ceremony budget vs the ~5-min burn window (confirmed)

The economy owns the burn (~25–35 BB/min mixed play → 150 BB in ~5–6 min; the < 6 BB nag lands a few losses before zero, ~4–5 min in). The composition confirms every ceremony fits inside it:

| Ceremony | Length | Notes |
|---|---|---|
| Coinflip | ~2.8s (+1.4s edge beat) | fastest drum in the band |
| Roulette | 5s (turbo 2.5s) | |
| Crash run | 600ms scheduling + 2.5–7s climb + interstitials | |
| Crate defuse | 15–28s, unskippable | the longest single unskippable beat on the site — cap holds |
| Ask-Mom #1 | ≤ ~45s, mashable to ~20s | the only long flow; runs while the balance sits at whatever it sits at |
| Ask-Mom #2 | ~15s (splash + 1-Click) | |
| Ask-Mom #3+ | seconds (hover-commit) | the pressure valve — repeat deposits never re-run ceremony |
| MOM'S HOME | 0.2s | hides everything, stops nothing |

Rulings: no surface may introduce an unskippable ceremony longer than the crate cap (28s); a panic mid-ceremony never lengthens it (timers complete hidden — canon, now site-wide); reality checks and reminders may never add net time (they defer or self-resolve, §4). First refill lands ~5–6 min; second and later land in seconds. Budget confirmed; One-Click confirmed as the only pressure valve needed.

## 12. Cross-surface sharpenings (from #16/#17, ruled)

1. **Interruptible-state bus** — spine registry, panic semantics (§4).
2. **Reality check vs quiet window** — sequencing ruled: the check fires first (≤ 2s after win settlement, covering the win); the quiet window's clock starts at the check modal's dismissal; `who?` lands 8–12s after dismissal. The two silences never overlap; the room waits for the interruption to finish ignoring you.
3. **Fill-ins vs player ratio** — amended ratio rule (§9).
4. **Grace-line dedupe** — ticker owns, 60s cooldown, last-wins (§9).
5. **StatTrak™ schema sign-off** — the six self-limit §5 fields are approved as additive `hfes_stats` extensions (identity schema); surfaced in the Identity panel block; their milestone leaks join chat's once-per-identity trigger list under `hfes_chat_flags`. `houseSatRecord.l` is structurally 0.
6. **Desperation while EXCLUDED** — both fire; the contradiction is the point (adopted). One harmonizing beat: while Desperate and Excluded, the tagline's footnote renders `*estimated (house-sat)` when a fill-in line is on screen. No other softening.
7. **Header composition** — final chip order: `[BB] [OC + "Top Up" (fused; Bonus sub-line)] [PORTFOLIO] [🔥 Attendance] [VIP tier] [STATUS]` … right cluster `[Mute] [gamertag]`. **STATUS is one shared slot**: `ON BREAK` or `EXCLUDED ({n}d) — play continues`, whichever is louder — EXCLUDED outranks (the break ends in 90 seconds anyway). The deposit-streak chip renders only until it sticks at 1/2 (day two), then retires into the tier chip's tooltip. Desperation is not a chip (the ticker owns its headline); suspicion is not a chip (the restore button owns its label).
8. **House Band home** — the spine, beside the mood module (audio's candidate confirmed).
9. **One Desperation conductor** — `regime.changed` (§6).
10. **The gesture chain** — the age-gate continue click is the Band's autoplay gesture, and the welcome sequence order is locked: (1) click → confetti + Band starts with the welcome sting; (2) grant toast (150 BB, §2.6) while confetti falls; (3) IDENTITY ASSIGNED reveal card in the modal (tag stamp thunk after the sting clears); (4) modal dismisses → site + ticker join line. Toasts and the card stack, never queue; the sting is the only sound.
11. **MOMCODE_MIKE's hotness** — `MIKE_HOT_DB = 3`, `+1 in Desperation` — one constant, spine-owned (§6).
12. **MOMCODE code field** — single owner confirmed: **the Ask-Mom flow** (a promo-code input on the package shelf), always-invalid, verbatim failure copy: `Code MOMCODE not recognized. Codes are mood-dependent. Today's mood: {word}.` Chat `/code` is **dropped** — chat's keyword funnel already handles `MOMCODE` (MOD's Tier 1 vibe line) and `MOM` (Mike's line); two rejection theaters for one code is one too many.

## 13. Contradiction sweep (rulings, numbered)

1. **Crash §2.4 vs frozen §2.4** — crash's Scheduling clause re-homes as §5.5; all crash citations re-point; CONTEXT.md's two stale cites updated. (§10)
2. **§4.2 had no home** — minted in Article 4 (Disputes), append-only; roulette/coinflip/crate fine-print cites now resolve. (§10)
3. **Desperation tagline written twice** (roulette §4 / ticker §8) — one constant, one owner, one prominent slot at a time. (§6)
4. **Grace line double-fire** — ticker owns; 60s cooldown; last-wins. (§9)
5. **MOM public line vs whisper-only canon** — ask-mom §16.9's MOM line becomes a whisper; all MOM speech is whispers/DMs, everywhere. (§9)
6. **Pity double-fire** (crate site-3 / coinflip-7 / roulette ladder) — two streak counters, fixed stacking order, per-award once-per-session caps. (§7)
7. **Rain vs Mom Weather™** — two weathers, both canon, deliberately rhymed: **Rain** (chat §11) is region-locked, 5 BB, personas only, never touches you; **Mom Weather™** (retention §6) is 1 BB on the lapsed and can touch you. They share thunder (Band) and never the same headline.
8. **840 vs 847** — chat baseline moves to 847; `POPULATION = 847` is a site constant. (§9)
9. **Mike cadence clash** (ticker: 5 min in Desperation; retention: 90s heaters) — heaters supersede standing slots; Desperation is always a heater; the 5-min figure retires. (§6)
10. **`Admin_TradeBot_69` vs `AdminTradeBot_69`** — the reserved-cast registry spelling wins; variants re-spell. (§9)
11. **§8.9 rounding "up" (prices/fees) vs "always down" (§8.9(c))** — one rounding doctrine (§5); no copy changes.
12. **Retention's "no new ToS clauses" vs new clauses from roulette/coinflip/crash/panic** — constraint is per-spec; retention cites §12.0. No conflict; noted.
13. **Idle nags at 45s (toast, BB < 6) and 60s (MOM whisper, BB < 15)** — both stand, sequenced by time and register (system toast first, whisper after); different speakers, no dedupe.
14. **Free-spin wins vs streak resets** — surface ladder resets, site streak does not (§5).
15. **House-sat rounds vs "wagered = player's BB"** — explicit exemption (§5): they feed attendance and the vault, never the player's streaks or inventory.

No other spec-pair interaction produced a real contradiction; every other crossing (Chase ribbon/Turbo unlock, panic-in-flight semantics, backlog caps, deposit-match-as-Bonus-OC, Break-vs-Comeback arithmetic) reconciles under existing canon unchanged.

## 14. New state inventory (complete)

| Key | Scope | Purpose |
|---|---|---|
| `hfes_rakeback` | persist | the one vault (§8) |
| `hfes_bus_*` | — | none; the bus is in-memory only |
| spine Constants/regime | in-memory | no storage |
| `hfes_stats` | persist | + six self-limit fields (§12.5), site `lossStreak` persists |

## 15. Fine-print rules (this surface)

1. One mood, one band, one crowd, one vault, one tagline — the house never tells two lies that disagree.
2. The bus reports history; it never predicts. The house does not plan, it schedules (§5.5).
3. Every surface is wired to the spine and to nothing else's storage.
4. A contradiction on screen is either a bug or the joke; the spine exists so it's always the joke.

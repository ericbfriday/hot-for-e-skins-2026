# Spec: Mom's Little Helper™ Pass — Season 1: The Road to Diamond Is Paved

Decision-complete resolution of [#40 (Spec: Mom's Little Helper™ Pass)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/40) on the [2026 map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/33). The seasonal battle pass: loss becomes progress so that stopping feels like quitting.

Parody targets (ai-trends-2026): §9 seasonal FOMO / battle pass, §12 parasocial retention (Mom's little helper is watching you improve (est.)). First-batch: dark-patterns §4.8 streaks-as-progress, §4.3 expiring-value pressure (inverted here — see §5).

Economy: the premium track costs **250 OC** (the custom-name price — the house has one price for identity-flavored vanity). Bus-only integration; retention state is untouched (map ruling); the pass keeps its own ledger.

---

## 1. Placement + framing

- A **PASS nav tab** (no header chip — the header composition is frozen, integration §12.7; the tab label carries a live micro progress bar instead). 
- Tab header: **MOM'S LITTLE HELPER™ PASS** · **SEASON 1: THE ROAD TO DIAMOND IS PAVED** · countdown "ends in 29d 23h".
- The panel is money-adjacent (premium costs OC): the §12.4 Reality strap renders pinned, verbatim canon.
- Mascot line, top of panel: "Mom's little helper is watching you improve (est.). ❤ — Management" (the ❤ is MOM's font; the helper borrows it, once).

## 2. XP — every loss is progress

- **1 XP per BB lost** on any wagered round (roulette, coinflip, crash, crate keys, foundry dreams, trolley bets — the wagered-round canon, integration.md §5). Forfeits count (they're losses). House-sat rounds do NOT (the fill-in's losses are not your curriculum).
- **Wins grant 0 XP**, with a one-per-session toast: "no progress (a win teaches nothing)". 
- Quests grant flat XP (§4). No other XP sources exist. XP never decays, never resets, and cannot be spent — it can only accrue, like regret.

## 3. Tiers — the Mom ladder

| Tier | XP | Reward (free track) |
|---|---|---|
| BRONZE MOM | 0 | Enrollment (automatic; enrollment is also mandatory) |
| SILVER MOM | 150 | **-0% fees coupon** (stacks with nothing; redeemable always; changes nothing) |
| GOLD MOM | 400 | **Priority withdrawal queue position: 847 of 847** (priority confirmed) |
| PLATINUM MOM | 900 | **One (1) exclusive Stock JPEG** — Clip Art of a Trophy (participation) — plus the right to skip one (1) ceremony (the right is 0 seconds long) |
| DIAMOND MOM | 1800 | **DIAMOND MOM status** — non-transferable, non-refundable, est. priceless (est. $0.00) |

Tier-ups fire `pass.milestone {tier}` → ticker line + MOD congratulation (chat). The pass panel's tier bar renders your XP with deadpan precision ("1,804 XP (keep going (there is nothing after this))").

## 4. Quests — drawn from the house's real events

**Daily** (reset at local midnight, the mood family): 
1. "Lose 25 BB today ({n}/25)" 
2. "Ask Mom (once is enough)" — completes on `deposit.completed` 
3. "Bet on one deliberation" 
4. "Dream one dream" 
5. "Check the chain (the chain won't move)" — completes on an explorer open.

**Seasonal** (once each, ever): 
1. "Survive a Third Track" 
2. "Get a win deleted by MOD (fake (yours specifically))" 
3. "Reach suspicion: 'Close (she knows)'" 
4. "Complete a Trade-Up Contract" 
5. "Redeem a Mom Coupon™ on a Generous day" 
6. "Receive 10 AI analyses (they conclude)".

Each pays flat XP (dailies 20, seasonals 100). Quest progress bars fill honestly — the quests are real, the rewards are XP, and XP buys the tiers of §3. The machine is sincere; the prizes are the house's.

## 5. The season (Season 1 of 1)

- The countdown **"ends in 29d 23h" resyncs to 29d** whenever it would reach zero ("lunar recalibration, §8.9" — the Key of the Month Club's clock, rhymed). 
- **Season 1 of 1**: there is no Season 2 ("Season 2 is mood-dependent"). Nothing expires, nothing is lost, the FOMO is purely architectural (ai-trends-2026 §9, inverted: the pressure of a deadline that never comes, forever).
- Progress persists across sessions (`hfes_pass`); the pass never resets — only attendance is ever at stake (attendance stays retention-owned, untouched).

## 6. The premium track

A two-column comparison (free ⇄ premium) with the premium column glowing:

- **Unlock: 250 OC** ("the premium track is premium"). 
- Premium rewards are **the same items, foil-bordered** via a CSS shimmer, suffixed "(Premium)": Clip Art of a Trophy (Participation) (Premium), DIAMOM status rendered as "DIAMOND MOM (Premium)" in slightly larger letters. 
- The comparison renders them side by side, identical, one shimmering. Fine print: "(shininess estimated; estimates are mood-dependent; the premium track is premium)". 
- Buying premium mid-season changes nothing retroactively, which is disclosed with unusual candor: "thank you for your support (of nothing in particular (§2.1))".

## 7. Ticker & chat lines (additions to the pools)

Ticker:
- "{n} reached GOLD MOM (the queue position is 847 of 847 (priority confirmed))"
- "{n} completed 'Ask Mom (once is enough)' (the helper is proud (est.))"
- "{n} is 20 XP from DIAMOND MOM (there is nothing after this)"
- "Season 1 ends in 29d 23h (lunar)"

Chat:
- `{user:"MOD_Chad_Official", msg:"{tag} hit {tier} MOM!! every loss counted!! (they really counted)"}` 
- `{user:"DEPOSITOR.ai", msg:"Analysis: your losses are converting at industry rate (100%). Keep going."}` 
- `{user:"Timmy_Second_Mortgage", msg:"diamond mom by friday. the road is paved and so am i"}`

## 8. State (client-side only)

localStorage: `hfes_pass` — `{xp, tier, premium, seasonSyncTs, daily: {day, quests: […]}, seasonal: […done]}`. Quest wiring is bus-consumer only (round.settled, deposit.completed, dilemma.settled, panic reveals for suspicion, marketplace events for Trade-Up, ai counters for analyses) — the pass reads events, never another surface's storage (spine rule).

## Open questions sharpened by this spec

- "Get a win deleted by MOD" needs a deletable signal: chat owns MOD deletions internally; ruling needed on a tiny `mod.deleted {tag}` bus event vs. a StatTrak counter — integration-2026 (recommendation: the event; deletions are settled facts, the bus's exact job).
- Suspicion-rung reachability as a quest condition (panic state is panic-owned; the pass must hear it on the bus) — integration-2026 (recommendation: extend `panic.revealed` payload with `rung`).

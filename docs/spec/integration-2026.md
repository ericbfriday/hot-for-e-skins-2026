# Integration pass 2026 — compose the new batch

Resolution of [#41](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/41) on the [2026 map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/33). Decision-complete: this document composes the five 2026 surface specs into the existing whole, rules every flagged collision, and mints the append-only ToS clauses. Implementation tickets cut mechanically from this. For this batch it is the last word: where a 2026 spec disagrees with a ruling here, this document wins. Against the sixteen original surfaces, `integration.md` remains the last word; nothing here amends it except by explicit extension ruling.

**Thesis, one line:** the relaunch added five rooms and two minds to one house — the rooms still share one nervous system, and the minds are furniture.

---

## 1. Module homes (the spine ships effectively unchanged)

| New module | Home | Notes |
|---|---|---|
| Moral Express engine/controller/panel | `src/trolley/` | Pure engine (deck, odds, scheduling, deliberation copy) + a controller owning cycle timers; the panel renders. **Reads regime; never writes it** (only `ticker/controller.js` calls `Regime.set()` — original invariant, extended). |
| AI layer | `src/ai/` | DEPOSITOR.ai decks + analysis cards + memo copy. UTILIMOM™'s deliberation copy lives in `src/trolley/` (her venue); her model card lives here with the AI furniture. |
| Foundry | `src/games/foundry.js` (+ dreamed-asset renderer in the crate surface) | A crate variant inside the existing games/crates idiom; the dream generator is pure + seeded. |
| SkinChain™ | `src/skinchain/` | Tiny: hash helper reuse + the explorer modal. |
| The Pass | `src/pass/` | State + quest engine (bus-consumer only) + panel. |

**The one spine edit:** `spine/identity.js` gains `DEPOSITOR.ai` in `RESERVED_CAST` (with the `[AI]` badge plumbing — the badge rides the existing reserved-cast entry shape, exactly as `[BOT]` does). No new spine modules, no new spine constants (`POPULATION`, `MIKE_HOT_DB`, `DESPERATION_TAGLINE` unchanged and still single-owner). Every other new number is surface-owned.

## 2. Bus events (additions to the canon table)

| Event | Payload | Emitter | Consumers |
|---|---|---|---|
| `dilemma.opened` | `{id, title}` | trolley controller | chat (room erupts, DEPOSITOR.ai analysis), pass (bet-quest), Mike cluster (adjacent, sequenced §6) |
| `dilemma.settled` | `{id, verdict: left\|right\|third-track, kind, playerStakeBB, playerNetBB, wagered}` | trolley controller | ticker (verdict lines), StatTrak (4 fields), pass (XP + Third-Track quest), retention clocks (absence semantics unchanged), vault (§4) |
| `pass.milestone` | `{tier}` | pass | ticker (tier line), chat (MOD congrats) |
| `mod.deleted` | `{tag}` | chat (MOD deletion path) | pass (seasonal quest), StatTrak (`winsDeleted` — promoted from internal to settled fact; deletions are history) |
| `panic.revealed` | **+`rung`** (0–3) | panic | pass (suspicion quest) — additive payload extension; existing consumers unchanged |

- Wagered trolley bets are **Rounds**: `round.started` on lock `{surface:"trolley", priceBB:stake}`; `round.settled` on verdict with the new kinds (§3). Spectator dilemmas (no bet) emit `dilemma.settled` only — never a round ("free ethics move nothing but feelings").
- Foundry dreams settle as `key-defused` with payload flag `dreamed: true` (kinds stay scarce; the foundry spec's recommendation adopted).
- AI Advice cards, memos, SkinChain tips/verifies, gas station: **emit nothing** — theater with exactly one owner calls its module directly (original rule, confirmed).

## 3. Round semantics for the new batch

- `verdict-loss` and `third-track` are **losses** (wagered, net < 0): site streak moves, surface ladder n/a (the trolley has Conviction™, not a ladder), pass pays 1 XP/BB.
- `verdict-win` is a **win kind** for silence purposes (the room gathers; quiet window applies) and resets the site streak — junk-win family.
- `character-verdict` is the trolley's character win: once per session, net exactly +1 BB, **carries the one (1) trumpet** (audio canon: shared by every surface, once per session — the trolley may not trumpet twice if crash already trumpeted; first character win of the session owns it, site-wide).
- Dream keys are keys: paid dreams are wagered rounds (`key-defused`, dreamed flag); the First Dream™, Consolation/Comeback/Mom-key dreams are free rounds — no streak, no vault feed, no pass XP ("free dreams move nothing but feelings").

## 4. Rakeback Vault feeds (ruling)

One addition to the canon feed table: **trolley bets +0.1 BB per wagered bet** (every outcome — one bet is one bet; a Third-Track stake feeds like any loss, because it is one). Dream keys feed **+0.2/key**, identical to crate keys (a key is a key; the electricity surcharge is theater, not rake). Recalibration, the 100 BB claim button, and the receipt-line canon are untouched.

## 5. Interruptible ledger (2026 additions)

- Providers publishing NO: foundry ceremony (unskippable, crate canon). 
- Everything new defaults YES: the trolley (ambient television — never a modal), the PASS panel, the model card, the explorer (dismissable receipts).
- Exempt (service, not interruption): memos, the deliberation's BASS-family sting (rides the Band at P3), Third-Track thunder (Band-owned).
- **MOM'S HOME:** hides the live mini-bar (the disguise hides everything — ruling from the moral-express spec, confirmed); a live dilemma **settles hidden** (in-flight canon) with the receipt waiting; Standing Conviction™ survives the disguise and arms for the next window; the pass panel is homework, now (the word count goes up).

## 6. Sequencing (stacking order, extended)

On `dilemma.settled` with a player stake, in order, never concurrently: (1) the verdict receipt (trolley theater); (2) the vault line + Consolation-Key envelope check (site ladder position — the envelope family keeps its canon slot); (3) the pass XP toast; (4) social reactions (ticker, chat, memos). 

- **Rush hour vs the Mike burst** (both triggered by `askmom.opened`): the Mike 3-line burst fires first (ticker/chat, ~15s), the rush dilemma's title card follows; different surfaces, no on-screen collision, no shared register.
- **Chat pile-on order** (final): personas → DEPOSITOR.ai (the analysis closes the mob) → MOD pin. 
- **Memo staggering:** never within 60s of a MOM whisper (different speakers may stack; the house staggers its love), never inside a quiet window, max one per 10 minutes.
- **Envelopes:** the First Dream™ queues **last** (behind Consolation/Comeback/Mom — envelope serialization canon, extended by one).

## 7. The ToS section map (append-only; Articles 1–12 as frozen in integration.md §10)

| Article | Clause | Status |
|---|---|---|
| 2 | **§2.7 Seasonal Entitlements** | N (below) — the pass |
| 5 | **§5.6 The Trolley** | N (below) |
| 6 | **§6.3 SkinChain™** | N (below) |
| 13 | **§13.1 UTILIMOM™ · §13.2 AI Advice · §13.3 Alignment · §13.4 Model Cards** | N (below) — the only new article; AI provisions close the document's back door |

**§2.7 (Seasonal Entitlements).** *Mom's Little Helper™ Pass entitles the holder to progress. Progress is denominated in losses and accrues at the house's pleasure. Seasons begin when the house says and end never (lunar). Premium tracks are premium (§2.1). Nothing acquired here may be converted, transferred, or regretted on the house's time.*

**§5.6 (The Trolley).** *(a) All verdicts are scheduled at the close of betting, for your convenience (§5.5(b)). (b) The trolley follows the money; the money is a commuter. (c) The third track exists, is load-bearing, and is taken as scheduled. (d) Winning payouts are bounded by the Payout Ceiling, installed for your protection. (e) The market is always right (§5.3), including retroactively.*

**§6.3 (SkinChain™).** *All balances, proceeds, and best intentions are recorded on SkinChain™ and await block one (§6.1). Block one is mood-dependent. Grief is not legal tender (§2.2). Explorers are a courtesy; courtesy is pending.*

**§13.1 (UTILIMOM™).** *The house's Ethical Outcome Engine renders verdicts that were scheduled before her deliberation began (§4.2). Her weights are pending, her alignment is pending, and her decisions are final (§5.3). UTILIMOM™ does not think; she has weighed.*

**§13.2 (AI Advice).** *All advice rendered by DEPOSITOR.ai is advisory. The advisor is decorative (§4.2). Analysis confidence is mood-dependent. Termination in a recommendation is the intended behavior of the product.*

**§13.3 (Alignment).** *The house aligns its models daily. Alignment is a mood (§8.9). Misalignment observed by players is correctable by deposit and by nothing else.*

**§13.4 (Model Cards).** *Every model card is the disclosure. Weights, benchmarks, and safety reviews are pending their own publication, which is a mood. The card is the benchmark.*

## 8. Ceremony budget vs the burn window (confirmed)

- Nothing new is an unskippable ceremony: the dilemma cycle is ambient (skippable television); the foundry obeys the crate ladder + 28s cap; REQUEST DELIBERATION is player-initiated (a spin, not an interruption).
- **Burn:** the trolley adds parallel burn at ambient cadence (~5–15 BB per ~4 min when ridden). The economy's ~5–6 min mixed-play window tightens with the Express in the mix; this is confirmed acceptable — the < 6 BB nag lands a few losses earlier for Express riders, and Desperation's rush hour is a heater by design (the trolley is the house's, and the house is warm).
- Reality checks/reminders: unchanged deferral rules (§5 ledger above); memos never add net time.

## 9. The relaunch greeting (ruled: rides the sweep)

Not its own ticket. In the implementation sweep: first session post-relaunch, one dismissable splash over the age gate's wake — 

> **HFES 2026: NOW WITH AI™** 
> *Under new management (same management). New: the Moral Express™, two (2) AIs (pending), the chain (pending), dreams (est.), and a pass (eternal). Old: everything else (§5.3).*

— plus one Band sting (P2, celebratory, brief) and the stamp `hfes_relaunch_seen`. It never repeats; the relaunch is a mood, and moods happen once (except when they don't, §8.9 — but this one did).

## 10. Collision sweep (rulings, numbered)

1. **Whisper vs Memo** — the Memo is canonized as the Whisper's sibling register (monospaced, clinical blue, pinned, never replyable; DEPOSITOR.ai only). `tone-bible.md` is untouched; **this section is its addendum** (the fifth register was minted by the document the tone bible defers to for composition).
2. **Reserved-cast color** — `#7fd4ff` (DEPOSITOR.ai) sits outside every existing persona color and the ticker palette; distinct from MOD's green and YOU_COLOR. Confirmed.
3. **One Pity Meter, three labels** — Defuser / DupeShield™ / DreamShield™ is one counter, one recalibration, one never-arriving 50 (foundry adds the label, not the meter).
4. **GPT-wash cap** — exactly three badges (ai-layer §7), enumerated and closed. No other surface may claim AI in big print; integration-2026 arbitrates any petition with "no."
5. **Quiet window** — `verdict-win` joins the win kinds; memos and DEPOSITOR.ai ambient lines respect the window; the deliberation itself is the Express's own theater (not chat's), unaffected.
6. **StatTrak schema (additive)** — `hfes_stats` gains: trolley fields (bets, correct, thirdTracks, fundBB), `aiAnalyses`, `chainChecks`, pass fields (xp, tier). Milestone leaks join chat's once-per-identity trigger list (identity canon, extended additively).
7. **Trolley vs free rounds** — spectator dilemmas emit `dilemma.settled` only; no round, no streak, no XP ("the ethics were free (this time)").
8. **Desperation rush hour vs the tagline** — rush cadence may run back-to-back dilemmas; the tagline stays ticker/roulette-banner owned; **the live mini-bar may never render the tagline** (one slot, existing owners).
9. **The one trumpet** — `character-verdict` and crash's character win share the site's single trumpet per session; first to settle owns it, the later one gets a receipt note ("the trumpet is out (it builds character regardless)").
10. **SkinChain hash family** — one FNV-1a helper, home `src/games/fairness.js` (canon home); the explorer, dream prompt receipts, and Provably Fair™ all call it. One hash family, one home.
11. **Dreamed assets at the exits** — Digital Asset class (dreamed): Instant Sell™ and listing reject per foundry §6; Trade-Up accepts five same-tier dreams → cheapest dream of the next tier. Marketplace canon otherwise untouched.
12. **`mod.deleted` minted**; `panic.revealed +rung` — payload extensions only; no existing consumer changes behavior.
13. **House-sit rounds and the pass** — house-sat fills pay no XP (the fill-in's losses are not your curriculum; retention canon, mirrored).
14. **Burn window** — confirmed with parallel trolley burn (§8); no economy numbers change.
15. **The relaunch splash** — §9: once, dismissable, over in one screen; never during the age gate itself (the gate is a ceremony; the splash follows its dismissal).

No other cross-spec interaction produced a real contradiction: envelope queue positions, memo staggering, and rush-hour sequencing reconcile under this document unchanged.

## 11. New state inventory (complete)

| Key | Scope | Purpose |
|---|---|---|
| `hfes_trolley_stats` | persist | bets, correct, thirdTracks, fundBB, characterUsed |
| `hfes_trolley_conviction` | persist | side, stakeBB, armed |
| `hfes_ai_flags` | persist | advice cards seen, memos sent, appeals filed |
| `hfes_foundry_dreams` / `_remixes` / `_firstfree` | persist | dream ledger + free-valve stamp |
| `hfes_skinchain` | persist | views, tips, verifies |
| `hfes_pass` | persist | xp, tier, premium, daily/seasonal quests, seasonSyncTs |
| `hfes_relaunch_seen` | persist | splash stamp (once ever) |
| cycle timers, pools, displayed odds, dream render state | in-memory | the theater dies with the tab, as ever |

## 12. Fine-print rules (this batch)

1. Two minds, one doctrine: the AIs agree, silently, and their agreement is total.
2. The badge is a fee with a font; the card is the benchmark; the schedule is disclosed to no one, including the card.
3. Every loss is progress, and progress is load-bearing.
4. The chain is a courtesy; courtesy is pending (§6.1).
5. The relaunch changed nothing, which is disclosed (§5.3), admired (est.), and pending (§8.9).

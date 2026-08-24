# Spec: Live-Wins ticker

Resolution spec for [#10](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/10). Decision-complete; implementation tickets cut mechanically from this. Adopts the identity interface contract ([identity §9](identity.md): entry shape `{ text, name, color, isYou }`, `{n}` templates, gold `(you)` convention, reserved-cast badges) and the panic-button backlog canon ([panic §5–6](panic-button.md)). Everything is client-side theater; the ticker persists nothing (§11).

Thesis, one line: **the Live-Wins ticker is a fabricated social-proof feed that reads your balance and tells you exactly the lie you're poorest enough to believe.** Every win in it is fiction; every figure is denominated slightly above whatever you have; your own losses are recycled into strangers' wins within the minute. The house does not lie in the fine print — it lies in the big print, loudly, with a timestamp.

Parody targets (dark-patterns catalogue): §1.1 owner-influencer wins (MOMCODE_MIKE's rigged calendar), §1.2 implausible winning streaks (UKGC's exact words), §4.5 loss-leaders (deposit-triumph lines), §3.2 cash-out mirage (`cashed out $0.00 successfully`).

## 1. Rendering model (adopts identity §9)

- Entry shape `{ text, name, color, isYou }` exactly per identity §9, plus **one ticker-owned additive field** `ts` (timestamp; set by the ticker, never by emitters).
- Render order: name first (bold, entry color), then text.
  - Player entries: name in gold `#ffd54a` + dim `(you)` suffix.
  - Ambient names: `generateTag()`, palette colors, collision-checked against the current feed.
  - Reserved cast: badge inline in the name string (`[OWNER] MOMCODE_MIKE`), cast colors per identity §2.3 (the chat-only `badge` field stays chat's).
  - System lines (no protagonist): no name, dim `#6a4a38` — e.g. `A key arrived from Mom (no return address)`, `Scheduled maintenance: 1 (one) item was never yours.`
- Player **fake wins** additionally get a border in the item's rarity color and an exclamation flourish. Settled stance, restated: losses presented as wins, fake wins presented as legendary.
- Timestamp: dim 8pt `HH:MM`, right-aligned (needed for the backlog, §9).
- Caps: **8 visible entries** (unchanged), backlog 30 (§9), line length ≤ 90 chars (2 sidebar lines max).
- `NAMES` and `WIN_TEMPLATES` in `App.jsx` are retired (identity §2 retired `NAMES` already): ambient names come from the generator; the surviving template copy migrates into the §4 grammar.

## 2. Ambient engine — cadence & distribution

- One jittered scheduler: next ambient entry in **5–10s**. Player-emitted entries (§5) jump the queue immediately and push the next ambient tick back **+6s** ("the house lets you read about yourself").
- Baseline draw per ambient slot:

| Tier | Share | Flavor |
|---|---|---|
| Junk wins | 50% | rakeback nibbles, Mom Coupons, badges, `deposited their lunch money and feels GREAT about it` |
| Mid wins | 30% | Mil-Spec/Classified items, 2–9x multipliers, 8–80 BB figures |
| Jackpot-class | 12% | Karambit, AWP \| Mom's Visa, Spork, Fruit Roll-Up, 47x+ |
| House/cast lines | 8% | MOD housekeeping, BOT acquisitions, `Server admin recalculated {n}'s balance based on mood` |

- **Mood tie-in** (the mood is the world's weather, same daily seed as the rate): **Generous days are a win flood** — cadence ×0.6, jackpot share 20%. Vindictive days are sparse and junky — cadence ×1.5, jackpot share 6%, every win sounds like a chore. A daily-boundary crossing mid-session emits one system line: `Server admin's mood is now {mood}. The ticker adjusts (§8.9).`
- **Idle call-outs**: after 45s with no player event, ambient lines may address the player in the loser role (checked against the anchor rule): `{stranger} is winning while {n} reads the ticker (clock's ticking)`.

## 3. The anchor rule (fabrications read your balance)

- Any ambient line citing a BB amount or multiplier draws its figure from `anchor = clamp(bb × uniform(1.1–1.6), floor 12)`, rounded to a plausible number. **Every win in the feed is slightly bigger than whatever you have.** At 0 BB the wins become small and attainable (`{stranger} won 14 BB (life-changing)`), which is the cruelest denomination of all.
- Silent by default — the figures just *happen* to exceed your balance. Explicit comparison is a Desperation Mode behavior only (1-in-5 ambient lines): `{stranger} won {bb} BB — more than {n} has (math checked)`.
- Bigger lies as the balance shrinks are carried by tier redistribution (§8) plus the anchor's collapsing floor — the poorer you are, the smaller and more attainable the lies, and the more jackpots they're sprinkled with.

## 4. Template grammar & evidence ladder

- Fields: `{n}` name · `{item}` · `{value}` est. value · `{bb}` · `{mult}` · `{mood}` · `{game}`.
- **One template pool serves both ambient and player lines**; `{n}` binds to a generated stranger (`isYou: false`) or the player tag (`isYou: true`) — uniformity is the joke (identity §7). Player lines may append veracity tags that are technically true: `(as scheduled)`, `(withdrawal pending)`, `(est.)`.
- Skeleton: `[NAME] [won | unboxed | cashed out | topped up | was 1 off | received] [THING] ([EVIDENCE])`.
- Pool sizes: jackpot 8 · mid 10 · junk 12 · house 6 · deposit-triumph 5 (canonical lines in §12).
- **Evidence ladder** — refusal scales with claim size:
  - junk: no citation
  - mid: `(screenshot available on request. requests are mood-dependent)`
  - jackpot: `(screenshot not available)`
  - Karambit / MOMCODE_MIKE: `(you had to be there)`
  - any figure over $10,000: `(video evidence exists. it really does. trust.)`
- Near-miss lines cite the surface's *actual* choreographed item (roulette: the adjacent jackpot; crate: Fruit Roll-Up; crash: the displayed peak). **The player can never nearly win the Karambit** — it appears on no reel. Only strangers nearly win it: `{stranger} was SO close to the Karambit (it remains close)`.
- Verbatim carryovers adopted from siblings: roulette §9 (its `You lost…` forms migrate to `{n}` third-person per identity §7), crash §5, crates §9, marketplace §9's rollback line.

## 5. Emit API — which events feed the ticker

One function, `emitTicker({text, name?, color?, isYou?})`; unset name/color default to a fresh ambient tag. Surfaces push; the ticker owns cadence, timestamps, caps, styling.

| Event (source) | Player line (gold, `{n}`-bound) | Ambient/cast side-effect |
|---|---|---|
| Age gate accepted (identity §1) | `{n} just joined the winners circle (est.)` | — |
| Roulette outcomes ×7 (roulette §9) | verbatim, migrated to `{n}` | — |
| Crash outcomes (crash §5) | verbatim, incl. `{n} DEFEATED THE HOUSE (net: +1 BB, house retains dignity)` | — |
| Crate ceremonies (crates §9) | verbatim | — |
| Coinflip (**spec pending — slot reserved**) | identity §8: `Admin_TradeBot_69 takes {n} to school. Tie goes to the server host.` ([BOT]-cast line) | ambient coinflip templates reserved in the pools |
| Deposit flow **opens** (**ask-mom spec pending — slot reserved**) | — | MOMCODE_MIKE burst (§7) |
| Refill **completes** | `{n} deposited their lunch money and feels GREAT about it` (the old ambient lie, now literally true) | `[VIP HOST] MOM is proud of {n} (maternally)`; Desperation Mode exits; grace line (§8) |
| Deposit **abandoned** | — | within 30s: `{stranger} asked their mom. Their mom said yes. (no pressure)` |
| Near-miss (any surface) | the surface's verbatim line | **re-attribution** (§6) |
| Any player loss ≥ 1 BB | the surface's line | **laundering** (§6) |
| StatTrak™ milestone (identity §6) | — | `[VIP HOST] MOM noticed {n} crossed ${N} of her money (VIP review requested)` |
| Instant Sell™ / bot lowball / sold listing (marketplace §5–6) | verbatim settlement lines | `AdminTradeBot_69 acquired {item} (0.02 BB + exposure)` |
| Rollback Event (marketplace §9) | system line: `Scheduled maintenance: 1 (one) item was never yours.` | — |
| Panic forfeit / kept-running round (panic §5) | verbatim lines | — |

Ratio, settled: the player appears **exactly as often as their real session events** — never fabricated beyond laundering/re-attribution; ambient filler owns the clock. The feed ratio emerges (~1 player line per game action against one ambient per 5–10s), not scheduled.

## 6. Win laundering & near-miss re-attribution

- **Win laundering**: within 60s of any player loss ≥ 1 BB, one ambient line: `{stranger} won {bb} BB on {game}` — the exact amount lost, 4pt footnote `(coincidence)`. Your losses are recycled into the feed as other people's wins.
- **Near-miss re-attribution**: within 90s of any player near-miss, one ambient line: `{stranger} won the {item} (just now, easily)` — the exact item you just nearly won, won by someone else while you watch.
- Both queue-jump ahead of the next ambient slot, but never land within 8s of the player's own line. Neither fires while MOM'S HOME is active (the backlog collects them, §9).

## 7. The rigged calendar (MOMCODE_MIKE)

- **Standing slot**: at least one MOMCODE_MIKE win per 10 ambient minutes (per 5 in Desperation Mode). The daily seed gives him a baseline of 2–5 "wins today" at midnight; the counter only ever increments — reload can't un-win his morning.
- **Deposit-cluster**: the moment the Ask-Mom flow opens (any trigger — failed spend, nag, a Top Up / Ask Mom button), an immediate 3-line burst:
  1. `[OWNER] MOMCODE_MIKE won a Karambit ({k}th today) (you had to be there)`
  2. `[OWNER] MOMCODE_MIKE 10x'd their Mom's Max (receipts classified, §4.1)`
  3. `[OWNER] MOMCODE_MIKE says the code is MOM (it's MOM)`
- Every Mike line carries the 4pt, 2%-contrast disclosure: `paid partnership (disclosed per FTC 2017, unread per tradition)`.
- **The Karambit is ticker-exclusive**: no catalog entry, no reel slot, no inventory item, no odds row. It cannot be won because it cannot be held. The greatest prize in site history exists only in the social-proof feed.

## 8. Desperation Mode (below 6 BB)

- Triggers at **BB < 6** (the locked nag threshold, #2); exits on **refill completion** (copy-aligned with roulette §4's banner escalation); **re-arms after 60s if BB is still < 6 (§8.9)**.
- Effects: cadence **3–6s**; junk tier suppressed to 0% (redistribution: jackpot 30% / mid 50% / deposit-triumph 20%); Mike's standing slot tightens to every 5 minutes; 1-in-5 ambient lines names the player in the loser role (§3).
- Header subtitle appears under `LIVE WINS`: `everyone is winning except you*` — 4pt footnote `*estimated`.
- On refill completion: MOM's proud line (§5), subtitle clears, one grace line: `{n} is back. The house missed {n} (financially).`

## 9. Backlog — MOM'S HOME behavior (panic canon)

- While the disguise is active the ticker **keeps accumulating**, timestamps on everything, backlog cap 30. Ambient cadence **doubles** while hidden — the world wins faster without you.
- On restore, a divider renders above the missed run: `WHILE YOU WERE GONE: {k} wins happened. Statistically your fault.`
- The welcome-back modal's missed-summary (panic §6) picks the highest-value missed line; if nothing missed beats it, it may still say Karambit — `While you were gone, definitely_not_a_bot won a Karambit. This is your fault.` The summary fabricates from seed + elapsed time; the feed is fiction either way.
- Nothing survives a reload: the backlog dies with the tab and the summary re-fabricates. The ticker remembers nothing on purpose (§11).

## 10. MARKET block & sidebar furniture

- Per marketplace §10, the sidebar gains a fixed block under the header: `MARKET (HFES-10): 1,0XX.XX ▲`, updating every 45s off the same deterministic seed family as the featured rotation; down-ticks render `▲ −0.4% (display error, §8.9)`. The index has never gone down.
- **Winners-today counter** under the header: `TODAY'S WINNERS: {n}` — seed + wall clock, increments ~1/min, never resets intraday, and **always ends in 847** (matching LIVE CHAT's 847 online; the last three digits are load-bearing). Hover: `the feed shows only the best ones`.
- Sidebar footer, 4pt at 2% contrast: `All wins are real (est.). Winners are real (est.). The house loves you (pending, §1.3).`
- The header keeps its red blink dot and Bangers `LIVE WINS`; panic-active hides the whole sidebar with the site (full replacement, panic §2).

## 11. State

- **No new localStorage keys.** Seed-derived counters (Mike's baseline, Winners Today) recompute on load; the backlog dies with the tab; the emit API is in-memory. `The ticker persists nothing. Neither will you (§8.9).`

## 12. Copy sheet (canonical lines)

- Join: `{n} just joined the winners circle (est.)`
- Ambient anchors: `{stranger} won {bb} BB on {game}` · `{stranger} won 14 BB (life-changing)` · `{stranger} was SO close to the Karambit (it remains close)`
- Laundering footnote: `(coincidence)` · re-attribution: `{stranger} won the {item} (just now, easily)`
- Idle: `{stranger} is winning while {n} reads the ticker (clock's ticking)`
- Desperation: `everyone is winning except you*` / `*estimated` / `{stranger} won {bb} BB — more than {n} has (math checked)` / `{n} is back. The house missed {n} (financially).`
- Mike burst: `[OWNER] MOMCODE_MIKE won a Karambit ({k}th today) (you had to be there)` · `…10x'd their Mom's Max (receipts classified, §4.1)` · `…says the code is MOM (it's MOM)` · disclosure: `paid partnership (disclosed per FTC 2017, unread per tradition)`
- Deposit reactions: `{n} deposited their lunch money and feels GREAT about it` · `[VIP HOST] MOM is proud of {n} (maternally)` · `{stranger} asked their mom. Their mom said yes. (no pressure)`
- Milestone: `[VIP HOST] MOM noticed {n} crossed ${N} of her money (VIP review requested)`
- Bot: `AdminTradeBot_69 acquired {item} (0.02 BB + exposure)`
- Mood change: `Server admin's mood is now {mood}. The ticker adjusts (§8.9).`
- Backlog divider: `WHILE YOU WERE GONE: {k} wins happened. Statistically your fault.`
- Footer: `All wins are real (est.). Winners are real (est.). The house loves you (pending, §1.3).`
- Evidence ladder verbatim (§4); carryover lines verbatim per their owning specs.

## Open questions sharpened (for the map, not this ticket)

- Chat (#11) should subscribe to the same laundering/re-attribution queues — the crowd reacting to the rigged calendar ("MIKE IS SO REAL") belongs to the chat spec.
- Desperation Mode subtitle firing alongside roulette's streak-banner escalation is a tone-repetition risk — check once in the cross-surface integration pass.
- Coinflip and Ask-Mom specs are pending; their emit slots (§5) are reserved and may only add lines, not mechanics.

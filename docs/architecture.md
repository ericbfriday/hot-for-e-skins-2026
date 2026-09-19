# Architecture — as built

Implementation map **#19** (tickets #20–#32) is complete and merged; `main` is the
shipped state. This file is the as-built map of the tree.

The specs in `docs/spec/` are **canon and read-only** (spec map #1). Per-ticket
decisions, deviations, and integration contracts live in each GitHub issue's
resolution comment — the richest source, richer than this file. The project's final
known-issues ledger is #32's resolution comment.

## Reading order for new work

1. `CONTEXT.md` — the glossary. Use its vocabulary verbatim; it is the tone lock.
2. `docs/spec/integration.md` — the spine contract, module homes (§1), and the
   numbered collision rulings (§13) every surface must keep obeying.
3. `docs/spec/tone-bible.md` — who may say what, in which register.
4. This file — where things actually live in the tree.

## The composition root

`src/App.jsx` (~3,500 lines) — class components, inline styles, no UI framework.
App.jsx owns the tabs, the ceremony theaters (roulette spin, coinflip, crash runs,
crate defuse, the asking ceremony), and all timing. The modules below are pure
logic plus a few panels. Merge conflicts in App.jsx are "both added" hunks:
resolve by **union of both sides**, then rebuild **main** (not just the branch)
with `pnpm build` at zero warnings — this is the established merge ceremony.

## The spine (`src/spine/`)

The shared core every surface is wired to — it carries facts, never money.

| Module | Role |
| --- | --- |
| `constants.js` | house-wide constants (MOMCODE_MIKE, the 3dB-hot offsets, game prices) |
| `mood.js` | the mood rate + mood word (deterministic daily seed, bounded) |
| `bus.js` | the game-event bus (`EVENTS`, `Bus`) and the regime truth it carries |
| `interruptible.js` | the interruptible-state registry (integration.md §4): providers publish whether a toast/modal may interrupt now; MOM'S HOME outranks everything |
| `vault.js` | the **one** Rakeback Vault: per-loss accrual + recalibration (day-seed deterministic, mood-seed family) |
| `identity.js` | gamertag generation, the Compliance Filter, StatTrak™ Lifetime, the reserved cast |
| `consent.js` | the age-gate/ToS consent stamp |
| `band.js` + `synth.js` | The House Band™ — every sound, synthesized live in the browser. `HouseBand.play(id, {priority, volume})` is the **only** entry point surfaces may call; `killAll()` belongs to the panic surface alone |

## Surfaces

| Path | Surface |
| --- | --- |
| `src/askmom/AskMomFlow.jsx` + `session.js` | the Ask-Mom deposit flow: ceremony UI + persisted OC/session state |
| `src/games/roulette.js`, `coinflip.js`, `crash.js`, `crates.js` | pure outcome/copy engines — no React, no DOM; App.jsx renders the ceremonies |
| `src/games/marketplace.js` | marketplace engine: quotes, HFES-10, listings→Escrow, Trade-Up, Rollback + the persisted stores |
| `src/games/inventory.js` | the shared fake-win inventory store (award/list/subscribe + the held-item model) |
| `src/games/catalog.js` | the ten Market-Grade skins, extracted so pure modules don't import React |
| `src/games/fairness.js` | Provably Fair™ theater — FNV-1a stand-in for SHA-256 (deliberate: the joke needs determinism, not crypto) |
| `src/ticker/engine.js` | pure ticker engine: pools, distribution, anchor math, line copy — no timers, no persistence |
| `src/ticker/controller.js` | cadence, regime ownership, event reactions, the laundering queue — **the only caller of `Regime.set()`** |
| `src/ticker/mike.js` | MOMCODE_MIKE's rigged calendar (integration.md §6 seated it in chat; #26 deviation 3 moved it to the ticker) |
| `src/ticker/TickerPanel.jsx` | the rendered feed |
| `src/chat/` | live chat: `personas.js` (session-pinned ambient cast), `constants.js` (decks, keyword funnel, copy), `state.js` (persisted flags), `ChatPanel.jsx` |
| `src/panic/homework.js` | MOM'S HOME: the Homework-disguise fiction — pure logic, App owns the clock |
| `src/retention/state.js` | Attendance Streak, VIP Ladder + VIP Host Mom, Comeback Key™, Rebound Crate, Mom Weather™ |
| `src/selflimit/SelfLimitPanel.jsx` + `state.js` | Self-Limit Settings — the control room connected to nothing |

Persisted state lives in `localStorage` under the `hfes_` prefix (balances,
streaks, escrow, listings, chat flags, self-limit settings…). Reload resets the
theater, never the balance.

## Hard invariants (rulings the tree enforces)

- Only `ticker/controller.js` calls `Regime.set()`. `Regime.evaluate()` was deleted
  in #32; `bus.js` carries the do-not-reintroduce note.
- Chat emits **nothing** on the bus; its only persisted surface is three
  localStorage flags (`chat/state.js`).
- MOM never speaks in public — every MOM line renders as a whisper (pinned, pink,
  whisper chime).
- One tagline, one slot: `DESPERATION_TAGLINE` renders in exactly one
  mutually-exclusive slot per tab (roulette banner on the roulette tab, ticker
  subtitle elsewhere).
- Free rounds move nothing but feelings: free-key settles carry `wagered:false`
  and touch no streak, vault, or attendance. House-sat rounds **do** count for the
  streak (it never asked who paid).
- The population is always **847** (`POPULATION`) and the trade bot is spelled
  `AdminTradeBot_69` — both were grep-cleaned in #32; keep them that way.
- Rounding doctrine: player credits round down, fees round up ("also for you");
  every receipt cites §8.9 where it rounds.
- Game-side chat lines flow through the gameFeed bridge (App stamps lines with an
  id; ChatPanel drains unseen entries into the real feed) — never post into a feed
  with no renderer.
- The build ships **one chunk** (~525 kB / ~160 kB gzip) under the raised 700 kB
  `chunkSizeWarningLimit` in `vite.config.js`. Splitting it is a regression.

## Known issues, deliberately open

From #32's resolution comment — the project's final ledger. These are scoped-out,
not forgotten:

- **Auto-Spin UntilEmpty™** (#23 dev. 1) — unimplemented; no self-limit control
  was ever specified to wire it to.
- **Coinflip Best-of-3/5 series bundle** (#23 dev. 2) — REMATCH (single re-flip)
  stands; the series scorer stays unbuilt.
- **Chat name-echo** (#26 dev. 4) — low-rate post-win tag references; full texture
  left unbuilt.
- **Provably Fair™ hash is FNV-1a, not SHA-256** (#23 dev. 3) — deliberate
  stand-in.
- **§12.2 quiet-window clock** starts at settle+3.2s, not at reality-check
  dismissal (accepted deviation; reality checks default Off, so the silences never
  overlap in the default configuration).
- **§16.9's exact "deposit anyway" whisper string** was cut with #22's interim
  pool and never re-minted; the whisper channel is otherwise fully populated.
- **Vite single chunk @ ~525 kB** under the raised 700 kB ceiling (deliberate
  artifact, documented in `vite.config.js`).

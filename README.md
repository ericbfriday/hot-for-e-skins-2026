# hot-for-e-skins-2026

Satirical skin-gambling parody site. Ported from the original Claude Code design
artifact (`hot-for-e-skins-vercel.html`, kept for reference) into a Vite + React app.
Nothing on this site is real; every surface is fiction — `CONTEXT.md` is the glossary
and the tone lock.

## Requirements

- Node 24 (pinned via `volta` in `package.json` and `.nvmrc`)
- pnpm 10 (pinned via `packageManager`)

## Develop

```
pnpm install
pnpm dev
```

## Build

```
pnpm build     # outputs to dist/
pnpm preview   # serve the production build
```

Build discipline: `pnpm build` must pass with **zero errors and zero warnings** —
warnings have historically been real bugs (e.g. a duplicate `panicActive` key that
slipped in during an App.jsx auto-merge). The app ships as one deliberate single
chunk (~525 kB / ~160 kB gzip) under the raised 700 kB `chunkSizeWarningLimit`;
don't split it.

## Structure

- `src/App.jsx` — composition root: tabs, ceremony theaters, all timing (class
  components, inline styles, no UI framework)
- `src/spine/` — the shared core: mood, event bus, regime, interruptible registry,
  the one Rakeback Vault, identity, consent, constants, and the House Band™
  (`band.js` + `synth.js`, all-synthesized audio)
- `src/askmom/` — the Ask-Mom deposit flow (`AskMomFlow.jsx` ceremony +
  `session.js` persisted session state)
- `src/games/` — Allowance Roulette, Skin Coinflip, College Fund Crash, Loot Crate
  Defuser (pure outcome/copy engines), marketplace + inventory stores, the skin
  catalog, and the Provably Fair™ theater helper
- `src/ticker/` — the Live-Wins ticker: pure engine, controller (regime owner),
  MOMCODE_MIKE's rigged calendar, `TickerPanel.jsx`
- `src/chat/` — live chat: session-pinned personas, keyword funnel, persisted flags
- `src/panic/` — MOM'S HOME: the Homework-disguise fiction
- `src/retention/` — Attendance Streak, VIP Ladder + VIP Host Mom, Comeback Key,
  Mom Weather
- `src/selflimit/` — Self-Limit Settings panel + state
- `src/index.css` — Bangers @font-face (self-hosted), keyframes, global styles
- `src/assets/` — font subsets + the ten skin JPEGs
- `docs/` — canon specs (`docs/spec/`), the as-built architecture reference
  (`docs/architecture.md`), agent conventions (`docs/agents/`)
- `hot-for-e-skins-vercel.html` — original self-extracting design artifact

See `docs/architecture.md` for the as-built module map and hard invariants.

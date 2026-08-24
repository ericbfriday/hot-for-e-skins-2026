# hot-for-e-skins-2026

Satirical skin-gambling parody site. Ported from the original Claude Code design
artifact (`hot-for-e-skins-vercel.html`, kept for reference) into a Vite + React app.

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

## Structure

- `src/App.jsx` - the app (ported 1:1 from the artifact's DCLogic class + template)
- `src/index.css` - Bangers @font-face (self-hosted), keyframes, global styles
- `src/assets/fonts/` - woff2 subsets extracted from the original bundle
- `hot-for-e-skins-vercel.html` - original self-extracting design artifact

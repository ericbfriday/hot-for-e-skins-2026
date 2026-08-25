import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// #31: the site ships as one chunk by design (a single-page con works best
// when every surface agrees); main crossed the 500 kB default ceiling with the
// retention module. The limit is raised, not the bundle split.
// #32 audit: measured 524.75 kB (159.59 kB gzip) at the final sweep — under
// the 700 ceiling with headroom; a code-split would buy ~25 kB of warning
// silence at the cost of the single-chunk artifact. Accepted as-is.
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
  },
  preview: {
    allowedHosts: ['host.docker.internal'],
  },
})

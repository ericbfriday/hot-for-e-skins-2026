import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// #31: the site ships as one chunk by design (a single-page con works best
// when every surface agrees); main crossed the 500 kB default ceiling with the
// retention module. The limit is raised, not the bundle split.
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
  },
  preview: {
    allowedHosts: ['host.docker.internal'],
  },
})

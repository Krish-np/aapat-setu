import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The SPA is mounted at / (root), with the app living under /app/* routes within the SPA.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
  build: {
    outDir: '../backend/static',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
  },
})

import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 5193,
    strictPort: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

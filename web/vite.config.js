import { defineConfig } from 'vite'
import { cpSync } from 'node:fs'

// The figures fetch data/*.json at runtime. Vite only bundles imported/public
// assets, so without this the JSON files never reach dist/ and every chart 404s
// in production. This plugin copies web/data/ -> dist/data/ after the build.
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
  plugins: [
    {
      name: 'copy-runtime-data',
      closeBundle() {
        cpSync('data', 'dist/data', { recursive: true })
      },
    },
  ],
})

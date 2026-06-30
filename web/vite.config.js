import { defineConfig } from 'vite'
import { cpSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The figures fetch data/*.json at runtime. Vite only bundles imported/public
// assets, so without this the JSON files never reach dist/ and every chart 404s
// in production. This plugin copies web/data/ -> dist/data/ after the build.
const copyRuntimeData = {
  name: 'copy-runtime-data',
  closeBundle() {
    cpSync('data', 'dist/data', { recursive: true })
  },
}

// Cards are content-hashed (og/<slug>.<hash>.png). The main page's brand
// og:image must reference the current hash, but we never rewrite the index.html
// SOURCE (it carries hand-edited prose). Instead we swap the placeholder
// `og/brand.png` for the hashed filename at transform time, in dev and build,
// reading the committed manifest. No source file is touched.
function injectBrandOgImage() {
  let brandFile = 'brand.png'
  try {
    brandFile = JSON.parse(readFileSync('public/og/manifest.json', 'utf8')).brand.file
  } catch {
    /* manifest not generated yet — leave placeholder */
  }
  return {
    name: 'inject-brand-og-image',
    transformIndexHtml(html) {
      return html.replaceAll('og/brand.png', `og/${brandFile}`)
    },
  }
}

export default defineConfig({
  root: '.',
  server: { port: 5193, strictPort: true, open: false },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        share: fileURLToPath(new URL('./share/index.html', import.meta.url)),
      },
    },
  },
  plugins: [copyRuntimeData, injectBrandOgImage()],
})

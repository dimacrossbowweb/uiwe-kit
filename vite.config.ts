import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname, relative } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

const SRC = resolve(__dirname, 'src')
const OUT = resolve(__dirname, 'dist')

/**
 * Give every relative specifier in an emitted .d.ts an explicit file extension.
 *
 * vue-tsc emits what the source wrote: `export * from './components'` and
 * `from './btn/index.vue'`. Neither resolves under
 * `moduleResolution: node16 | nodenext`, where ESM demands a real file path, so
 * consumers on those settings saw "Module 'uiwekit' has no exported member
 * 'UiBtn'" for every component. `moduleResolution: bundler` — what a Vite app
 * uses, and what this repo typechecks with — resolves both happily, which is
 * why it stayed hidden until the package was installed from a tarball.
 *
 * Rewriting to `./components/index.js` and `./btn/index.vue.js` puts them on
 * TypeScript's normal path: it maps a `.js` specifier onto the neighbouring
 * `.d.ts`. Declarations are type-only, so none of this reaches the runtime,
 * whose imports vite/rollup already emit with correct extensions.
 *
 * Resolution is checked against the real source tree rather than guessed,
 * because `./x` may be either `x.ts` or `x/index.ts` and the two need different
 * suffixes.
 */
function explicitSpecifiers(filePath: string, content: string): string {
  const srcDir = resolve(SRC, relative(OUT, dirname(filePath)))

  return content.replace(
    /(from\s*|import\s*\()(['"])(\.[^'"]*)\2/g,
    (whole, head: string, quote: string, spec: string) => {
      if (/\.(js|mjs|cjs|json)$/.test(spec)) return whole

      const target = resolve(srcDir, spec)
      const isFile = (p: string) => existsSync(p) && statSync(p).isFile()

      // './btn/index.vue' and './x.ts' -> append .js
      if (isFile(target) || isFile(`${target}.ts`) || isFile(`${target}.d.ts`)) {
        return `${head}${quote}${spec}.js${quote}`
      }
      // './components' -> './components/index.js'
      for (const entry of ['index.ts', 'index.vue', 'index.d.ts']) {
        if (isFile(resolve(target, entry))) {
          const base = entry === 'index.vue' ? 'index.vue' : 'index'
          return `${head}${quote}${spec}/${base}.js${quote}`
        }
      }
      return whole
    }
  )
}

/**
 * Packages that must never be bundled.
 *
 * `vue` is a hard peer; `@vueuse/core` and `gsap` are real dependencies. The
 * rest are optional peers, reachable only through the `uiwekit/date`,
 * `uiwekit/carousel` and `uiwekit/emoji` subpath entries below — the root entry never
 * links them, so installing uiwekit does not require installing them.
 *
 * `gsap` is a dependency rather than an optional peer because `UiMenu` needs it
 * and seven further components render a `<ui-menu>`; making it optional would
 * have pushed Tooltip, Dropdown, Range, Audio and Video out of the core entry.
 */
const EXTERNAL = [
  'vue',
  'vue-router',
  '@vueuse/core',
  'gsap',
  'moment',
  'emoji-mart',
  '@emoji-mart/data',
  '@splidejs/splide',
  '@splidejs/vue-splide'
]

/**
 * One predictable stylesheet name instead of a hashed one, so the documented
 * `import 'uiwekit/styles.css'` stays valid.
 */
const assetFileNames = (asset: { names?: string[] }): string =>
  asset.names?.[0]?.endsWith('.css') ? 'styles.css' : 'assets/[name][extname]'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.stories.ts', 'src/**/*.spec.ts', 'src/dev/**'],
      // Emit per-file declarations mirroring the source tree and point the
      // entry at src/index. `insertTypesEntry` alone produced a bare
      // `export {}` here — the generated entry did not re-export anything.
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: explicitSpecifiers(filePath, content)
      })
    })
  ],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        // One entry per optional peer group. Separate entries, not separate
        // chunks: each must be linkable without the others' peers installed.
        date: resolve(__dirname, 'src/date.ts'),
        carousel: resolve(__dirname, 'src/carousel.ts'),
        emoji: resolve(__dirname, 'src/emoji.ts')
      },
      formats: ['es', 'cjs']
      // No `fileName` here: it only names entry chunks, and `preserveModules`
      // below turns every source module into an entry. `entryFileNames` on each
      // output handles the naming instead.
    },
    rollupOptions: {
      // Subpath imports (e.g. 'vue-router/dist/...') must be external too.
      external: (id) => EXTERNAL.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      // Declared per format rather than as one shared object, because the two
      // outputs need different extensions and `preserveModules` names every
      // module through `entryFileNames`.
      output: (['es', 'cjs'] as const).map((format) => ({
        format,
        globals: { vue: 'Vue' },
        // The entry deliberately exposes both a default (the plugin) and named
        // exports; 'named' silences Rollup's interop warning about the mix.
        exports: 'named' as const,
        /**
         * ESM gets one output file per source module, mirroring src/, so a
         * consumer's bundler can drop what it never imports (the package
         * declares only CSS as side-effectful).
         *
         * This is *not* what makes the optional peers optional — that is the
         * job of the separate `date` / `carousel` / `emoji` entries above. A
         * bundler links every module a barrel re-exports before tree-shaking
         * runs, so while one barrel named all 85 components, importing `UiBtn`
         * still forced `@splidejs/vue-splide` to resolve.
         *
         * CJS is excluded because `preserveModules` miscompiles the SFC modules
         * carrying a scoped-style import there: rollup drops the require but
         * keeps the binding, emitting `const e=;` — a syntax error that made
         * `require('uiwekit')` throw on load. No loss, since tree-shaking is an
         * ESM concern; CJS ships as one bundle per entry instead.
         */
        ...(format === 'es'
          ? { preserveModules: true, preserveModulesRoot: 'src' }
          : {}),
        entryFileNames: `[name].${format === 'es' ? 'mjs' : 'cjs'}`,
        // Shared identity, not a fresh closure per format: vite compares the
        // two outputs' assetFileNames and warns when they differ.
        assetFileNames
      }))
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true
  },

  // IPv6 loopback (::1) is unreachable on this machine, so bind IPv4 explicitly.
  server: {
    host: '127.0.0.1'
  }
})

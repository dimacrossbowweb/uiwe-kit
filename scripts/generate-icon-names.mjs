/**
 * Regenerates src/components/icon/icon-names.ts from the icon font stylesheet.
 * Run after replacing the font: `pnpm gen:icons`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const SCSS = fileURLToPath(new URL('../src/styles/fonts/icons/_ui.scss', import.meta.url))
const OUT = fileURLToPath(new URL('../src/components/icon/icon-names.ts', import.meta.url))

const source = readFileSync(SCSS, 'utf-8')
const names = [...new Set([...source.matchAll(/^\.uii-([a-z0-9-]+):before/gm)].map((m) => m[1]))]
names.sort()

const body = `// Generated from styles/fonts/icons/_ui.scss — the bundled icon font.
// Regenerate with: pnpm gen:icons

/** Every glyph available in the bundled \`ui\` icon font. */
export const ICON_NAMES = [
${names.map((n) => `  '${n}'`).join(',\n')}
] as const

export type IconName = (typeof ICON_NAMES)[number]
`

writeFileSync(OUT, body, 'utf-8')
console.log(`Wrote ${names.length} icon names to ${OUT}`)

import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue'
import type { ThemeTokens, TokenName } from './tokens'

/**
 * Bumped on every theme change. `useCSSVar` watches this to stay reactive —
 * without it a computed() calling getComputedStyle() would only ever run once.
 */
export const themeVersion = ref(0)

/** Built-in presets ship in the stylesheet; custom ones are registered at runtime. */
export type BuiltInTheme = 'light' | 'dark'
export type ThemeName = BuiltInTheme | (string & {})

/**
 * Value of a component's `theme` prop: force one of the built-in palettes onto
 * that component's subtree, or `'auto'` to follow the app theme.
 */
export type UiTheme = 'auto' | BuiltInTheme

const STORAGE_KEY = 'ui:theme'
const STYLE_ELEMENT_ID = 'ui-runtime-themes'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/** Themes registered via createTheme(), kept so we can re-emit the whole sheet. */
const registered = new Map<ThemeName, ThemeTokens>()

const availableThemes = ref<ThemeName[]>(['light', 'dark'])

function readStored(): ThemeName | null {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem(STORAGE_KEY) || null
  } catch {
    // localStorage throws in private mode / sandboxed iframes — not fatal.
    return null
  }
}

function detectSystem(): BuiltInTheme {
  if (!isBrowser) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<ThemeName>('light')
/** True while the theme is being driven by the OS rather than an explicit choice. */
const followsSystem = ref(true)
let persist = true
let initialized = false

function tokensToCss(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--ui-${key}: ${value};`)
    .join('')
}

/** Re-renders every runtime-registered theme into a single <style> tag. */
function flushRegisteredThemes(): void {
  if (!isBrowser) return

  let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    document.head.appendChild(style)
  }

  style.textContent = Array.from(registered.entries())
    .map(([name, tokens]) => `:root[data-theme="${name}"]{${tokensToCss(tokens)}}`)
    .join('\n')
}

function apply(next: ThemeName): void {
  if (!isBrowser) return

  document.documentElement.dataset.theme = next

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore — persistence is a convenience, not a requirement.
    }
  }

  themeVersion.value++
}

/**
 * Registers (or replaces) a theme at runtime by emitting CSS custom properties
 * under `:root[data-theme="<name>"]`.
 *
 * Tokens are merged over the base preset, so a theme only needs to declare what
 * it changes:
 *
 * ```ts
 * createTheme('ocean', { brand: '#0ea5e9', 'fill-01': '#f0f9ff' })
 * setTheme('ocean')
 * ```
 *
 * @param name    Theme identifier, used as the `data-theme` value.
 * @param tokens  Partial token map. Keys are token names without the `--ui-` prefix.
 * @param options `extends` names the preset whose `data-theme` styling should be
 *                inherited for tokens this theme does not override. Defaults to 'light'.
 */
export function createTheme(
  name: ThemeName,
  tokens: ThemeTokens,
  options: { extends?: BuiltInTheme } = {}
): void {
  const base = options.extends ?? 'light'

  // Dark's tokens live in the stylesheet under [data-theme="dark"], which will
  // not match once the element carries a custom theme name. Copying the dark
  // values in at registration time is what makes `extends: 'dark'` actually work.
  const inherited: ThemeTokens =
    base === 'dark' && isBrowser ? readTokensFromPreset('dark') : {}

  registered.set(name, { ...inherited, ...tokens })
  flushRegisteredThemes()

  if (!availableThemes.value.includes(name)) {
    availableThemes.value = [...availableThemes.value, name]
  }

  // Re-apply so a live edit of the current theme takes effect immediately.
  if (theme.value === name) apply(name)
}

/** Reads a built-in preset's computed token values off a detached probe element. */
function readTokensFromPreset(preset: BuiltInTheme): ThemeTokens {
  if (!isBrowser) return {}

  const probe = document.createElement('div')
  probe.dataset.theme = preset
  probe.style.display = 'none'
  document.documentElement.appendChild(probe)

  const computedStyle = getComputedStyle(probe)
  const result: ThemeTokens = {}

  // Only tokens the stylesheet actually declares are readable this way. The
  // namespaced palettes ( --ui-light-* / --ui-dark-* ) are skipped: they are
  // the same on every element and are not part of a theme's token set.
  const tokens = Array.from(document.styleSheets)
    .flatMap(collectUiTokenNames)
    .filter((token) => !token.startsWith('light-') && !token.startsWith('dark-'))

  for (const token of tokens) {
    const value = computedStyle.getPropertyValue(`--ui-${token}`).trim()
    if (value) result[token] = value
  }

  probe.remove()
  return result
}

/** Scrapes `--ui-*` names out of a stylesheet, ignoring cross-origin ones. */
function collectUiTokenNames(sheet: CSSStyleSheet): TokenName[] {
  let rules: CSSRuleList
  try {
    rules = sheet.cssRules
  } catch {
    // Cross-origin stylesheet — inaccessible by design.
    return []
  }

  const names: TokenName[] = []
  for (const rule of Array.from(rules)) {
    if (!(rule instanceof CSSStyleRule)) continue
    for (const prop of Array.from(rule.style)) {
      if (prop.startsWith('--ui-')) names.push(prop.slice('--ui-'.length))
    }
  }
  return names
}

export function setTheme(next: ThemeName): void {
  followsSystem.value = false
  theme.value = next
  apply(next)
}

/** Toggles between light and dark. Any custom theme resolves to light first. */
export function toggleTheme(): void {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

/** Hands control back to the OS `prefers-color-scheme` setting. */
export function useSystemTheme(): void {
  followsSystem.value = true
  if (persist && isBrowser) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore.
    }
  }
  theme.value = detectSystem()
  apply(theme.value)
}

/**
 * Boots the theme layer: resolves the initial theme, applies it, and wires up
 * OS-preference and cross-tab syncing. Called automatically by the Vue plugin;
 * call it directly only if you are using the library without the plugin.
 */
export function initTheme(
  options: { default?: ThemeName; persist?: boolean; themes?: Record<string, ThemeTokens> } = {}
): void {
  if (initialized || !isBrowser) return
  initialized = true

  persist = options.persist ?? true

  if (options.themes) {
    for (const [name, tokens] of Object.entries(options.themes)) createTheme(name, tokens)
  }

  const stored = persist ? readStored() : null
  followsSystem.value = !stored && !options.default

  theme.value = stored ?? options.default ?? detectSystem()
  apply(theme.value)

  // Follow the OS only while the user has not made an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!followsSystem.value) return
    theme.value = e.matches ? 'dark' : 'light'
    apply(theme.value)
  })

  // Keep tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === theme.value) return
    followsSystem.value = false
    theme.value = e.newValue
    apply(e.newValue)
  })
}

export interface UseThemeReturn {
  /** Current theme name. Read-only — use setTheme() to change it. */
  theme: Readonly<Ref<ThemeName>>
  /** True when the theme is tracking the OS preference. */
  followsSystem: Readonly<Ref<boolean>>
  /** Every known theme: built-in presets plus anything createTheme() registered. */
  themes: Readonly<Ref<ThemeName[]>>
  isDark: ComputedRef<boolean>
  setTheme: (next: ThemeName) => void
  toggleTheme: () => void
  useSystemTheme: () => void
  createTheme: typeof createTheme
}

export function useTheme(): UseThemeReturn {
  return {
    theme: readonly(theme),
    followsSystem: readonly(followsSystem),
    themes: readonly(availableThemes) as Readonly<Ref<ThemeName[]>>,
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
    useSystemTheme,
    createTheme
  }
}

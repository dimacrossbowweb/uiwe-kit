import type { App, Component, Plugin } from 'vue'
import * as components from './components'
import { initTheme } from './theme/useTheme'
import { withUiTheme } from './theme/uiThemeMixin'
import type { ThemeName } from './theme/useTheme'
import type { ThemeTokens } from './theme/tokens'
import { vFocus } from './directives/focus'
import { vStickyTop } from './directives/sticky-top'
import { vStickyBottom } from './directives/sticky-bottom'
import { vTimeout } from './directives/timeout'

export interface UiPluginOptions {
  /**
   * Register every component globally.
   * Set false to keep the bundle lean and import components explicitly.
   * @default true
   */
  components?: boolean
  /**
   * Register the bundled directives (v-focus, v-sticky-top, v-sticky-bottom, v-timeout).
   * @default true
   */
  directives?: boolean
  /**
   * Theme to apply when nothing is stored. Omit to follow the OS preference.
   */
  defaultTheme?: ThemeName
  /**
   * Persist the selected theme to localStorage and sync it across tabs.
   * @default true
   */
  persistTheme?: boolean
  /**
   * Custom themes to register at install time — equivalent to calling
   * createTheme() for each entry.
   */
  themes?: Record<string, ThemeTokens>
  /**
   * Apply the library's base layer (font token, background, colour) to <html>.
   * Off by default so the library never overrides a host app's own reset.
   * @default false
   */
  baseStyles?: boolean
}

/** 'UiBtn' -> 'ui-btn' */
function toKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Registers a set of components under both casings, so `<UiBtn>` and `<ui-btn>`
 * resolve in any template style.
 *
 * Exported because the optional-peer subpaths (`uiwekit/date`, `uiwekit/carousel`,
 * `uiwekit/emoji`) ship their own installers and must register components the same
 * way the core plugin does.
 */
export function registerComponentMap(app: App, map: Record<string, unknown>): void {
  for (const [name, component] of Object.entries(map)) {
    if (!name.startsWith('Ui')) continue
    // Every Ui* component gets the shared `theme` prop ('auto' | 'light' | 'dark').
    withUiTheme(component)
    app.component(name, component as Component)
    app.component(toKebab(name), component as Component)
  }
}

/**
 * Installs the design system.
 *
 * ```ts
 * import { createApp } from 'vue'
 * import UiKit from 'uiwekit'
 * import 'uiwekit/styles.css'
 *
 * createApp(App).use(UiKit, { defaultTheme: 'dark' }).mount('#app')
 * ```
 */
export const UiKit: Plugin<[UiPluginOptions?]> = {
  install(app: App, options: UiPluginOptions = {}) {
    const {
      components: registerComponents = true,
      directives: registerDirectives = true,
      baseStyles = false
    } = options

    initTheme({
      default: options.defaultTheme,
      persist: options.persistTheme,
      themes: options.themes
    })

    if (baseStyles && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-ui-base', '')
    }

    if (registerComponents) {
      registerComponentMap(app, components)
    }

    if (registerDirectives) {
      app.directive('focus', vFocus)
      app.directive('sticky-top', vStickyTop)
      app.directive('sticky-bottom', vStickyBottom)
      app.directive('timeout', vTimeout)
    }
  }
}

export default UiKit

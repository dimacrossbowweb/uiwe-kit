import type { ComponentOptions } from 'vue'
import type { UiTheme } from './useTheme'

interface ThemedVm {
  $el: unknown
  theme: UiTheme
}

// Stamps (or clears) data-theme on the component's root element. The stylesheet
// treats [data-theme] as a theme scope (see styles/main.scss), so this re-points
// every --ui-* colour for the component's subtree. 'auto' inherits the app theme.
function applyTheme(vm: ThemedVm): void {
  const el = vm.$el

  // Fragment / text / comment roots have no single host element to stamp — skip.
  // Such components can still be themed by wrapping them in a themed element.
  if (!(el instanceof HTMLElement)) return

  const next = vm.theme && vm.theme !== 'auto' ? vm.theme : null
  const curr = el.getAttribute('data-theme')

  if (next === curr) return
  if (next) el.setAttribute('data-theme', next)
  else el.removeAttribute('data-theme')
}

/**
 * Adds the shared `theme` prop ('auto' | 'light' | 'dark') that forces a colour
 * theme onto a component, without touching its template, refs or exposed API.
 *
 * The plugin injects it into every registered Ui* component. Colours a component
 * resolves in JS go through `useCSSVar(name, props.theme)`; this mixin covers the
 * other half — stylesheet `var(--ui-*)` lookups — by stamping `data-theme`.
 * When importing components explicitly without the plugin, either wrap them in
 * an element carrying `data-theme`, or call `withUiTheme()` on the component.
 */
export const uiThemeMixin: ComponentOptions = {
  props: {
    theme: {
      type: String,
      default: 'auto',
      validator: (v: string) => v === 'auto' || v === 'light' || v === 'dark'
    }
  },
  mounted() {
    applyTheme(this as unknown as ThemedVm)
  },
  updated() {
    applyTheme(this as unknown as ThemedVm)
  }
}

/** Injects {@link uiThemeMixin} into a component once. Returns the same component. */
export function withUiTheme<T>(component: T): T {
  const options = component as unknown as ComponentOptions
  const mixins = options.mixins ?? []

  if (!mixins.includes(uiThemeMixin)) options.mixins = [uiThemeMixin, ...mixins]

  return component
}

declare module 'vue' {
  interface ComponentCustomProps {
    /**
     * Forces a colour theme onto this component's subtree.
     * `'auto'` (default) follows the app theme.
     */
    theme?: UiTheme
  }
}

/**
 * uiwekit/date — calendar and date-picker components.
 *
 * Requires `moment`, an optional peer:
 *
 *   pnpm add moment
 *
 * ```ts
 * // Explicit import
 * import { UiDatePicker } from 'uiwekit/date'
 *
 * // Or register the group globally, alongside the core plugin
 * import UiKit from 'uiwekit'
 * import { UiKitDate } from 'uiwekit/date'
 * app.use(UiKit).use(UiKitDate)
 * ```
 *
 * These live behind a subpath rather than in the root entry because a bundler
 * links every module a barrel re-exports before tree-shaking runs — exporting
 * them from `uiwekit` would make `moment` mandatory for every consumer.
 */
import type { App, Plugin } from 'vue'
import { registerComponentMap } from './plugin'
import * as dateComponents from './components/date'

export * from './components/date'

// `useDate` is deliberately absent from the root entry — it imports `moment`.
// This is its home: anyone reaching for `uiwekit/date` has already installed it.
export { useDate } from './composables/useDate'

/** Registers the date components globally. Pair with the core `UiKit`. */
export const UiKitDate: Plugin = {
  install(app: App) {
    registerComponentMap(app, dateComponents)
  }
}

export default UiKitDate

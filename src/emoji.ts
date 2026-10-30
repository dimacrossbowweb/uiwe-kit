/**
 * uiwekit/emoji — emoji picker.
 *
 * Requires both emoji-mart packages, optional peers:
 *
 *   pnpm add emoji-mart @emoji-mart/data
 *
 * ```ts
 * import { UiEmoji } from 'uiwekit/emoji'
 *
 * // Or register it globally, alongside the core plugin
 * import UiKit from 'uiwekit'
 * import { UiKitEmoji } from 'uiwekit/emoji'
 * app.use(UiKit).use(UiKitEmoji)
 * ```
 *
 * See ./date.ts for why this is behind a subpath.
 */
import type { App, Plugin } from 'vue'
import { registerComponentMap } from './plugin'
import * as emojiComponents from './components/emoji'

export * from './components/emoji'

/** Registers the emoji picker globally. Pair with the core `UiKit`. */
export const UiKitEmoji: Plugin = {
  install(app: App) {
    registerComponentMap(app, emojiComponents)
  }
}

export default UiKitEmoji

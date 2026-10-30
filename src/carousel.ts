/**
 * uiwekit/carousel — slider and swipe components.
 *
 * Requires Splide, an optional peer. The two components use different packages,
 * so install only what you use:
 *
 *   pnpm add @splidejs/vue-splide     # UiSlider
 *   pnpm add @splidejs/splide         # UiSwipe
 *
 * Splide's stylesheet is yours to import, exactly like `uiwekit/styles.css`:
 *
 *   import '@splidejs/vue-splide/css'   // UiSlider
 *   import '@splidejs/splide/css'       // UiSwipe
 *
 * ```ts
 * import { UiSlider } from 'uiwekit/carousel'
 *
 * // Or register the group globally, alongside the core plugin
 * import UiKit from 'uiwekit'
 * import { UiKitCarousel } from 'uiwekit/carousel'
 * app.use(UiKit).use(UiKitCarousel)
 * ```
 *
 * Note that the group installer registers both components, which links both
 * peers. Import the component directly if you only installed one.
 *
 * See ./date.ts for why these are behind a subpath.
 */
import type { App, Plugin } from 'vue'
import { registerComponentMap } from './plugin'
import * as carouselComponents from './components/carousel'

export * from './components/carousel'

/** Registers the carousel components globally. Pair with the core `UiKit`. */
export const UiKitCarousel: Plugin = {
  install(app: App) {
    registerComponentMap(app, carouselComponents)
  }
}

export default UiKitCarousel

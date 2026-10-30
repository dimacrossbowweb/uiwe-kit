/**
 * Splide ships its stylesheets through package exports (`@splidejs/splide/css`,
 * `.../css/core`, `.../css/<theme>`) but publishes no type declarations for
 * them. With `noUncheckedSideEffectImports` on, TypeScript rejects those
 * side-effect imports as unresolved modules, so declare them here.
 *
 * The single wildcard covers `/css` and every `/css/*` subpath.
 */
declare module '@splidejs/splide/css*'
declare module '@splidejs/vue-splide/css*'

/**
 * `@splidejs/vue-splide` ships no type declarations at all, so importing it
 * under `strict` is an implicit-any error. Declared loosely here — the alternative
 * is an `any` cast at every use site in the slider component.
 */
declare module '@splidejs/vue-splide' {
  import type { DefineComponent } from 'vue'
  export const Splide: DefineComponent<Record<string, unknown>>
  export const SplideSlide: DefineComponent<Record<string, unknown>>
  export const SplideTrack: DefineComponent<Record<string, unknown>>
}

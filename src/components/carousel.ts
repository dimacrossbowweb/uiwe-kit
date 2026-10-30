// Components that need Splide.
//
// `UiSlider` uses the Vue wrapper (`@splidejs/vue-splide`), `UiSwipe` drives
// the core library (`@splidejs/splide`) directly, so the two peers are
// independent — install only the one you need.
//
// Reached through the `uiwekit/carousel` subpath. See ./date.ts for why these are
// not in the core barrel.

export { default as UiSlider } from './slider/index.vue'
export { default as UiSwipe } from './swipe/index.vue'

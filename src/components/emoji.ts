// Component that needs emoji-mart (both `emoji-mart` and its `@emoji-mart/data`
// dataset — the picker is useless without the data package).
//
// Reached through the `uiwekit/emoji` subpath. See ./date.ts for why this is not
// in the core barrel.

export { default as UiEmoji } from './emoji/index.vue'

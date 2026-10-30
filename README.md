# uiwekit

Vue 3 design system extracted from the Compass Messenger client — themeable
components, composables and design tokens.

```bash
pnpm add uiwekit
```

```ts
import { createApp } from 'vue'
import UiKit from 'uiwekit'
import 'uiwekit/styles.css'

createApp(App).use(UiKit).mount('#app')
```

Full documentation lives in Storybook:

```bash
pnpm storybook      # http://127.0.0.1:6006
```

## What ships today

**94 components** — 86 in the root entry, 8 behind subpaths (see **Bundle**).
Layout (`Container`, `Row`, `Col`, `Flex`, `Space`, `Divider`, `Sheet`,
`Layout`, `Toolbar`, `SplitPanel`, `Tabs`), typography (`Text`, `Label`,
`Link`), forms (`Btn`, `Input` + 5 variants, `Textarea`, `Checkbox`, `Radio`,
`Switch`, `Form`, `HelperText`, `Range`, `Dropdown`, `Uploader`, `DropZone`,
`Pin`, `CircleSlider`), surfaces (`Card` + 5 sub-components, `Alert`, `Expansion`), overlays
(`Dialog`, `Menu`, `Submenu`, `ContextMenu`, `BottomSheet`, `Tooltip`, `Window`,
`FloatWindow`, `ResizeCorners`, `Overlay`, `NavigationDrawer`, `Toast`,
`ToastLayer`), scrolling (`Scroll`, `Scrolling`, `Scrollbar`), lists (`List` + 3
sub-components, `VirtualList`), media (`Image`, `ImageGrid`, `Video`, `Audio`)
and data display (`Icon`, `Avatar`, `AvatarStack`, `Chip`, `Badge`, `Status`,
`StatusBar`, `Skeleton`, `Preloader`).

**Theming** — `light` and `dark` presets plus `createTheme()` for custom themes
at runtime. 34 colour tokens and 3 base tokens, all exposed as `--ui-*` CSS
custom properties; both palettes are also always available as `--ui-light-*` /
`--ui-dark-*`. Every component takes a `theme` prop (`auto` | `light` | `dark`)
to force a palette onto its subtree.

**Composables** — `useBem`, `useFormat`, `useCSSVar`, `useElevation`,
`useMobile`, `usePulsation`, `useAvatar`, `useCheckpoints`,
`useMarqueeSelection`, `useEscapeLayer` (Esc closes only the top layer),
`showToast` / `useToasts` (anchored toasts, rendered by `<ui-toast-layer>`),
`detectCountryByPhone`, `toInternationalPhone`. Plus `useDate` from `uiwekit/date`.

**4 directives** — `v-focus`, `v-sticky-top`, `v-sticky-bottom`, `v-timeout`.

**Styles** — type scale, 12-column responsive grid, utility class layer, and a
bundled icon font (35 glyphs).

## Theming

```ts
import { createTheme, setTheme, useTheme } from 'uiwekit'

createTheme('ocean', { brand: '#0284c7', 'fill-01': '#f0f9ff' })
setTheme('ocean')

const { theme, isDark, toggleTheme } = useTheme()
```

Themes are CSS-variable swaps on `<html data-theme>`, so switching costs one
attribute write — no rebuild and no component re-render. Omitted tokens inherit
from the base preset.

## Bundle

`npm i uiwekit` pulls `vue`, `@vueuse/core` and `gsap` — nothing else. The 86
components in the root entry need no other dependency.

Eight components need a heavier library, so they live behind subpaths. Import
them from there and install the peer yourself:

| Subpath | Peer to install | Components |
| --- | --- | --- |
| `uiwekit/date` | `moment` | `UiCalendar`, its 3 grids, `UiDatePicker` |
| `uiwekit/carousel` | `@splidejs/vue-splide` (Slider), `@splidejs/splide` (Swipe) | `UiSlider`, `UiSwipe` |
| `uiwekit/emoji` | `emoji-mart` + `@emoji-mart/data` | `UiEmoji` |

```ts
import { UiBtn } from 'uiwekit'                  // vue only
import { UiDatePicker } from 'uiwekit/date'      // + moment
```

Each subpath also ships a plugin for global registration:

```ts
import UiKit from 'uiwekit'
import { UiKitDate } from 'uiwekit/date'
app.use(UiKit).use(UiKitDate)
```

**Why subpaths and not one entry.** A bundler links every module a barrel
re-exports *before* tree-shaking can drop it. With all components in one
barrel, `import { UiBtn } from 'uiwekit'` made Rollup resolve `@splidejs/vue-splide`
for the slider it was about to discard, and the build failed for anyone who had
not installed it — the peers were "optional" in package.json and mandatory in
practice. Splitting the barrel is what makes them genuinely optional.

`gsap` is a real dependency rather than an optional peer: `UiMenu` needs it and
seven more components render a `<ui-menu>`, so making it optional would have
pushed `UiTooltip`, `UiDropdown`, `UiRange`, `UiAudio` and `UiVideo` out of the
core entry — a worse trade than a 23 kB gzip dependency.

The ES build emits one module per source file (`preserveModules`), so a
consumer's bundler drops what it does not import; the package marks only CSS as
side-effectful. CJS ships as one bundle per entry instead — `preserveModules`
miscompiles scoped-style SFCs under CJS.

Stylesheets are always yours to import, both ours and a peer's:

```ts
import 'uiwekit/styles.css'
import '@splidejs/vue-splide/css'   // only if you use UiSlider
```

| Artifact | Size | gzip |
| --- | --- | --- |
| `dist/` (all modules, ES) | 288 kB | 64 kB |
| `dist/styles.css` | 157 kB | 26 kB |

All four entries load in plain Node, so SSR does not need a `client-only`
wrapper around the library itself.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm storybook` | Component catalogue and docs |
| `pnpm dev` | Minimal playground app |
| `pnpm build` | Build the library to `dist/` |
| `pnpm typecheck` | `vue-tsc` over the whole source |
| `pnpm gen:icons` | Regenerate icon names from the font stylesheet |

## Differences from the source project

The extraction is not a straight copy. Deliberate changes:

- **No text fonts are bundled.** The source referenced Inter and Montserrat via
  `@font-face`, but those files were never in the repo, so the rules resolved to
  nothing. The family is the `--ui-font-family` token now. The icon font *is*
  bundled — those files are real.
- **`moment` removed from the core.** `useFormat` is imported by nearly every
  component and pulled `moment` in through its `Datetime` entity. The three
  moment calls involved are now inlined, keeping the optional-peer promise
  honest.
- **`vue-router` is optional.** `UiBtn` and `UiLink` detect it at runtime and
  fall back to plain browser navigation.
- **No i18n coupling.** Four components read `vue-i18n` keys directly, which
  required the host to have installed it *with those exact keys present* — a
  coupling a library cannot make. Each is a plain prop now, with an English
  default, so callers localise them:

  | Component | Was | Prop |
  | --- | --- | --- |
  | `UiHelperText` | `$t('ui.errorOccurred')` | `fallbackMessage` |
  | `UiDropdown` | `t('ui.listEmpty')` | `emptyText` |
  | `UiCalendarGridMonths` | `tm('ui.monthsShort')` | `months` |
  | `UiVideo` | `$t('ui.download')` and two more | `downloadText`, `playbackSpeedText`, `aboutFileText` |
- **Electron coupling removed.** The old theme layer called
  `window.api.setTheme`.

### Bugs found and fixed during extraction

The source project excluded `components/ui/**` from type-checking, so this code
had never been checked. Fixing that surfaced 169 type errors across the two
waves (52, then 117) and several real defects:

- `UiText` defaulted `tag` to `'dev'` (typo for `'div'`), rendering an invalid
  element; the `?? 'div'` fallback could never fire.
- `UiInputPassword` was entirely broken: it used Vue 2's `$listeners` (removed
  in Vue 3), rendered a `<ui-icon-font>` component that does not exist anywhere,
  referenced an `--ampere-600` token from a different palette, and called
  `defineComponent({ inheritAttrs: false })` — which builds a throwaway object
  and has no effect — instead of `defineOptions`.
- `usePulsation` split the class attribute with `split('')`, one entry per
  character, so its `includes('pulsed')` check could never be true and the
  ripple never re-bound on a class change. It also leaked its `MutationObserver`
  on unmount.
- `UiPreloader` generated its SVG gradient id with `computed(() => uuidv4())`,
  minting a new id on every re-evaluation and risking a desync between the fill
  reference and the gradient. Now uses Vue's `useId()`, dropping the `uuid`
  dependency.
- `UiMenu`'s animation registry fell back to `animations[0]` — not a real key —
  so an unrecognised `animation` prop returned `undefined`, which the caller
  immediately invoked. Any typo threw a `TypeError`. Falls back to the
  documented slide animation now.
- `UiCensor` never worked: the template binds `v-bind="mainAttrs"` but the
  script defined nothing of that name. `v-bind="undefined"` is a silent no-op,
  so it rendered a bare unstyled `<div>` instead of throwing — which is why it
  went unnoticed. `mainAttrs` is implemented on the same convention as
  `UiAlert`. **It still ships without CSS**, so it does not visually censor
  anything; that needs a `styles.scss` before the component is usable.
- Several touch handlers (`UiSplitPanel`, `UiScrolling`, `UiBottomSheet`,
  `UiFloatWindow`) read `e.touches[0]` behind a length check TypeScript could
  not connect to the index, and would have thrown on an empty `TouchList`.
  Guarded at the point where they previously threw.
- `UiDragAndDrop`'s proxy declared DOM-valued props as `type: HTMLElement`. Vue
  evaluates a prop's `type` constructor when the component is *defined*, so
  merely importing the package in Node threw `ReferenceError: HTMLElement is
  not defined` — every entry was unloadable under SSR. Now
  `Object as PropType<HTMLElement>`, which is the same check at runtime and
  keeps the TypeScript side exact.

### Known defects not fixed

Left alone because fixing them changes runtime behaviour, which was out of
scope for the extraction:

- `UiRange`'s `onMouseUp` removes the `mouseup` listener from the range element,
  but `onMouseDown` registered it on `document` — so the removal is a no-op and
  a listener accumulates per drag. `onBeforeUnmount` does clean up, so it is a
  per-drag leak bounded by the component's lifetime.
- `menu/animations/scale.ts` has typo'd direction keys (`'left-dowm'`,
  `'right-dowm'` vs `-down` everywhere else) and an invalid
  `transformOrigin: 'center tops'`. Scale-animated menus opening down-left or
  down-right miss the map and degrade to the default direction.
- `TDirection` is `typeof DIRECTIONS[number]` over a plain `string[]`, so it
  widens to `string` and provides no key checking for the direction registries —
  which is how the typos above survived. Declaring `DIRECTIONS` `as const` would
  make all three registries exhaustively checked.
- `UiBottomSheet`'s `watch( value, ... )` tests the ref object rather than
  `value.value`, so the condition is always truthy.

## Roadmap

All components from the source project have been extracted — `components/ui/**`
is fully covered. Remaining work is quality rather than coverage: Storybook
stories exist for only a handful of components, and the known defects above
are open.

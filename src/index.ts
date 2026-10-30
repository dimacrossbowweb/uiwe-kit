/**
 * uiwekit — Vue 3 design system.
 *
 * Two ways in:
 *
 *   // 1. Global install
 *   import UiKit from 'uiwekit'
 *   import 'uiwekit/styles.css'
 *   app.use(UiKit)
 *
 *   // 2. Explicit imports (tree-shakable)
 *   import { UiBtn, useTheme } from 'uiwekit'
 *
 * This entry needs `vue` and nothing else. Components requiring an optional
 * peer live behind subpaths, so that installing uiwekit never drags those peers in:
 *
 *   import { UiDatePicker } from 'uiwekit/date'        // needs moment
 *   import { UiSlider } from 'uiwekit/carousel'        // needs @splidejs/*
 *   import { UiEmoji } from 'uiwekit/emoji'            // needs emoji-mart
 */

// Global stylesheet: tokens, both theme palettes, icon font, grid, utilities.
// Imported here so it lands in dist/styles.css next to the component styles —
// without it `import 'uiwekit/styles.css'` shipped no --ui-* tokens at all.
import './styles/main.scss'

// Plugin
export { UiKit, default } from './plugin'
export type { UiPluginOptions } from './plugin'

// Components
export * from './components'

// Theme
export {
  useTheme,
  createTheme,
  setTheme,
  toggleTheme,
  useSystemTheme,
  initTheme,
  themeVersion,
  uiThemeMixin,
  withUiTheme,
  COLOR_TOKENS,
  BASE_TOKENS,
  TOKEN_GROUPS
} from './theme'
export type {
  ThemeName,
  BuiltInTheme,
  UiTheme,
  UseThemeReturn,
  ThemeTokens,
  TokenName,
  ColorToken,
  BaseToken
} from './theme'

// Composables
export { useBem } from './composables/useBem'
export { useCSSVar } from './composables/useCSSVar'
export { useElevation } from './composables/useElevation'
export { useFormat } from './composables/useFormat'
export { useMobile } from './composables/useMobile'
export { usePulsation } from './composables/usePulsation'
export { useAvatar } from './composables/useAvatar'
// `useDate` is deliberately NOT re-exported here: it imports `moment`, an
// optional peer. Re-exporting it would put a hard `moment` import in the main
// entry, so `import { UiBtn }` would fail for anyone who never installed it.
// It is exported from `uiwekit/date` instead, alongside the calendar components
// that are the only things needing it.
export { detectCountryByPhone, toInternationalPhone } from './composables/usePhoneCountry'
export { useCheckpoints } from './composables/useCheckpoints'
export { useMarqueeSelection } from './composables/useMarqueeSelection'
export { useEscapeLayer, hasOpenLayer, ESCAPE_PRIORITY } from './composables/useEscapeLayer'
export type { IEscapeLayerOptions } from './composables/useEscapeLayer'
export { showToast, hideToast, showCopyToast, useToasts, placeToast } from './composables/useToast'
export type {
  TToastType,
  TToastAnchor,
  IToastOptions,
  IToast,
  ICopyToastTexts,
  IToastRect,
  IToastSize,
  IToastPlacement,
  IToastPlacementOptions,
  TToastSide
} from './composables/useToast'
export type { IUseBemResult } from './composables/useBem'

// Directives
export { vFocus } from './directives/focus'
export { vStickyTop } from './directives/sticky-top'
export { vStickyBottom } from './directives/sticky-bottom'
export { vTimeout } from './directives/timeout'

// Utilities
export { getCSSVar, colorByName, edgeFadeStyle, resizeByCorner, parseAspectRatio } from './global/utils'
export type { TEdgeFadeSide, TCorner, ISize, IResizeLimits } from './global/utils'
export type * from './global/types'

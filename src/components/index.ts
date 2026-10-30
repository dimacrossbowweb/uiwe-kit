// Public component surface — the peer-free core.
//
// Components needing an optional peer live in sibling barrels so that this one
// stays importable with `vue` alone: a bundler must link every module a barrel
// re-exports before tree-shaking can drop it, so a single `moment` import here
// would make `moment` mandatory for everyone. See ./date.ts, ./carousel.ts,
// ./emoji.ts.
//
// Exports are explicit rather than glob-based so that consumers importing a
// single component do not pull the whole set into their bundle, and so the
// public names are greppable.

// Layout
export { default as UiContainer } from './container/index.vue'
export { default as UiRow } from './row/index.vue'
export { default as UiCol } from './col/index.vue'
export { default as UiFlex } from './flex/index.vue'
export { default as UiSpace } from './space/index.vue'
export { default as UiDivider } from './divider/index.vue'
export { default as UiSheet } from './sheet/index.vue'

// Typography
export { default as UiText } from './text/index.vue'
export { default as UiLabel } from './label/index.vue'
export { default as UiLink } from './link/index.vue'

// Data display
export { default as UiIcon } from './icon/index.vue'
export { default as UiAvatar } from './avatar/index.vue'
export { default as UiAvatarStack } from './avatar/stack/index.vue'
export { default as UiChip } from './chip/index.vue'
export { default as UiAlert } from './alert/index.vue'
export { default as UiSkeleton } from './skeleton/index.vue'
export { default as UiPreloader } from './preloader/index.vue'
export { default as UiBadge } from './badge/index.vue'
export { default as UiStatus } from './status/index.vue'
export { default as UiStatusBar } from './status-bar/index.vue'

// Card
export { default as UiCard } from './card/index.vue'
export { default as UiCardTitle } from './card/title/index.vue'
export { default as UiCardSubtitle } from './card/subtitle/index.vue'
export { default as UiCardText } from './card/text/index.vue'
export { default as UiCardActions } from './card/actions/index.vue'
export { default as UiCardItem } from './card/item/index.vue'

// Forms
export { default as UiForm } from './form/index.vue'
export { default as UiBtn } from './btn/index.vue'
export { default as UiInput } from './input/index.vue'
export { default as UiInputDate } from './input/date/index.vue'
export { default as UiInputPassword } from './input/password/index.vue'
export { default as UiInputPhone } from './input/phone/index.vue'
export { default as UiInputPin } from './input/pin/index.vue'
export { default as UiInputSearch } from './input/search/index.vue'
export { default as UiTextarea } from './textarea/index.vue'
export { default as UiCheckbox } from './checkbox/index.vue'
export { default as UiRadioButton } from './radio/button/index.vue'
export { default as UiRadioGroup } from './radio/group/index.vue'
export { default as UiSwitch } from './switch/index.vue'
export { default as UiHelperText } from './helper-text/index.vue'
export { default as UiRange } from './range/index.vue'
export { default as UiCircleSlider } from './circle-slider/index.vue'
export { default as UiDropdown } from './dropdown/index.vue'
export { default as UiUploader } from './uploader/index.vue'
export { default as UiDropZone } from './drop-zone/index.vue'
export { default as UiPin } from './pin/index.vue'
export { default as UiColorList } from './color/list/index.vue'

// Structure & layout
export { default as UiApp } from './app/index.vue'
export { default as UiLayout } from './layout/index.vue'
export { default as UiToolbar } from './toolbar/index.vue'
export { default as UiNavigationDrawer } from './navigation-drawer/index.vue'
export { default as UiSplitPanel } from './split-panel/index.vue'
export { default as UiTabs } from './tabs/index.vue'
export { default as UiTabsItem } from './tabs/item.vue'
export { default as UiExpansion } from './expansion/index.vue'

// List
export { default as UiList } from './list/index.vue'
export { default as UiListItem } from './list/item/index.vue'
export { default as UiListTitle } from './list/title/index.vue'
export { default as UiListSubtitle } from './list/subtitle/index.vue'
export { default as UiVirtualList } from './virtual-list/index.vue'

// Overlays
export { default as UiOverlay } from './overlay/index.vue'
export { default as UiDialog } from './dialog/index.vue'
export { default as UiBottomSheet } from './bottom-sheet/index.vue'
export { default as UiMenu } from './menu/index.vue'
export { default as UiSubmenu } from './submenu/index.vue'
export { default as UiContextMenu } from './context-menu/index.vue'
export { default as UiTooltip } from './tooltip/index.vue'
export { default as UiFloatWindow } from './float-window/index.vue'
export { default as UiWindow } from './window/index.vue'
export { default as UiResizeCorners } from './resize-corners/index.vue'
export { default as UiToast } from './toast/index.vue'
export { default as UiToastLayer } from './toast/layer/index.vue'

// Media
export { default as UiImage } from './image/index.vue'
export { default as UiImageGrid } from './image-grid/index.vue'
export { default as UiVideo } from './video/index.vue'
export { default as UiAudio } from './audio/index.vue'

// Interaction & motion
export { default as UiHover } from './hover/index.vue'
export { default as UiHighlight } from './highlight/index.vue'
export { default as UiTransition } from './transition/index.vue'
export { default as UiRing } from './ring/index.vue'
export { default as UiCensor } from './censor/index.vue'
export { default as UiScroll } from './scroll/index.vue'
export { default as UiScrolling } from './scrolling/index.vue'
export { default as UiScrollbar } from './scrollbar/index.vue'
export { default as UiDragAndDrop } from './drag-and-drop/index.vue'
export { default as UiMarqueeSelection } from './marquee-selection/index.vue'

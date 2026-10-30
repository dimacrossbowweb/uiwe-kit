import { shallowRef, readonly } from 'vue'
import type { IToastRect } from './placement'

export { placeToast } from './placement'
export type { IToastRect, IToastSize, IToastPlacement, IToastPlacementOptions, TToastSide } from './placement'

export type TToastType = 'info' | 'success' | 'error'

/**
 * What to pin the toast to: an element ( its rect is taken at show time ), a
 * ready rect, or a point — e.g. the click position. Without an anchor the toast
 * sits at the bottom centre of the window.
 */
export type TToastAnchor = Element | IToastRect | { x: number; y: number } | null | undefined

export interface IToastOptions {
  text:      string
  type?:     TToastType
  /** ui-icon glyph name. Defaults to one picked by `type`; pass '' for no icon. */
  icon?:     string
  anchor?:   TToastAnchor
  /** How long the toast stays, in ms. */
  duration?: number
}

export interface IToast {
  id:       number
  text:     string
  type:     TToastType
  icon:     string
  /** Anchor rect in viewport coordinates, captured at show time; null — no anchor. */
  anchor:   IToastRect | null
  duration: number
}

const DEFAULT_DURATION = 2000

// Glyphs from the bundled `ui` icon font. It has no "info" glyph, so info
// toasts are text-only unless an icon is passed explicitly.
const DEFAULT_ICONS: Record<TToastType, string> = {
  info:    '',
  success: 'check',
  error:   'error',
}

// Module-level state: there is one toast layer per app, and toasts need to be
// raised from anywhere — components, stores, menu handlers — without setup().
const toasts = shallowRef<IToast[]>( [] )
const timers = new Map<number, ReturnType<typeof setTimeout>>()

let counter = 0

function toRect( anchor: TToastAnchor ): IToastRect | null {
  if ( !anchor ) return null

  if ( typeof Element !== 'undefined' && anchor instanceof Element ) {
    // The element is already gone from the DOM ( a closed menu ): its rect is
    // all zeros and meaningless — better centred than in the top-left corner.
    if ( !anchor.isConnected ) return null
    const r = anchor.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  }

  if ( 'x' in anchor && 'y' in anchor && !( 'width' in anchor ) ) {
    return { left: anchor.x, top: anchor.y, width: 0, height: 0 }
  }

  return anchor as IToastRect
}

/** Hide a toast before its time is up. */
export function hideToast( id: number ): void {
  const timer = timers.get( id )
  if ( timer ) clearTimeout( timer )
  timers.delete( id )
  toasts.value = toasts.value.filter( t => t.id !== id )
}

/**
 * Show a toast. A new toast replaces the current one, so a burst of "Copied"
 * toasts never stacks up or overlaps. Requires a `<ui-toast-layer />` mounted
 * once somewhere in the app to render.
 *
 * @returns the toast id, for `hideToast()`.
 *
 * @example
 *   showToast( { text: 'Link copied', type: 'success', anchor: linkEl } )
 */
export function showToast( options: IToastOptions ): number {
  for ( const t of toasts.value ) hideToast( t.id )

  const type = options.type ?? 'info'

  const toast: IToast = {
    id:       ++counter,
    text:     options.text,
    type,
    icon:     options.icon ?? DEFAULT_ICONS[ type ],
    anchor:   toRect( options.anchor ),
    duration: options.duration ?? DEFAULT_DURATION,
  }

  toasts.value = [ ...toasts.value, toast ]
  timers.set( toast.id, setTimeout( () => hideToast( toast.id ), toast.duration ) )

  return toast.id
}

/** Texts for `showCopyToast`. */
export interface ICopyToastTexts {
  /** Shown when copying succeeded. Default: 'Copied'. */
  success?: string
  /** Shown when copying failed. Default: "Couldn't copy". */
  error?:   string
}

/**
 * Report a clipboard copy result next to whatever was copied: "Copied" or
 * "Couldn't copy".
 *
 * The defaults are English — callers localise by passing `texts`
 * ( e.g. `{ success: t( 'toast.copied.link' ), error: t( 'toast.copyFailed' ) }` ).
 *
 * @example
 *   showCopyToast( await copy( url ), linkEl, { success: 'Link copied' } )
 */
export function showCopyToast( ok: boolean, anchor?: TToastAnchor, texts: ICopyToastTexts = {} ): number {
  return ok
    ? showToast( { text: texts.success ?? 'Copied', type: 'success', icon: 'copy', anchor } )
    : showToast( { text: texts.error ?? 'Couldn\'t copy', type: 'error', anchor } )
}

/** Reactive toast list for the toast layer, plus show / hide. */
export function useToasts() {
  return {
    toasts: readonly( toasts ),
    show:   showToast,
    hide:   hideToast,
  }
}

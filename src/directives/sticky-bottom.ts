import type { DirectiveBinding } from 'vue'

type PinnedCallback = ( pinned: boolean ) => void

// An offset below this is sub-pixel layout noise, not pinning.
const PINNED_EPS = 1

// How long a new pinned state must hold before it is announced. A container
// resize briefly shifts the layout ( the content has not caught up with the
// bottom yet ); without the delay the element would flicker pinned/unpinned
// on every resize.
const PINNED_SETTLE_MS = 120

// How many consecutive still frames end the per-frame tracking.
const STILL_FRAMES = 3

// Usage: `v-sticky-bottom="onPinned"` where `onPinned = (p: boolean) => {...}`.
// The directive calls it on every pinned/unpinned change and mirrors the state
// into `data-sticky-pinned="true|false"` so CSS can react without a callback
// ( the attribute is absent until the first change ).
// (A bare ref can't be used — templates auto-unwrap top-level refs, so the
// directive would receive the boolean value, not the ref to write back to.)
//
// `v-sticky-bottom="false"` disables sticking: the element stays in its natural
// place. Useful while a layout is still settling ( group heights and positions
// change, and sticking would replay every change ). Switching to true enables
// it from the current position.
type StickyValue = PinnedCallback | boolean | undefined

export const vStickyBottom = {
  mounted( el: HTMLElement, binding: DirectiveBinding<StickyValue> ): void {
    const scroller = el.closest( '.ui-scroll' ) as HTMLElement | null
    if ( !scroller ) return

    const onPinned = typeof binding.value === 'function' ? binding.value : null

    let enabled = binding.value !== false
    let prevTranslate = 0
    let prevPinned = false
    let wantPinned = false
    let settleTimer = 0
    let stillFrames = 0
    let raf = 0

    function commitPinned(): void {
      settleTimer = 0
      if ( wantPinned === prevPinned ) return

      prevPinned = wantPinned
      el.setAttribute( 'data-sticky-pinned', String( wantPinned ) )
      if ( onPinned ) onPinned( wantPinned )
    }

    function update(): void {
      raf = 0
      const container = el.parentElement
      if ( !container ) return

      if ( !enabled ) {
        if ( prevTranslate ) { prevTranslate = 0; el.style.transform = '' }
        return
      }

      const elRect = el.getBoundingClientRect()
      const scRect = scroller!.getBoundingClientRect()
      const cbRect = container.getBoundingClientRect()

      // Back out the previously applied translate to recover natural top.
      const naturalTop = elRect.top - prevTranslate

      const candidate = Math.min( naturalTop, scRect.bottom - elRect.height )
      const finalTop  = Math.max( cbRect.top, candidate )
      const translate = finalTop - naturalTop

      const moved = translate !== prevTranslate
      if ( moved ) {
        prevTranslate = translate
        el.style.transform = translate ? `translateY(${ translate }px)` : ''
      }

      // `translate` changes every frame while pinned — only a settled state
      // change is reported. The attribute is for CSS ( animations ); it is
      // absent until the first change, so an "unpin" animation does not play
      // on mount.
      wantPinned = Math.abs( translate ) > PINNED_EPS
      if ( wantPinned === prevPinned ) {
        if ( settleTimer ) { clearTimeout( settleTimer ); settleTimer = 0 }
      } else if ( !settleTimer ) {
        settleTimer = window.setTimeout( commitPinned, PINNED_SETTLE_MS )
      }

      // The scroll event fires once, but the scroller's transform may still be
      // animating during smooth scrolling — track frame by frame until it stops.
      stillFrames = moved ? 0 : stillFrames + 1
      if ( stillFrames < STILL_FRAMES ) raf = requestAnimationFrame( update )
    }

    function schedule(): void {
      stillFrames = 0
      if ( raf ) return
      raf = requestAnimationFrame( update )
    }

    scroller.addEventListener( 'ui-scroll', schedule )
    schedule() // initial pass

    // Layout can change without scrolling: in an index-keyed list the same node
    // may be reused for different content with a different height, while the
    // offset still reflects the old one. Watch the parent's size — it changes
    // exactly at such moments — so the element doesn't sit misplaced until the
    // next scroll event.
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver( schedule ) : null
    if ( resize && el.parentElement ) resize.observe( el.parentElement )

    const state = el as unknown as StickyEl
    state.__stickyBottomSchedule = schedule
    state.__stickyBottomEnable = ( next: boolean ) => { enabled = next }
    state.__stickyBottomCleanup = () => {
      scroller.removeEventListener( 'ui-scroll', schedule )
      resize?.disconnect()
      if ( raf ) cancelAnimationFrame( raf )
      if ( settleTimer ) clearTimeout( settleTimer )
    }
  },
  // The node was re-patched with new data ( reused for other content ) — recompute.
  updated( el: HTMLElement, binding: DirectiveBinding<StickyValue> ): void {
    const state = el as unknown as StickyEl
    state.__stickyBottomEnable?.( binding.value !== false )
    state.__stickyBottomSchedule?.()
  },
  unmounted( el: HTMLElement ): void {
    ;( el as unknown as StickyEl ).__stickyBottomCleanup?.()
  },
}

interface StickyEl {
  __stickyBottomSchedule?: () => void
  __stickyBottomEnable?:   ( enabled: boolean ) => void
  __stickyBottomCleanup?:  () => void
}

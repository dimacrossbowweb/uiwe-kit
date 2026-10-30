import type { DirectiveBinding } from 'vue'

type PinnedCallback = ( pinned: boolean ) => void

// Usage: `v-sticky-top="onPinned"` where `onPinned = (p: boolean) => {...}`.
// The directive calls it with `true` while the element is actually pinned.
// (A bare ref can't be used — templates auto-unwrap top-level refs, so the
// directive would receive the boolean value, not the ref to write back to.)
export const vStickyTop = {
  mounted( el: HTMLElement, binding: DirectiveBinding<PinnedCallback | undefined> ): void {
    const scroller = el.closest( '.ui-scroll' ) as HTMLElement | null
    if ( !scroller ) return

    el.setAttribute( 'data-sticky-top', '' )

    const onPinned = typeof binding.value === 'function' ? binding.value : null

    let prevTranslate = 0
    let raf = 0

    function update(): void {
      raf = 0

      const elRect = el.getBoundingClientRect()
      const scRect = scroller!.getBoundingClientRect()
      const naturalTop = elRect.top - prevTranslate

      // Find the closest sibling sticky element whose natural top is below
      // ours — that's the one that may eventually shove this header out.
      let nextNaturalTop = Infinity
      const all = Array.from( scroller!.querySelectorAll<HTMLElement>( '[data-sticky-top]' ) )
      for ( const other of all ) {
        if ( other === el ) continue
        const otherRect = other.getBoundingClientRect()
        const otherPrev = Number( other.dataset.stickyTopTranslate ?? '0' )
        const otherNatural = otherRect.top - otherPrev
        if ( otherNatural > naturalTop && otherNatural < nextNaturalTop ) {
          nextNaturalTop = otherNatural
        }
      }

      const candidate = Math.max( naturalTop, scRect.top )
      const finalTop  = Math.min( candidate, nextNaturalTop - elRect.height )
      const translate = finalTop - naturalTop

      if ( translate !== prevTranslate ) {
        prevTranslate = translate
        el.dataset.stickyTopTranslate = String( translate )
        el.style.transform = translate ? `translateY(${ translate }px)` : ''
        if ( onPinned ) onPinned( translate !== 0 )
      }
    }

    function schedule(): void {
      if ( raf ) return
      raf = requestAnimationFrame( update )
    }

    scroller.addEventListener( 'ui-scroll', schedule )
    schedule() // initial pass

    ;( el as unknown as { __stickyTopCleanup?: () => void } ).__stickyTopCleanup = () => {
      scroller.removeEventListener( 'ui-scroll', schedule )
      if ( raf ) cancelAnimationFrame( raf )
      el.removeAttribute( 'data-sticky-top' )
      delete el.dataset.stickyTopTranslate
    }
  },
  unmounted( el: HTMLElement ): void {
    ;( el as unknown as { __stickyTopCleanup?: () => void } ).__stickyTopCleanup?.()
  },
}

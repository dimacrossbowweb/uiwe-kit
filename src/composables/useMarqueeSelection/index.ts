import { type Ref, ref, onUnmounted } from 'vue'
import { useEventListener } from '@vueuse/core'

interface MarqueeSelectionOptions {
  onSelect?: (rect: { x: number; y: number; width: number; height: number }) => void
  onSelectionMove?: (rect: { x: number; y: number; width: number; height: number }) => void
  onSelectionStart?: () => void
  onSelectionEnd?: () => void
  disabled?: boolean
  threshold?: number
  /**
   * Elements whose text the user is allowed to select with the mouse. Pressing
   * inside one hands the drag to the browser's native selection instead of
   * starting a marquee; the marquee takes over only once the pointer leaves it.
   * Pass '' to disable the handover and marquee everything.
   */
  textSelector?: string
}

export function useMarqueeSelection(
  el: Ref<HTMLElement | null>,
  options: MarqueeSelectionOptions = {}
) {
  const {
    onSelect,
    onSelectionMove,
    onSelectionStart,
    onSelectionEnd,
    disabled = false,
    threshold = 100,
    textSelector = '[data-copy-text]'
  } = options

  const isSelecting = ref(false)
  const startPoint = ref({ x: 0, y: 0 })
  const selectionRect = ref({ x: 0, y: 0, width: 0, height: 0 })

  // A press that landed on selectable text. The browser is running its own
  // drag-to-select; we hold the origin so the marquee can start from the real
  // mousedown point if the pointer wanders out of that text.
  let pending: { clientX: number; clientY: number; root: HTMLElement } | null = null

  const getElementRect = () => {
    if (!el.value) return null
    return el.value.getBoundingClientRect()
  }

  // Coordinates come straight from the MouseEvent (viewport-space `clientX/Y`),
  // matching `getBoundingClientRect`. Reading a reactive pointer (e.g. useMouse)
  // instead would be stale on the very first mousedown — before any mousemove
  // has updated it — which drew the first marquee from the top of the content.
  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    const elementRect = getElementRect()
    if (!elementRect) return { x: 0, y: 0 }

    return {
      x: Math.max(0, Math.min(clientX - elementRect.left, elementRect.width)),
      y: Math.max(0, Math.min(clientY - elementRect.top, elementRect.height))
    }
  }

  const updateSelectionRect = (clientX: number, clientY: number) => {
    const elementRect = getElementRect()
    if (!elementRect) return

    const current = getRelativeCoordinates(clientX, clientY)

    const x = Math.min(startPoint.value.x, current.x)
    const y = Math.min(startPoint.value.y, current.y)
    const width = Math.abs(current.x - startPoint.value.x)
    const height = Math.abs(current.y - startPoint.value.y)

    selectionRect.value = { x, y, width, height }
  }

  const endSelection = () => {
    if (!isSelecting.value) return

    const area = selectionRect.value.width * selectionRect.value.height

    if (onSelect && area >= threshold) {
      onSelect(selectionRect.value)
    }

    onSelectionEnd?.()
    isSelecting.value = false
    selectionRect.value = { x: 0, y: 0, width: 0, height: 0 }
  }

  /** Opens a marquee anchored at a viewport point. */
  const beginSelection = (clientX: number, clientY: number): void => {
    // Never leave a text highlight standing behind a message selection — two
    // simultaneous selections read as a glitch, and the copy action would have
    // to guess which one the user meant.
    window.getSelection()?.removeAllRanges()

    const relative = getRelativeCoordinates(clientX, clientY)

    startPoint.value = relative

    isSelecting.value = true
    selectionRect.value = { x: relative.x, y: relative.y, width: 0, height: 0 }
    onSelectionStart?.()
  }

  const onMouseDown = (e: MouseEvent) => {
    pending = null

    if (disabled) return
    if (e.button !== 0) return

    const elementRect = getElementRect()
    if (!elementRect) return

    // Only begin a marquee when the press actually lands on the container (or a
    // descendant). The geometric hit-test below would otherwise also fire for
    // elements layered *over* the feed but living elsewhere in the DOM — e.g. a
    // modal panel teleported to <body> and centred above the feed — and the
    // preventDefault() further down would then rob that overlay's inputs of
    // focus (a clicked textarea never receives the caret).
    if (!el.value || !el.value.contains(e.target as Node)) return

    // Interactive controls inside the feed (checkboxes, buttons, links) opt out
    // of the marquee by carrying `[data-marquee-ignore]`: pressing them must
    // neither start a selection nor fire `selectionStart` (which would reset the
    // current set out from under a click that's about to toggle one item).
    if ((e.target as HTMLElement)?.closest?.('[data-marquee-ignore]')) return

    const isInside =
      e.clientX >= elementRect.left &&
      e.clientX <= elementRect.right &&
      e.clientY >= elementRect.top &&
      e.clientY <= elementRect.bottom

    if (!isInside) return

    // Pressing inside a copyable text block means "select these words", so the
    // marquee stands down and lets the browser do it — preventDefault() here is
    // exactly what used to make message text unselectable. We only remember
    // where the press started; onMouseMove promotes it to a marquee if the
    // pointer leaves the text, which is unambiguously "select messages".
    const textRoot = textSelector
      ? ((e.target as HTMLElement)?.closest?.(textSelector) as HTMLElement | null)
      : null

    if (textRoot) {
      pending = { clientX: e.clientX, clientY: e.clientY, root: textRoot }
      return
    }

    e.preventDefault()

    beginSelection(e.clientX, e.clientY)
  }

  /** True while the pointer is still over the text block the press started in. */
  const isOverPending = (clientX: number, clientY: number): boolean => {
    if (!pending) return false

    const r = pending.root.getBoundingClientRect()

    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
  }

  const onMouseMove = (e: MouseEvent) => {
    if (disabled) return

    if (pending) {
      if (isOverPending(e.clientX, e.clientY)) return

      // Left the text mid-drag: switch to selecting messages, anchored at the
      // original press so the rect covers the ground already dragged over.
      const origin = pending
      pending = null

      beginSelection(origin.clientX, origin.clientY)
    }

    if (!isSelecting.value) return

    updateSelectionRect(e.clientX, e.clientY)

    const area = selectionRect.value.width * selectionRect.value.height
    if (onSelectionMove && area >= threshold) {
      onSelectionMove(selectionRect.value)
    }
  }

  const onMouseUp = () => {
    pending = null

    if (!isSelecting.value) return
    endSelection()
  }

  useEventListener(window, 'mousedown', onMouseDown)
  useEventListener(window, 'mousemove', onMouseMove)
  useEventListener(window, 'mouseup', onMouseUp)

  onUnmounted(() => {
    if (isSelecting.value) {
      endSelection()
    }
  })

  return {
    isSelecting, 
    selectionRect,
    startPoint
  }
};

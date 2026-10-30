import { watch, toValue, onScopeDispose, type MaybeRefOrGetter } from 'vue'

/**
 * Layer priorities. Esc closes the layer with the highest priority, and among
 * equals — the one opened last.
 *
 * `base` — something that should close only when there is nothing else left to
 * close (e.g. an open page-level view). Everything else ( dialogs, menus, modes )
 * lives on `default`.
 */
export const ESCAPE_PRIORITY = {
  base:    -100,
  default: 0,
} as const

interface IEscapeLayer {
  priority: number
  close:    () => void
}

// Module-level: layers from every component stack up in one place — otherwise
// each would listen for Esc on its own and they would all close at once.
const layers: IEscapeLayer[] = []

// Open layers that ignore Esc but still cover the page ( `enabled: false` ).
// Esc skips them, `hasOpenLayer` does not.
const passive = new Set<object>()

let listening = false

function topLayer(): IEscapeLayer | undefined {
  let top: IEscapeLayer | undefined

  // `>=`: with equal priority the one added later wins.
  for (const layer of layers) {
    if (!top || layer.priority >= top.priority) top = layer
  }

  return top
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return

  const top = topLayer()
  if (!top) return

  // Mark the event handled: one key press — one closed layer.
  e.preventDefault()
  top.close()
}

function listen(): void {
  if (listening || typeof window === 'undefined') return
  window.addEventListener('keydown', onKeyDown)
  listening = true
}

/**
 * Whether anything is open above the `base` layer: a dialog, a menu, a mode.
 * Page-level hotkeys can check this so they don't fire underneath a modal.
 */
export function hasOpenLayer(): boolean {
  return passive.size > 0 || layers.some(layer => layer.priority > ESCAPE_PRIORITY.base)
}

export interface IEscapeLayerOptions {
  priority?: number
  /** false — the layer does not react to Esc, even while open ( tooltips ). */
  enabled?:  MaybeRefOrGetter<boolean>
  /**
   * false — the open layer does not cover the page, and `hasOpenLayer` does
   * not see it ( a tooltip ). By default it does, including with `enabled: false`.
   */
  modal?:    MaybeRefOrGetter<boolean>
}

/**
 * Registers a layer closed by Esc while `active` is true.
 *
 * Opening puts the layer on top of the stack; closing it ( any way — a close
 * button, a click outside, Esc itself ) or unmounting the component removes it.
 * Reopening puts it on top again.
 *
 * @example
 *   const value = defineModel( { default: false } )
 *   useEscapeLayer( value, () => { value.value = false } )
 */
export function useEscapeLayer(
  active: MaybeRefOrGetter<boolean>,
  close:  () => void,
  options: IEscapeLayerOptions = {},
): void {

  const { priority = ESCAPE_PRIORITY.default, enabled = true, modal = true } = options

  let layer: IEscapeLayer | null = null

  // This layer's own marker in `passive`: an open layer with Esc switched off.
  const token = {}

  function add(): void {
    if (layer) return
    layer = { priority, close }
    layers.push(layer)
    listen()
  }

  function remove(): void {
    if (!layer) return
    const i = layers.indexOf(layer)
    if (i >= 0) layers.splice(i, 1)
    layer = null
  }

  watch(
    () => !!toValue(active) && !!toValue(enabled),
    (on) => (on ? add() : remove()),
    { immediate: true },
  )

  watch(
    () => !!toValue(active) && !toValue(enabled) && !!toValue(modal),
    (on) => (on ? passive.add(token) : passive.delete(token)),
    { immediate: true },
  )

  onScopeDispose(() => {
    remove()
    passive.delete(token)
  })
}

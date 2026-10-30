export interface IToastRect {
  left:   number
  top:    number
  width:  number
  height: number
}

export interface IToastSize {
  width:  number
  height: number
}

export type TToastSide = 'below' | 'above' | 'inside' | 'center'

export interface IToastPlacement {
  x:    number
  y:    number
  side: TToastSide
}

export interface IToastPlacementOptions {
  /** Gap between the toast and its anchor. */
  gap?:    number
  /** Minimum distance between the toast and the viewport edges. */
  margin?: number
}

function clamp( value: number, min: number, max: number ): number {
  return Math.min( Math.max( value, min ), Math.max( min, max ) )
}

/**
 * Where to put a toast next to its anchor ( e.g. the element that was copied ).
 *
 * - Preferably below, centred on the anchor.
 * - Doesn't fit below — above.
 * - Fits neither ( the anchor is taller than the viewport: a long code block, a
 *   whole feed ) — inside, at the bottom edge of the anchor's visible part.
 * - No anchor — bottom centre of the viewport.
 *
 * The anchor is clipped to the viewport first: an element partly scrolled out
 * should get its toast next to its visible part, not off-screen. Horizontally
 * the toast is always shifted inside the viewport so it is never cut off.
 *
 * Pure function: rectangles in, position out — no DOM access.
 */
export function placeToast(
  anchor:   IToastRect | null,
  size:     IToastSize,
  viewport: IToastSize,
  options:  IToastPlacementOptions = {},
): IToastPlacement {

  const gap    = options.gap    ?? 8
  const margin = options.margin ?? 12

  const maxX = viewport.width  - margin - size.width
  const maxY = viewport.height - margin - size.height

  if ( !anchor ) {
    return {
      x:    clamp( ( viewport.width - size.width ) / 2, margin, maxX ),
      y:    clamp( viewport.height - margin * 4 - size.height, margin, maxY ),
      side: 'center',
    }
  }

  // Visible part of the anchor. An anchor entirely past an edge collapses into
  // a strip at the nearest viewport edge — the toast lands there, not off-screen.
  const top    = clamp( anchor.top, 0, viewport.height )
  const bottom = clamp( anchor.top + anchor.height, 0, viewport.height )
  const left   = clamp( anchor.left, 0, viewport.width )
  const right  = clamp( anchor.left + anchor.width, 0, viewport.width )

  const x = clamp( ( left + right ) / 2 - size.width / 2, margin, maxX )

  const below = bottom + gap
  if ( below + size.height <= viewport.height - margin ) return { x, y: below, side: 'below' }

  const above = top - gap - size.height
  if ( above >= margin ) return { x, y: above, side: 'above' }

  return { x, y: clamp( bottom - gap - size.height, margin, maxY ), side: 'inside' }

}

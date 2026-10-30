/** The corner being dragged: t/b — top/bottom, l/r — left/right. */
export type TCorner = 'tl' | 'tr' | 'bl' | 'br'

export interface ISize {
	width:  number
	height: number
}

export interface IResizeLimits {
	/** Smallest height, px. */
	minHeight: number
	/** Largest width and height, px — the box the window must fit into. */
	maxWidth:  number
	maxHeight: number
}

/**
 * New size of a window with aspect ratio `ratio` ( width / height ) after its
 * `corner` was dragged by `dx`, `dy` from the `start` size. Either axis can
 * drive the resize: whichever gives the larger size wins, so the corner
 * "sticks" to the pointer both horizontally and vertically. The size stays
 * within `limits`, and the aspect ratio is always preserved.
 */
export function resizeByCorner(
	start: ISize,
	dx: number,
	dy: number,
	corner: TCorner,
	ratio: number,
	limits: IResizeLimits,
): ISize {

	// Dragging a left / top corner — the size grows when moving left / up.
	const sx = corner.includes( 'l' ) ? -1 : 1
	const sy = corner.includes( 't' ) ? -1 : 1

	const byWidth  = ( start.width + sx * dx ) / ratio
	const byHeight = start.height + sy * dy

	// Upper bound — whichever hits first: height or width.
	const maxHeight = Math.min( limits.maxHeight, limits.maxWidth / ratio )
	const minHeight = Math.min( limits.minHeight, maxHeight )

	const height = Math.min( Math.max( Math.max( byWidth, byHeight ), minHeight ), maxHeight )

	return { width: height * ratio, height }

}

/** Aspect ratio from CSS notation: `'3/4'`, `'3 / 4'`, `1.5`. Unparseable — undefined. */
export function parseAspectRatio( v: string | number | undefined ): number | undefined {

	if ( v === undefined || v === '' ) return undefined
	if ( typeof v === 'number' ) return v > 0 ? v : undefined

	const [ w, h = '1' ] = v.split( '/' ).map( s => s.trim() )
	const ratio = Number( w ) / Number( h )

	return Number.isFinite( ratio ) && ratio > 0 ? ratio : undefined

}

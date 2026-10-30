/** How close to an edge, px, still counts as having reached it. */
const EDGE_EPSILON = 1

/** Which edges may fade at all. */
export type TEdgeFadeSide = 'both' | 'top' | 'bottom'

/**
 * Inline style for an element carrying the `.edge-fade` class: fades the top
 * and/or bottom edge of a scrollable area, but only where there is still
 * something to scroll past that edge.
 *
 * @param scroll Current scroll offset, px.
 * @param max    Maximum scroll offset, px ( scrollHeight - clientHeight ).
 * @param size   Fade height, px. 0 disables the fade.
 * @param side   Which edges may fade.
 */
export function edgeFadeStyle(
	scroll: number,
	max: number,
	size: number,
	side: TEdgeFadeSide = 'both',
): Record<string, string> {

	const on     = size > 0 && max > EDGE_EPSILON
	const top    = on && side !== 'bottom' && scroll > EDGE_EPSILON
	const bottom = on && side !== 'top' && max - scroll > EDGE_EPSILON

	return {
		'--edge-fade-top':    `${ top ? size : 0 }px`,
		'--edge-fade-bottom': `${ bottom ? size : 0 }px`,
	}

}

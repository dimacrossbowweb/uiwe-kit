/**
 * Flex sizing for one cell of the image grid.
 *
 * Cells are laid out with `flex-grow`/`flex-shrink` proportional to each
 * picture's aspect ratio, so that within a row the heights come out equal and
 * the row fills its container.
 *
 * The catch is that a flex factor below 1 is not "a smaller share": when the
 * factors in a row sum to less than 1, only that fraction of the free space is
 * handed out and the remainder is simply left empty. A lone portrait picture
 * has `ratio = width / height < 1`, so it stopped short of the container's edge and
 * left a strip of background beside it.
 *
 * Every factor is therefore scaled by one constant, chosen to lift the smallest
 * of them to 1. Flex distributes free space by the *relative* size of the
 * factors, so a uniform scale leaves the layout of a multi-picture row exactly
 * as it was, while guaranteeing that any row — down to a single cell — sums to
 * at least 1 and fills its width.
 */

/** Aspect ratio to fall back on before a picture has loaded and been measured. */
const DEFAULT_RATIO = 1;

export interface IGridItemFlex extends Record<string, string> {
	'flex-grow': string;
	'flex-shrink': string;
	'flex-basis': string;
}

/**
 * The constant that lifts the smallest ratio to 1. Ratios at or above 1 need no
 * scaling; a set with no usable ratios yet scales by 1.
 */
export function flexScale( ratios: number[] ): number {

	const usable = ratios.filter( ( r ) => Number.isFinite( r ) && r > 0 );

	if ( !usable.length ) return 1;

	const min = Math.min( ...usable );

	return min < 1 ? 1 / min : 1;

}

/**
 * Inline flex style for the cell at `index`.
 *
 * @example
 *   gridItemFlex( [ 0.625 ], 0, 200 )
 *   // → { 'flex-grow': '1', 'flex-shrink': '1', 'flex-basis': '125px' }
 */
export function gridItemFlex( ratios: number[], index: number, base: number ): IGridItemFlex {

	const ratio = ratios[ index ] || DEFAULT_RATIO;
	const scale = flexScale( ratios );

	const factor = ( ratio * scale ).toString();

	return {

		'flex-grow': factor,
		'flex-shrink': factor,

		// The cell's "natural" width at the base row height — unscaled, since
		// this one is a length rather than a share.
		'flex-basis': `${ ratio * base }px`,

	};

}

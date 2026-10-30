/**
 * Whether white or black text reads better on an `r, g, b` ( 0..255 ) fill.
 *
 * Uses APCA ( the contrast model from the WCAG 3 draft ): the perceived
 * contrast of each candidate against the background is computed and the larger
 * wins. Not "background brightness vs. mid-scale": perception is non-linear,
 * and that heuristic ( like WCAG 2 contrast ) picks black on saturated mid
 * tones — red, blue — where white is noticeably more legible.
 *
 * https://github.com/Myndex/SAPC-APCA — constants 0.0.98G-4g.
 */
export function prefersWhiteText( r: number, g: number, b: number ): boolean {

	const bg = luminance( r, g, b )

	return lightness( 1, bg ) > lightness( 0, bg )

}

/** Screen luminance Y of an sRGB 0..255 colour, per APCA, with a soft clamp for darks. */
function luminance( r: number, g: number, b: number ): number {

	const y = 0.2126729 * ( r / 255 ) ** 2.4
		+ 0.7151522 * ( g / 255 ) ** 2.4
		+ 0.0721750 * ( b / 255 ) ** 2.4

	// Screens and eyes behave differently near black — APCA softly lifts the floor.
	return y > 0.022 ? y : y + ( 0.022 - y ) ** 1.414

}

/** Absolute Lc contrast of text with luminance `text` on a background of luminance `bg`. */
function lightness( text: number, bg: number ): number {

	const sapc = bg > text
		// Dark text on a light background.
		? ( bg ** 0.56 - text ** 0.57 ) * 1.14
		// Light text on a dark background.
		: ( bg ** 0.65 - text ** 0.62 ) * 1.14

	if ( Math.abs( sapc ) < 0.1 ) return 0

	return Math.abs( sapc ) - 0.027

}

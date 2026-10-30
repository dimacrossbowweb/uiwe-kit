import { ColorBase } from './color-base';
import { ColorRgb } from './color-rgb';
import { ColorHex } from './color-hex';
import { ColorHsl } from './color-hsl';
import { ColorRegister } from './color-register';
import { ColorKeyword } from './color-keyword';
import { type TColorFormat } from '../../types/color';

export class Color extends ColorBase {

	constructor( format: string ) {

		super( 'color' );

		try {

			if ( typeof format !== 'string' ) {

				throw new Error( '[Color.constructor] :: invalid format' );

			}

			this.format = format;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	static validate( value: string ): boolean {

		return ColorRegister.validate( value ) ||
			   ColorRgb.validate( value ) ||
			   ColorHex.validate( value ) ||
			   ColorHsl.validate( value );

	}

	static parse( value: string, format?: TColorFormat ): Color {

		if ( typeof value !== 'string' ) {

			throw new Error( '[Color.parse] invalid value. Expected string' );

		}

		let parsed: Color;

		if ( ColorKeyword.validate( value ) ) {

			parsed = ColorKeyword.parse( value ) as unknown as Color;

		}

		else if ( ColorRegister.validate( value ) ) {

			parsed = ColorRegister.parse( value ) as unknown as Color;

		}

		else if ( ColorRgb.validate( value ) ) {

			parsed = ColorRgb.parse( value ) as unknown as Color;

		}

		else if ( ColorHex.validate( value ) ) {

			parsed = ColorHex.parse( value ) as unknown as Color;

		}

		else if ( ColorHsl.validate( value ) ) {

			parsed = ColorHsl.parse( value ) as unknown as Color;

		}

		else {

			parsed = new ColorRgb( 0, 0, 0, 0 ) as unknown as Color;

		}

		return format ? Color.convert( parsed, format ) : parsed;

	}

	/**
	 * Coerces any parsed colour into `format`, preserving its alpha channel.
	 * Non-convertible colours (keywords like `transparent` / `currentColor`)
	 * are returned unchanged.
	 */
	static convert( color: Color, format: TColorFormat ): Color {

		const c = Color.toComponents( color as unknown as ColorBase );

		if ( !c ) return color;

		if ( format === 'rgb' ) {

			const out = new ColorRgb( c.r, c.g, c.b );
			if ( c.a !== undefined ) out.a = c.a;
			return out as unknown as Color;

		}

		if ( format === 'hex' ) {

			const out = new ColorHex( c.r, c.g, c.b );
			if ( c.a !== undefined ) out.a = c.a;
			return out as unknown as Color;

		}

		const { h, s, l } = Color.rgbToHsl( c.r, c.g, c.b );
		const out = new ColorHsl( h, s, l );
		if ( c.a !== undefined ) out.a = c.a;
		return out as unknown as Color;

	}

	/** Extracts normalised `{ r, g, b, a }` (a in 0..1 or undefined) from any
	 *  colour, or null when it carries no RGB channels (keywords). */
	private static toComponents( color: ColorBase ): ( { r: number; g: number; b: number; a?: number } | null ) {

		if ( color instanceof ColorHsl ) {

			const { r, g, b } = Color.hslToRgb( color.h, color.s, color.l );
			return { r, g, b, a: Color.normalizeAlpha( color.a ) };

		}

		if ( color instanceof ColorRgb || color instanceof ColorHex ) {

			return { r: color.r, g: color.g, b: color.b, a: Color.normalizeAlpha( color.a ) };

		}

		return null;

	}

	/** Clamps a raw alpha to 0..1; treats legacy opaque markers (e.g. hex 255)
	 *  and non-numbers as "no alpha". */
	private static normalizeAlpha( a?: number ): ( number | undefined ) {

		if ( typeof a !== 'number' ) return undefined;
		if ( a < 0 ) return 0;
		if ( a > 1 ) return undefined;
		return a;

	}

	private static hslToRgb( h: number, s: number, l: number ): { r: number; g: number; b: number } {

		const hue = ( ( ( h % 360 ) + 360 ) % 360 ) / 360;

		if ( s === 0 ) {

			const v = Math.round( l * 255 );
			return { r: v, g: v, b: v };

		}

		const q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
		const p = 2 * l - q;

		const conv = ( t: number ): number => {

			if ( t < 0 ) t += 1;
			if ( t > 1 ) t -= 1;
			if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
			if ( t < 1 / 2 ) return q;
			if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
			return p;

		};

		return {
			r: Math.round( conv( hue + 1 / 3 ) * 255 ),
			g: Math.round( conv( hue ) * 255 ),
			b: Math.round( conv( hue - 1 / 3 ) * 255 ),
		};

	}

	private static rgbToHsl( r: number, g: number, b: number ): { h: number; s: number; l: number } {

		const rr = r / 255, gg = g / 255, bb = b / 255;
		const max = Math.max( rr, gg, bb ), min = Math.min( rr, gg, bb );
		const l = ( max + min ) / 2;

		let h = 0, s = 0;

		if ( max !== min ) {

			const d = max - min;
			s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );

			switch ( max ) {

				case rr: h = ( gg - bb ) / d + ( gg < bb ? 6 : 0 ); break;
				case gg: h = ( bb - rr ) / d + 2; break;
				default: h = ( rr - gg ) / d + 4; break;

			}

			h /= 6;

		}

		return { h: Math.round( h * 360 ), s, l };

	}

}

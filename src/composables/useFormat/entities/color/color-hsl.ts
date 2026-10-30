import { ColorBase } from './color-base';
import { type IColorHsl } from '../../types/color';

export class ColorHsl extends ColorBase implements IColorHsl {

	h!: number;
	s!: number;
	l!: number;
	a!: number;

	constructor( h: number, s: number, l: number, a?: number ) {

		super( 'hsl' );

		try {

			if ( typeof h !== 'number' || h < 0 || h > 360 ) {

				throw new Error( '[ColorHsl.constructor] :: invalid h.' );

			}

			if ( typeof s !== 'number' || s < 0 || s > 1 ) {

				throw new Error( '[ColorHsl.constructor] :: invalid s.' );

			}

			if ( typeof l !== 'number' || l < 0 || l > 1 ) {

				throw new Error( '[ColorHsl.constructor] :: invalid l.' );

			}

			this.h = h;
			this.s = s;
			this.l = l;

			if ( a ) { this.a = a }

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	override opacity( alpha: number ): ColorHsl {

		const color = new ColorHsl( this.h, this.s, this.l );
		color.a = Math.min( 1, Math.max( 0, alpha ) );
		return color;

	}

	static validate( value: string ): boolean {

		return /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(,\s*(\d*(?:\.\d+)?)\s*)?\)$/.test( value );

	}

	static parse( value: string ): ColorHsl {

		let match = value.match( /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(,\s*(\d*(?:\.\d+)?)\s*)?\)$/ );

		if ( !match ) {

			throw new Error( '[ColorHsl.parse] invalid HSL color format' );

		}

		let h: number = parseInt( match[ 1 ]!, 10 );
		let s: number = parseInt( match[ 2 ]!, 10 );
		let l: number = parseInt( match[ 3 ]!, 10 );
		let a: number = match[ 5 ] ? parseFloat( match[ 5 ] ) : 1;

		return new ColorHsl( h, s, l, a );

	}

	/** A random colour; with `keyword`, always the same colour for that string. */
	static random( keyword?: string ): ColorHsl {

		const rnd = ColorHsl.generator( keyword );

		const h: number = Math.floor( rnd() * 361 );
		const s: number = rnd();
		const l: number = rnd();

		return new ColorHsl( h, s, l );

	}

	toString(): string {

		// `s`/`l` are stored as 0..1; CSS wants percentages.
		const s = Math.round( this.s * 100 );
		const l = Math.round( this.l * 100 );

		return ( this.a === undefined || this.a >= 1 )
			? `hsl(${ this.h }, ${ s }%, ${ l }%)`
			: `hsla(${ this.h }, ${ s }%, ${ l }%, ${ this.a })`;

	}

}

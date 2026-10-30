import { ColorBase } from './color-base';
import { prefersWhiteText } from './contrast';
import { type IColorHex } from '../../types/color';

export class ColorHex extends ColorBase implements IColorHex {

	r!: number;
	g!: number;
	b!: number;
	a!: number;

	constructor( r: number, g: number, b: number, a?: number ) {

		super( 'hex' );

		try {

			if ( typeof r !== 'number' || r < 0 || r > 255 ) {

				throw new Error( '[ColorHex.constructor] :: invalid r.' );

			}

			if ( typeof g !== 'number' || g < 0 || g > 255 ) {

				throw new Error( '[ColorHex.constructor] :: invalid g.' );

			}

			if ( typeof b !== 'number' || b < 0 || b > 255 ) {

				throw new Error( '[ColorHex.constructor] :: invalid b.' );

			}

			this.r = r;
			this.g = g;
			this.b = b;

			if ( a ) { this.a = a }

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	override contrast(): ColorHex {

		return prefersWhiteText( this.r, this.g, this.b )
			? new ColorHex( 255, 255, 255, 1 )
			: new ColorHex( 0, 0, 0, 1 );

	}

	override brightness( amount: number | string ): ColorHex {

		const factor = ColorHex.brightnessFactor( amount );
		const scale = ( n: number ): number => ColorHex.brightnessChannel( n, factor );

		const color = new ColorHex( scale( this.r ), scale( this.g ), scale( this.b ) );
		// Assign directly so alpha === 0 is preserved.
		color.a = this.a;
		return color;

	}

	override opacity( alpha: number ): ColorHex {

		const color = new ColorHex( this.r, this.g, this.b );
		color.a = Math.min( 1, Math.max( 0, alpha ) );
		return color;

	}

	static validate( value: string ): boolean {

		return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test( value );

	}

	static parse( value: string ): ColorHex {

		let match: ( RegExpMatchArray | null ) = value.match( /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/ );

		if ( !match ) {

			throw new Error( '[ColorHex.parse] invalid HEX color format' );

		}

		let hex = value.replace( '#', '' );
		let a: number = 255;

		if ( hex.length === 3 ) {

			hex = hex.split( '' ).map( x => x + x ).join( '' );

		} else if ( hex.length === 4 ) {

			hex = hex.split( '' ).map( x => x + x ).join( '' );
			a = parseFloat( ( parseInt( hex.slice( 6, 8 ), 16 ) / 255 ).toFixed( 1 ) );

		} else if ( hex.length === 8 ) {

			a = parseFloat( ( parseInt( hex.slice( 6, 8 ), 16 ) / 255 ).toFixed( 1 ) );

		}

		let bigint = parseInt( hex.slice( 0, 6 ), 16 );
		let r: number = ( bigint >> 16 ) & 255;
		let g: number = ( bigint >> 8 ) & 255;
		let b: number = bigint & 255;

		return new ColorHex( r, g, b, a );

	}

	/** A random colour; with `keyword`, always the same colour for that string. */
	static random( keyword?: string ): ColorHex {

		const rnd = ColorHex.generator( keyword );

		const r: number = Math.floor( rnd() * 256 );
		const g: number = Math.floor( rnd() * 256 );
		const b: number = Math.floor( rnd() * 256 );

		return new ColorHex( r, g, b );

	}

	toString(): string {

		const hex = ( n: number ): string => Math.round( Math.min( 255, Math.max( 0, n ) ) ).toString( 16 ).padStart( 2, '0' );

		const base = `#${ hex( this.r ) }${ hex( this.g ) }${ hex( this.b ) }`;

		// Alpha only when it's a real fractional channel (0..1). Legacy opaque
		// values (a === 255 from a 6-digit parse) collapse to the plain #rrggbb.
		return ( this.a === undefined || this.a >= 1 )
			? base
			: base + hex( this.a * 255 );

	}

}

import { ColorBase } from './color-base';
import { prefersWhiteText } from './contrast';
import { type IColorRgb } from '../../types/color';

export class ColorRgb extends ColorBase implements IColorRgb {

	r!: number;
	g!: number;
	b!: number;
	a!: number;

	constructor( r: number, g: number, b: number, a?: number ) {

		super( 'rgb' );

		try {

			if ( typeof r !== 'number' || r < 0 || r > 255 ) {

				throw new Error( '[ColorRgb.constructor] :: invalid r.' );

			}

			if ( typeof g !== 'number' || g < 0 || g > 255 ) {

				throw new Error( '[ColorRgb.constructor] :: invalid g.' );

			}

			if ( typeof b !== 'number' || b < 0 || b > 255 ) {

				throw new Error( '[ColorRgb.constructor] :: invalid b.' );

			}

			this.r = r;
			this.g = g;
			this.b = b;

			if ( a ) { this.a = a }

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	override contrast (): ColorRgb {

		return prefersWhiteText( this.r, this.g, this.b )
			? new ColorRgb( 255, 255, 255, 1 )
			: new ColorRgb( 0, 0, 0, 1 );

	}

	override brightness( amount: number | string ): ColorRgb {

		const factor = ColorRgb.brightnessFactor( amount );
		const scale = ( n: number ): number => ColorRgb.brightnessChannel( n, factor );

		const color = new ColorRgb( scale( this.r ), scale( this.g ), scale( this.b ) );
		// Assign directly so alpha === 0 is preserved.
		color.a = this.a;
		return color;

	}

	override opacity( alpha: number ): ColorRgb {

		const color = new ColorRgb( this.r, this.g, this.b );
		// Assign directly so alpha === 0 is preserved (the constructor's `if ( a )`
		// guard would drop a falsy 0).
		color.a = Math.min( 1, Math.max( 0, alpha ) );
		return color;

	}

	static validate( value: string ): boolean {

		return /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(\d*(?:\.\d+)?)\s*)?\)$/.test( value );

	}

	static parse( value: string ): ColorRgb {

		let match: ( RegExpMatchArray | null ) = value.match( /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(\d*(?:\.\d+)?)\s*)?\)$/ );

		if ( !match ) {

			throw new Error( '[ColorRgb.parse] invalid RGB format value' );

		}

		let r = parseInt( match[ 1 ]!, 10 );
		let g = parseInt( match[ 2 ]!, 10 );
		let b = parseInt( match[ 3 ]!, 10 );
		let a = match[ 5 ] ? parseFloat( match[ 5 ] ) : 1;

		return new ColorRgb( r, g, b, a );

	}

	/** A random colour; with `keyword`, always the same colour for that string. */
	static random( keyword?: string ): ColorRgb {

		const rnd = ColorRgb.generator( keyword );

		const r: number = Math.floor( rnd() * 256 );
		const g: number = Math.floor( rnd() * 256 );
		const b: number = Math.floor( rnd() * 256 );

		return new ColorRgb( r, g, b );

	}

	toString(): string {

		return this.a === undefined ? `rgb(${ this.r }, ${ this.g }, ${ this.b })` : `rgba(${ this.r }, ${ this.g }, ${ this.b }, ${ this.a })`;

	}

}

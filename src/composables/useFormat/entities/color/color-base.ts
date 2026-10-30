import { type IColor } from '../../types/color';
import { Type } from '../type';

export class ColorBase extends Type implements IColor {

	format!: string;

	constructor( format: string ) {

		super( 'color' );

		try {

			if ( typeof format !== 'string' ) {

				throw new Error( '[ColorBase.constructor] :: invalid format' );

			}

			this.format = format;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	contrast(): ColorBase {

		return this;

	}

	/**
	 * Returns the colour with adjusted brightness on a 0..2 scale:
	 * 0 — black, 1 — unchanged, 2 — white. Below 1 the channels are mixed
	 * towards black, above 1 — towards white, so saturated channels (already
	 * at 255) still get lighter. Accepts a number or a percentage string
	 * (`'150%'` === 1.5). Base is a no-op; concrete colour classes override this.
	 */
	brightness( amount: number | string ): ColorBase {

		void amount;
		return this;

	}

	/** Normalises a `brightness()` argument (number, `'1.5'` or `'150%'`) to 0..2. */
	protected static brightnessFactor( amount: number | string ): number {

		let factor: number;

		if ( typeof amount === 'string' ) {

			const value = amount.trim();
			factor = value.endsWith( '%' ) ? parseFloat( value ) / 100 : parseFloat( value );

		} else {

			factor = amount;

		}

		if ( !Number.isFinite( factor ) ) return 1;

		return Math.min( 2, Math.max( 0, factor ) );

	}

	/** Applies a 0..2 brightness factor to a single 0..255 channel. */
	protected static brightnessChannel( n: number, factor: number ): number {

		const value = factor <= 1
			? n * factor
			: n + ( 255 - n ) * ( factor - 1 );

		return Math.round( Math.min( 255, Math.max( 0, value ) ) );

	}

	/**
	 * Returns the colour with its alpha channel set to `alpha` (0..1).
	 * Base is a no-op (nothing to attach alpha to); concrete colour classes
	 * override this to return a new instance carrying the alpha.
	 */
	opacity( alpha: number ): ColorBase {

		void alpha;
		return this;

	}

	static validate( value: string ): boolean {

		return !!value;

	}

	static parse( value: string ): any { return value }

	static random( keyword?: string ): ColorBase {

		void keyword;
		return new ColorBase( 'color' );

	}

	/**
	 * Source of random numbers in [0, 1) for subclasses' `random()`.
	 *
	 * Without `keyword` it is plain `Math.random`. With one, it is a
	 * deterministic generator seeded by the string's hash: the same string always
	 * yields the same sequence, hence the same colour — e.g. a person's avatar
	 * gets the same colour everywhere it is drawn.
	 */
	protected static generator( keyword?: string ): () => number {

		if ( typeof keyword !== 'string' ) return Math.random;

		// FNV-1a: a fast 32-bit hash that spreads short strings well.
		let seed = 0x811c9dc5;

		for ( let i = 0; i < keyword.length; i++ ) {

			seed ^= keyword.charCodeAt( i );
			seed = Math.imul( seed, 0x01000193 );

		}

		// Mulberry32: each call returns the next number in the sequence.
		return (): number => {

			seed = ( seed + 0x6d2b79f5 ) | 0;

			let t = seed;
			t = Math.imul( t ^ ( t >>> 15 ), t | 1 );
			t ^= t + Math.imul( t ^ ( t >>> 7 ), t | 61 );

			return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

		};

	}

}

import { type IAspectRatio } from '../../types/aspect-ratio';
import { Type } from '../type';

export class AspectRatio extends Type implements IAspectRatio {

	w!: number;
	h!: number;

	constructor( w: number, h: number ) {

		super( 'aspect-ratio' );

		try {

			if ( typeof w !== 'number' || w <= 0 ) {

				throw new Error( '[AspectRatio.constructor] :: invalid w' );

			}

			if ( typeof h !== 'number' || h <= 0 ) {

				throw new Error( '[AspectRatio.constructor] :: invalid h' );

			}

			this.w = w;
			this.h = h;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	static validate( value: string ): boolean {

		return /\s*\/\s*|\s*:\s*/.test( value );

	}

	static parse( aspectRatio: ( string | null ) = '16/9' ): ( AspectRatio | null ) {

		let w: number = 16, h: number = 9;

		if ( !aspectRatio ) {

			return null;

		}

		const parts: any[] = aspectRatio.trim().split( /\s*\/\s*|\s*:\s*/ );

		if ( parts.length !== 2 ) {

			return null;

		}

		const width: number = parseFloat( parts[ 0 ] );
		const height: number = parseFloat( parts[ 1 ] );

		if ( isNaN( width ) || isNaN( height ) || width <= 0 || height <= 0 ) {

			return null;

		}

		w = width;
		h = height;

		return new AspectRatio( w, h );

	}

	toString(): string {

		return `${ this.w }/${ this.h }`;

	}

}

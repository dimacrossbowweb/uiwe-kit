import { type IFileSize } from '../../types/file-size';
import { Type } from '../type';

/**
 * Parses byte-like values into a human-readable file size.
 *
 *   2048      -> 2 KB
 *   "2048"    -> 2 KB
 *   "1.5mb"   -> 1.5 MB
 *   "240 KB"  -> 240 KB
 *
 * A bare number (or numeric string) is treated as bytes. The canonical
 * amount is always kept in `bytes`; `value`/`unit` hold the scaled display
 * parts (binary base, 1 KB = 1024 B).
 */
export class FileSize extends Type implements IFileSize {

	value!: number;
	unit!: string;
	bytes!: number;

	private static readonly base: number = 1024;
	private static readonly units: string[] = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];

	constructor( bytes: number ) {

		super( 'file-size' );

		try {

			if ( typeof bytes !== 'number' || isNaN( bytes ) ) {

				throw new Error( '[FileSize.constructor] :: invalid value' );

			}

			this.bytes = Math.max( 0, bytes );

			let amount: number = this.bytes;
			let index: number = 0;

			while ( amount >= FileSize.base && index < FileSize.units.length - 1 ) {

				amount /= FileSize.base;
				index++;

			}

			this.value = amount;
			this.unit = FileSize.units[ index ] ?? 'B';

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	private static unitToBytes( unit: string ): number {

		const normalized: string = unit.toUpperCase().replace( 'I', '' );
		const index: number = FileSize.units.indexOf( normalized );

		return index < 0 ? 1 : FileSize.base ** index;

	}

	static validate( value: ( string | number ) ): boolean {

		if ( typeof value === 'number' ) return !isNaN( value );

		return /^\d*\.?\d+\s*([kmgtp]i?b|b)?$/i.test( value.toString().trim() );

	}

	static parse( value: ( string | number | undefined | null ) = 0, fallback: number = 0 ): IFileSize {

		if ( value === undefined || value === null || value === '' ) {

			return new FileSize( fallback );

		}

		if ( typeof value === 'number' ) {

			return new FileSize( isNaN( value ) ? fallback : value );

		}

		const match: ( RegExpMatchArray | null ) = value.toString().trim().match( /^(\d*\.?\d+)\s*([kmgtp]i?b|b)?$/i );

		if ( !match ) {

			return new FileSize( fallback );

		}

		const amount: number = parseFloat( match[ 1 ]! );
		const unit: string = match[ 2 ] ?? 'B';

		return new FileSize( amount * FileSize.unitToBytes( unit ) );

	}

	valueOf(): number {

		return this.bytes;

	}

	/**
	 * Renders the size. Without a unit (or with 'auto') the best-fitting unit
	 * is chosen automatically; a concrete unit (e.g. 'MB') forces the scale.
	 */
	format( unit?: ( string | null ) ): string {

		if ( unit && unit.toLowerCase() !== 'auto' ) {

			const normalized: string = unit.toUpperCase().replace( 'I', '' );
			const index: number = FileSize.units.indexOf( normalized );

			if ( index >= 0 ) {

				const scaled: number = this.bytes / ( FileSize.base ** index );
				const rounded: number = index === 0 ? Math.round( scaled ) : Math.round( scaled * 10 ) / 10;

				return `${ rounded } ${ FileSize.units[ index ] }`;

			}

		}

		return this.toString();

	}

	toString(): string {

		const rounded: number = this.unit === 'B'
			? Math.round( this.value )
			: Math.round( this.value * 10 ) / 10;

		return `${ rounded } ${ this.unit }`;

	}

}

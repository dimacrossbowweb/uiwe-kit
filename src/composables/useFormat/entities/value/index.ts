import { type IValue } from '../../types/value';
import { Type } from '../type';

// A number plus unit. Besides absolute and font/viewport-relative units this
// accepts container units ( cq* ): a share of the nearest ancestor with
// `container-type`, so a size can follow a panel's width rather than the
// window's. Outside any container the browser resolves them against the
// small viewport.
const SIZE_REGEX = /^(-?\d+(\.\d+)?)(px|%|em|rem|vw|vh|vmin|vmax|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|in|pt|pc)$/;

export class Value extends Type implements IValue {

	value!: string | number;
	unit!: string;

	constructor( value: string | number, unit: string ) {

		super( 'value' );

		try {

			if ( ![ 'string', 'number' ].includes( typeof value ) ) {

				throw new Error( '[Value.constructor] :: invalid value' );

			}

			if ( typeof unit !== 'string' ) {

				throw new Error( '[Value.constructor] :: invalid unit' );

			}

			this.value = value;
			this.unit = unit;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	static validate( value: ( string | number ) ): boolean {

		if ( Number( value ).toString() === value.toString() ) { return true }

		return SIZE_REGEX.test( value.toString() );

	}

	static parse( value: ( string | number ) = '0px', defUnit: ( string | null ) = 'px' ): IValue {

		if ( Number( value ).toString() === value.toString() ) {

			const unit: string = defUnit ?? '';

			return new Value( Number( value ), unit );

		}

		/**
		 * @todo make it better
		 */
		if ( value === 'auto' ) {

			return new Value( 'auto', '' );

		}

		const match: ( RegExpMatchArray | null ) = value.toString().match( SIZE_REGEX );

		if ( !match ) {

			throw new Error( '[Value.parse] invalid value format' );

		}

		const val: number = parseFloat( match[ 1 ]! );
		const unit: string = match[ 3 ] ?? '';

		return new Value( val, unit );

	}

	toString(): string {

		return `${ this.value }${ this.unit }`;

	}

}

import { type IDuration } from '../../types/duration';
import { Type } from '../type';

export const DurationUnits = [ 'ms', 's' ];

export type TDurationUnit = typeof DurationUnits[ number ];

export class Duration extends Type implements IDuration {

	value!: number;
	unit!: TDurationUnit;
	ms!: number;

	constructor( value: number, unit: string ) {

		super( 'duration' );

		try {

			if ( typeof value !== 'number' || isNaN( value ) ) {

				throw new Error( '[Duration.constructor] :: invalid value' );

			}

			if ( ![ 'ms', 's' ].includes( unit ) ) {

				throw new Error( '[Duration.constructor] :: invalid unit' );

			}

			this.value = value;
			this.unit = unit;
			this.ms = unit === 's' ? value * 1000 : value;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	static validate( value: ( string | number ) ): boolean {

		if ( typeof value === 'number' ) return !isNaN( value );

		return /^-?\d*\.?\d+\s*(ms|s)?$/i.test( value.toString().trim() );

	}

	static parse( value: ( string | number | undefined | null ) = 0, fallback: number = 0 ): IDuration {

		if ( value === undefined || value === null || value === '' ) {

			return new Duration( fallback, 'ms' );

		}

		if ( typeof value === 'number' ) {

			return new Duration( isNaN( value ) ? fallback : value, 'ms' );

		}

		const match: ( RegExpMatchArray | null ) = value.toString().trim().match( /^(-?\d*\.?\d+)\s*(ms|s)?$/i );

		if ( !match ) {

			return new Duration( fallback, 'ms' );

		}

		const amount: number = parseFloat( match[ 1 ]! );
		const unit: string = match[ 2 ]?.toLowerCase() === 's' ? 's' : 'ms';

		return new Duration( amount, unit );

	}

	valueOf(): number {

		return this.ms;

	}

	toString(): string {

		return `${ this.ms }ms`;

	}

}

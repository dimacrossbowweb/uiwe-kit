import { type IModificator } from '../types';
import { useCase } from '../../useCase';

const { convert } = useCase();

export class Modificator implements IModificator {

	name!: string;
	value!: ( string | number | boolean );

	constructor( name: string, value: ( string | number | boolean ) = true ) {

		try {

			if ( typeof name !== 'string' || !name.trim() ) {

				throw new Error( 'useBem -> Modificator :: invalid class name. Expected not empty string' );

			}

			if ( ![ 'string', 'number', 'boolean' ].includes( typeof value ) ) {

				throw new Error( 'useBem -> Modificator :: invalid value. Expected not empty string or boolean' );

			}

			this.name = convert( name, 'kebab-case' );
			this.value = value;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	toString (): string {

		if ( typeof this.value === 'boolean' ) {

			return this.value ? this.name : '';

		}

		return `${ this.name }_${ this.value }`;

	}

};

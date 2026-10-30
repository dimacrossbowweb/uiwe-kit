import { type IType } from '../../types/type';

export class Type implements IType {

	name!: string;

	constructor( name: string ) {

		try {

			if ( typeof name !== 'string' ) {

				throw new Error( '[Type.constructor] :: invalid name' );

			}

			this.name = name;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	static validate( value: unknown ): boolean { return !!value }

	static parse( value: unknown ): unknown { return value }

}

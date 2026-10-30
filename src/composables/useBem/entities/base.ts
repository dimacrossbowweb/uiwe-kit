import type{

	IModificator,
	IBase,

} from '../types';
import { Modificator } from './modificator';
import { useCase } from '../../useCase';

const { convert } = useCase();

export class Base implements IBase {

	_name!: string;

	_suffix!: string;

	modificators!: IModificator[];

	mixins!: string[];

	constructor ( name: string ) {

		try {

			if ( typeof name !== 'string' || !name.trim() ) {

				throw new Error( 'useBem -> Base :: invalid class name. Expected not empty string' );

			}

			this._name = convert( name, 'kebab-case' );

			this._suffix = '';

			this.modificators = [];

			this.mixins = [];

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	m ( name: string, value: ( string | number | boolean ) = true ): this {

		const modificatorIndex: number = this.modificators.findIndex( ( item: IModificator ) => item.name === name );

		if ( modificatorIndex >= 0 ) {

			if ( value ) {

				this.modificators[ modificatorIndex ]!.value = value;

			} else {

				this.modificators.splice( modificatorIndex, 1 );

			}

		} else {

			name && value && this.modificators.push( new Modificator( name, value ) );

		}

		return this;

	}

	rm ( name: string ): this {

		const modificatorIndex: number = this.modificators.findIndex( ( item: IModificator ) => item.name === name );

		if ( modificatorIndex >= 0 ) {

			this.modificators.splice( modificatorIndex, 1 );

		}

		return this;

	}

	mix ( name?: string ): this {
	
		try {

			if ( typeof name !== 'string' && name !== undefined ) {

				throw new Error( 'useBem -> Base -> mix :: invalid name' );

			}

			if ( name === this._name ) {

				throw new Error( `useBem -> Base -> mix :: cannot create mixin with basis name "${ this._name }"` );

			}

			if ( !name ) return this;

			const isExist: ( string | undefined ) = this.mixins.find( ( item: string ) => item === name );

			if ( !isExist ) {

				if (!!this._suffix)
					this.mixins.push( `${ name }__${ this._suffix }` );
				else
					this.mixins.push( name );

			}

		} catch ( e: unknown ) {

			console.error( e );

		}

		return this;

	}

	get name (): string {

		return this._name;

	}

	classify (): string[] {

		const result = [ this.name ].concat(
			this.modificators.map( ( item: IModificator ) => `${ this.name }_${ item.toString() }` ),
		);

		this.mixins.forEach( mixin => {
			result.push(mixin, ...this.modificators.map( ( item: IModificator ) => `${ mixin }_${ item.toString() }` ))
		});

		return result;

		// return [ this.name ]
		// 		.concat(

		// 			this.modificators.map( ( item: IModificator ) => `${ this.name }_${ item.toString() }` ),
		// 			this.mixins
					
		// 		);

	}

	toString (): string {

		return this.classify().join( ' ' );

	}

}

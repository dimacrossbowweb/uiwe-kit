import { Base } from './base';
import { Block } from './block';
import { type IElement } from '../types';

export class Element extends Base implements IElement {

	block!: Block;

	constructor ( block: Block, name: string ) {

		try {

			super( name );

			if ( !( block instanceof Block ) ) {

				throw new Error( 'useBem -> Element :: invalid block.' );

			}

			this.block = block;
			this._suffix = name;

		} catch ( e: unknown ) {

			console.error( e );

		}

	}

	get name (): string {

		return `${ this.block.name }__${ this._name }`;

	}

	// override classify (): string[] {

	// 	return [
			
	// 		this.name
		
	// 	];

	// }

}

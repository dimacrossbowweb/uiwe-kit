import { Base } from './base';

export class Block extends Base {

	constructor ( name: string ) {

		super( name );

	}

	get name (): string {

		return this._name;

	}

}

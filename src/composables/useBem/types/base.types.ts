import { type IModificator } from './modificator.types';

export interface IBase {

	_name: string;

	_suffix: string;

	modificators: IModificator[];

	m ( name: string, value: ( string | number | boolean ) ): this;

	rm ( name: string ): this;

	mix ( name: string ): this;

	classify (): string[];

};

import { type IType } from '../type';

export interface IValue extends IType {

	value: string | number;
	unit: string;

}

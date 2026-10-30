import { type IType } from '../type';

export interface IDuration extends IType {

	value: number;
	unit: string;
	ms: number;

}

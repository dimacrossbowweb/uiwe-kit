import { type IType } from '../type';

export interface IDatetime extends IType {

	value: Date;
	format: string;

}

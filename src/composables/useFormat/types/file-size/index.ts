import { type IType } from '../type';

export interface IFileSize extends IType {

	value: number;
	unit: string;
	bytes: number;

	format( unit?: ( string | null ) ): string;

}

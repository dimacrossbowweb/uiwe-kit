import { type IColor } from './color.types';

export interface IColorHex extends IColor {

	r: number;
	g: number;
	b: number;
	a?: number;

}

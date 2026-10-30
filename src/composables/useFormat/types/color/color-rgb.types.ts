import { type IColor } from './color.types';

export interface IColorRgb extends IColor {

	r: number;
	g: number;
	b: number;
	a?: number;

}

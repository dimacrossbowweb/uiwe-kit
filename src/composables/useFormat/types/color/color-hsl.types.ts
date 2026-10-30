import { type IColor } from './color.types';

export interface IColorHsl extends IColor {

	h: number;
	s: number;
	l: number;
	a?: number;

}

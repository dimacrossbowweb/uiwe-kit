import { type IType } from '../type';

// Output formats `parseColor`/`Color.convert` can coerce a colour into.
export type TColorFormat = 'rgb' | 'hex' | 'hsl';

export interface IColor extends IType {

	format: string;

}

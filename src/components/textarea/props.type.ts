export type IBreakKey = 'ctrl' | 'meta' | 'shift' | 'alt' | 'enter';

/** One key, an array, or a comma-separated string ( 'ctrl, shift' ) — any of them breaks the line. */
export type IBreakKeys = IBreakKey | IBreakKey[] | string;

export interface IProps {

	namespace: string;
	color: string;
	placeholder: string;
	autofocus: boolean;
	readonly: boolean;
	disabled: boolean;
	invalid: boolean;
	maxlength: string | number;
	rounded: string | number;
	maxLines: number;
	breakKey: IBreakKeys;

}

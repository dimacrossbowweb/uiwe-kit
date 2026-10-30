export interface IProps {

	theme?: 'auto' | 'light' | 'dark';

	namespace?: string;
	name?: string;
	src?: string;
	lazySrc?: string;
	size?: string | number;
	bordered?: string | number;
	borderColor?: string;
	color?: string;
	shading?: boolean;
	borderStatus?: string | undefined;
	/** Width of the transparent ring the `status` slot cuts out of the avatar around itself. 0 — no cut-out. */
	statusGap?: string | number;

}

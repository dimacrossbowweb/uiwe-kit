import type { IProps as AvatarProps } from '../props.type'

export interface IProps extends AvatarProps {

	theme?: 'auto' | 'light' | 'dark';

	namespace?: string;
	alignRight?: boolean | string;
	disableExpand?: boolean | string;

}

export const extendedKeys = [ 'alignRight', 'disableExpand' ];

// Per-avatar props the stack must not override. `color` too: it is the
// individual's own colour, otherwise every avatar in the stack would be
// painted the same.
export const updatedKeys = [ 'name', 'src', 'lazySrc', 'color' ];

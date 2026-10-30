import { type TDirection } from './direction.type';

export type TAnimationFunction = ( el: HTMLElement, done: () => void ) => void;

export interface IProps {

	theme?: 'auto' | 'light' | 'dark';


	namespace: string;
	size: string | number;
	direction: TDirection;
	zIndex: string | number;
	fadeOutDelay: string | number;

	/**
	 * Explicit size constraints applied to the visible drawer panel.
	 * All default to `'auto'` which is a no-op in CSS, so the existing
	 * size logic (driven by the `size` prop in default mode, or by the
	 * inner ui-expansion in `inner` mode) keeps working unchanged.
	 *
	 * In default mode they go on the overlay shell (via `mainAttrs`);
	 * in `inner` mode they go on the inner content (`innerContentStyle`).
	 */
	width:     string | number;
	height:    string | number;
	minWidth:  string | number;
	minHeight: string | number;
	maxWidth:  string | number;
	maxHeight: string | number;

	/**
	 * When true, the drawer becomes an in-flow ui-expansion panel: it no
	 * longer takes over the viewport with a fixed overlay, instead it
	 * shrinks/grows in its own layout slot using ui-expansion's width/height
	 * transition. Useful for inline side-panels (e.g. an emoji picker that
	 * docks to the right of a chat column).
	 */
	inner: boolean;

	/**
	 * Switches the default (non-`inner`) drawer from `position: fixed`
	 * (anchored to the viewport) to `position: absolute` (anchored to the
	 * nearest positioned ancestor). Use this to scope the overlay drawer to
	 * a specific container — e.g., a chat panel that should darken only its
	 * own area, not the whole window. Ignored when `inner` is true.
	 */
	absolute: boolean;

	/** Closes on Esc ( via the shared layer stack ). */
	escapable: boolean;

	/**
	 * Selectors of elements whose clicks don't count as clicking outside the
	 * panel and so don't close it — e.g. ui-split-panel dividers: dragging them
	 * changes the layout rather than leaving the panel.
	 */
	outsideIgnore: string[];

	onEnter: TAnimationFunction | undefined,
	onLeave: TAnimationFunction | undefined,

}
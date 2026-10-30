export type CursorView = {
  startMoved: CSSStyleDeclaration['cursor'];
  outsideZone: CSSStyleDeclaration['cursor'];
};

export interface IProps {

	theme?: 'auto' | 'light' | 'dark';

	namespace?: string;

	/**
	** The element can only be dropped into a zone with a matching areaName.
	** Names are not compared for equality but checked with includes():
	** the target's areaName must include the dragged element's areaName.
	**/
	areaName?: string;

	/**
	** Delay (ms) before dragging starts.
	**/
	delay?: string | number,

	cursor?: CursorView,

	mobileStyles?: Partial<CSSStyleDeclaration>,

	payload?: Record<string, unknown>,

	/**
	** Array of DOM elements that activate dragging.
	** They must be actual DOM elements.
	**/
	activators?: Array<HTMLElement>,

	disabled?: boolean | string,

	/**
	** DOM element the clone of the dragged object is appended to;
	** defaults to the component's parent.
	**/
	cloneParent?: HTMLElement | null,

	lockHorizontal?: boolean | string,
	lockVertical?: boolean | string,

	/**
	** Callbacks for drag start, drag move and drag end. Callbacks rather than
	** events because the source component may be removed once dragging starts.
	**/
	eventStart?: (...args: any[]) => void,
	eventMove?: (...args: any[]) => void,
	eventStop?: (...args: any[]) => void

}
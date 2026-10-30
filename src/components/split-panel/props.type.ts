export type Orientation = 'v' | 'h';

/**
 * Drag behaviour of a section, expressed in pixels of the `start` panel.
 *
 *  - `fluid` — the panel follows the cursor 1:1 (rubber stretch), clamped to
 *    the component `min`/`max` fraction.
 *  - `fixed` — the panel is pinned to `at` px while the cursor travels through
 *    the section's px `range` (a dead-zone); it only moves once the cursor
 *    crosses into a neighbouring section.
 */
export type TSplitSectionMode = 'fluid' | 'fixed';

export interface ISplitSection {

	/** px range of the `start` panel this section owns: [from, to). `to` may be Infinity. */
	range: [number, number];
	mode: TSplitSectionMode;
	/** px the panel snaps to in `fixed` mode. Ignored for `fluid`. */
	at?: number;

}

/** Ordered map name → section. Order defines precedence when ranges touch. */
export type TSplitSections = Record<string, ISplitSection>;

export interface IProps {

	theme?: 'auto' | 'light' | 'dark';

	namespace: string;
	orientation: Orientation | null;
	reverse: boolean;
	vertical: boolean;
	cursor: string | null;
	min: number | string,
	max: number | string,
	sections: TSplitSections | null,

}
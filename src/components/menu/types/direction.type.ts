export const DIRECTIONS: string[] = [

	'top-start', 'top-center', 'top-right',
	'bottom-start', 'bottom-center', 'bottom-right',
	'left-up', 'left-center', 'left-down',
	'right-up', 'right-center', 'right-down',
	'center'

];

export type TDirection = typeof DIRECTIONS[number];

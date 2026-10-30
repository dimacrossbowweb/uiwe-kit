export const TPositionValues: string[] = [

	'static',
	'relative',
	'fixed',
	'absolute',
	'sticky',

];

export type TPosition = typeof TPositionValues[ number ];

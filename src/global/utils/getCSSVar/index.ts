export function getCSSVar ( name: string, el?: HTMLElement ): ( string | null ) {

	if ( typeof window !== 'undefined' && typeof document !== 'undefined' ) {

		const element: HTMLElement = el ? el : document.documentElement;

		return getComputedStyle( element ).getPropertyValue( `--${ name }` ).trim() || null;

	}

	return null;

}

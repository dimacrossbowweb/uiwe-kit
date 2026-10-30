import { getCSSVar } from '@/global/utils';
import { themeVersion, type UiTheme } from '@/theme/useTheme';

export function useCSSVar (
	name: string,
	theme: UiTheme = 'auto',
	el?: HTMLElement,
	prefix: string = 'ui',
): string {

	// Accessing themeVersion.value creates a reactive dependency inside computed().
	// When the theme switches, themeVersion increments and every computed that
	// called useCSSVar() re-runs — re-reading the new CSS variable values.
	void themeVersion.value;

	// A forced theme ( 'light' | 'dark' ) resolves against that palette's
	// always-available namespaced vars ( --ui-light-* / --ui-dark-* ), so a
	// component can render in the opposite theme regardless of the active one.
	// 'auto' ( the default ) reads the active-theme var ( --ui-* ) and follows
	// the app theme.
	const key = theme === 'light' || theme === 'dark'
		? `${ prefix }-${ theme }-${ name }`
		: `${ prefix }-${ name }`;

	return getCSSVar( key, el ) ?? '';

}

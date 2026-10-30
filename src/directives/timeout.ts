import type { DirectiveBinding } from 'vue';
import { useFormat } from '../composables/useFormat';

type TimeoutHandler = () => void;

const { parseDuration } = useFormat();

// Usage:
//   v-timeout:500="onTimeout"            -> calls onTimeout() 500ms after mount
//   v-timeout:1s="onTimeout"             -> 1000ms after mount
//   v-timeout:[delay]="onTimeout"        -> dynamic delay ("1s" / "500ms" / number-ms)
//   v-timeout="onTimeout"                -> fires after 0ms on mount
//
// Optional event modifier — the timer starts on that DOM event instead of on
// mount (re-armed on every occurrence, so it behaves like a debounce):
//   v-timeout:1s.mouseenter="onTimeout"  -> 1s after each `mouseenter`
//   v-timeout:500.click="onTimeout"      -> 500ms after each `click`
//
// The directive value is the handler, the argument is the delay, and the
// modifier (if any) is the DOM event that arms the timer.

interface ITimeoutEl extends HTMLElement {

	__timeoutCtx?: ReturnType<typeof setTimeout>;
	__timeoutArg?: string;
	__timeoutMods?: string;
	__timeoutCleanup?: () => void;

}

function events ( binding: DirectiveBinding<TimeoutHandler | undefined> ): string[] {

	return Object.keys( binding.modifiers ).filter( ( key ) => binding.modifiers[ key ] );

}

function schedule ( el: ITimeoutEl, binding: DirectiveBinding<TimeoutHandler | undefined> ): void {

	clear( el );

	const handler = typeof binding.value === 'function' ? binding.value : null;

	if ( !handler ) return;

	const delay = parseDuration( binding.arg, 0 ).ms;

	el.__timeoutCtx = setTimeout( () => {

		delete el.__timeoutCtx;

		handler();

	}, delay );

}

function clear ( el: ITimeoutEl ): void {

	if ( el.__timeoutCtx === undefined ) return;

	clearTimeout( el.__timeoutCtx );

	delete el.__timeoutCtx;

}

function bind ( el: ITimeoutEl, binding: DirectiveBinding<TimeoutHandler | undefined> ): void {

	unbind( el );

	el.__timeoutArg = binding.arg;
	el.__timeoutMods = events( binding ).join( ',' );

	const eventNames = events( binding );

	// No event modifier — arm the timer immediately on mount.
	if ( eventNames.length === 0 ) {

		schedule( el, binding );

		return;

	}

	// With an event modifier — arm the timer on each occurrence of that event.
	const onEvent = (): void => schedule( el, binding );

	eventNames.forEach( ( name ) => el.addEventListener( name, onEvent ) );

	el.__timeoutCleanup = (): void => {

		eventNames.forEach( ( name ) => el.removeEventListener( name, onEvent ) );

		delete el.__timeoutCleanup;

	};

}

function unbind ( el: ITimeoutEl ): void {

	clear( el );

	el.__timeoutCleanup?.();

}

export const vTimeout = {

	mounted ( el: ITimeoutEl, binding: DirectiveBinding<TimeoutHandler | undefined> ): void {

		bind( el, binding );

	},

	updated ( el: ITimeoutEl, binding: DirectiveBinding<TimeoutHandler | undefined> ): void {

		// Re-bind only when the handler, delay or event actually changed.
		if (
			binding.value === binding.oldValue &&
			binding.arg === el.__timeoutArg &&
			events( binding ).join( ',' ) === el.__timeoutMods
		) return;

		bind( el, binding );

	},

	unmounted ( el: ITimeoutEl ): void {

		unbind( el );

	},

};

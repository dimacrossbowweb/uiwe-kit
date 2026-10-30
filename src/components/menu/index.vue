<template>

	<slot

		name="activator"
		:setRef="setActivatorRef"
		:on-show="onShow"
		:on-hide="onHide"
		:on-leave="onLeave"
		:value="value"

	></slot>

	<!--
	-- Lazy mount: the Teleport is created only the first time the menu opens.
	-- Avoids littering <body> with empty <ui-transition> wrappers for every
	-- ui-menu / ui-tooltip activator on the page (e.g. hundreds for the emoji
	-- grid). Once the flag flips it stays mounted, so leave/enter animations
	-- keep working on subsequent open/close cycles.
	-->
	<Teleport v-if="hasBeenShown" to="body">

		<ui-transition

			v-model="value"

			v-bind:on-enter="animation.onEnter"
			v-bind:on-leave="animation.onLeave"

			:duration-start="durationStart"
			:duration-end="durationEnd"
			:delay-start="delayStart"
			:delay-end="delayEnd"

		>

			<div

				ref="context"
				v-bind="mainAttrs"

				:style="{

					left: `${ position.value.x }px`,
					top: `${ position.value.y }px`,
					width: isBlock ? `${ activatorWidth + paddingX * 2 }px` : 'auto',
					padding: padding,

				}"

				@mouseenter="onContextEnter"
				@mouseleave="onContextLeave"

			>

				<slot
				
					name="content"
					v-bind="{ on, options }"
					
				></slot>

			</div>

		</ui-transition>

	</Teleport>

</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core';
import { useElementBounding } from '@vueuse/core';
import { onClickOutside } from '@vueuse/core';
import { strategies } from './strategies/strategy';
import { createBottomStart } from './strategies/bottom-start';
import { getAnimation, animationWaiting } from './animations/animation';

import {

	ref,
	computed,
	watch,
	nextTick,
	onBeforeUnmount,
	provide,
	inject,
	type InjectionKey,

} from 'vue';
import { useBem } from '@/composables/useBem';
import { useEscapeLayer } from '@/composables/useEscapeLayer';
import { type TStrategy } from './strategies/strategy';
import { type TAnimation } from './animations/animation';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	margin: string | number;
	direction: TStrategy;
	animation: TAnimation;
	zIndex: string | number;
	block: boolean;

	/** Animation duration on show / hide (ms). Passed through to ui-transition. */
	durationStart: string | number;
	durationEnd: string | number;

	/** Delay before the show / hide animation begins (ms). Passed through to ui-transition. */
	delayStart: string | number;
	delayEnd: string | number;

	/** Closes on Esc ( via the shared layer stack ). Tooltips turn this off. */
	escapable: boolean;

};

defineOptions( {

	name: 'UiMenu',
	inheritAttrs: false,

} );

const props = withDefaults(defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	margin: 10,
	direction: 'bottom-start',
	animation: 'slide',
	zIndex: 100,
	block: false,

	durationStart: 400,
	durationEnd: 400,
	delayStart: 0,
	delayEnd: 0,

	escapable: true,

});

const { 

	width: windowWidth,
	height: windowHeight

} = useWindowSize();

const value = defineModel( { default: false } );

// A non-escapable menu is a tooltip ( see ui-tooltip ): it covers nothing.
useEscapeLayer( value, () => { value.value = false; }, { enabled: () => props.escapable, modal: () => props.escapable } );

// Becomes true the first time the menu opens, and never goes back.
// The Teleport in template uses `v-if="hasBeenShown"` so the wrapper
// is created on-demand instead of for every ui-menu / ui-tooltip
// activator that may never actually open.
const hasBeenShown = ref<boolean>( false );

watch( value, ( v ) => {

	if ( v ) {

		hasBeenShown.value = true;
		return;

	}

	// Anything can close the menu — click-outside, a menu item, the consumer's
	// own model. A node hidden under the pointer never fires mouseleave, so the
	// hover flags are dropped by hand or the next open starts out stale.
	cancelLeave();
	overContext.value = false;

} );

const { block } = useBem( 'UiMenu' );

const activator = ref<HTMLElement | SVGElement | null>( null );
const context = ref<HTMLElement | null>( null );

/**
 * A slot consumer binds `setRef` to whatever it uses as the activator, so we can
 * be handed a component instance instead of an element. Unwrap it to its root
 * node and keep it only if that is a real Element: a fragment-rooted component
 * ( multiple roots — including the dev-only case of a comment sitting at the top
 * of its template ) resolves to a text / comment placeholder, and handing that
 * to ResizeObserver throws outright, taking the whole render with it.
 */
function toActivatorElement ( value: unknown ): HTMLElement | SVGElement | null {

	const node = ( value as { $el?: unknown } )?.$el ?? value;

	if ( node instanceof HTMLElement || node instanceof SVGElement ) return node;

	if ( node && import.meta.env.DEV ) {

		console.warn( '[ui-menu] activator did not resolve to an element — the menu cannot be positioned against it.', value );

	}

	return null;

}

const setActivatorRef = computed(() => (el: unknown) => {

	activator.value = toActivatorElement( el );

} );

const {

	x: activatorX,
	y: activatorY,
	width: activatorWidth,
	height: activatorHeight,
	update: updateActivatorBounds

} = useElementBounding( activator );

const {

	width: contextWidth,
	height: contextHeight,
	update: updateContextBounds

} = useElementBounding( context );

onClickOutside(

	context,
	( event: Event ) => {

		// A click inside a nested menu ( submenu, sub-submenu… ) is not "outside":
		// their popovers are teleported to body and sit outside this menu in the
		// DOM, but belong to it. Otherwise the first click in a submenu would close
		// the whole chain and nothing interactive could live in a submenu.
		if ( isInsideDescendant( event.target ) ) return;

		value.value = false;

	},
	{ ignore: [ activator ] }

);

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const margin = computed( () => {

	if ( typeof props.margin === 'number' ) {

		return props.margin;

	}

	if ( typeof props.margin === 'string' && !isNaN( +props.margin ) ) {

		return +props.margin;

	}

	return 0;

} );

const direction = computed( () => props?.direction ?? 'bottom-start' );
const animationType = computed( () => props?.animation ?? 'slide' );

/**
 * Which axis the menu opens along — i.e. where the gap to the activator is.
 * `center` sits on top of the activator, so there is no gap to bridge.
 */
const axis = computed<'vertical' | 'horizontal' | 'none'>( () => {

	const d = direction.value;

	if ( d.startsWith( 'top' ) || d.startsWith( 'bottom' ) ) return 'vertical';
	if ( d.startsWith( 'left' ) || d.startsWith( 'right' ) ) return 'horizontal';

	return 'none';

} );

/**
 * `margin` is not laid out as a real gap. A real gap is dead space: the pointer
 * crossing it is outside both the activator and the menu, which fires the
 * activator's mouseleave and closes a hover-opened menu halfway to it. Instead
 * the box is positioned flush against the activator and padded by `margin` on
 * the axis it opens along — the content lands exactly where the gap would have
 * put it, but the space in between belongs to the menu's own hit area, so the
 * trip from one to the other never leaves either element.
 *
 * The padding goes on BOTH ends of that axis: the strategies flip the menu to
 * the other side of the activator when it would overflow the viewport, and
 * which side ends up facing the activator isn't knowable here.
 */
const paddingX = computed( () => axis.value === 'horizontal' ? margin.value : 0 );
const paddingY = computed( () => axis.value === 'vertical' ? margin.value : 0 );

const padding = computed( () => `${ paddingY.value }px ${ paddingX.value }px` );

// `strategies` is keyed by an open `string`, so an unrecognised direction
// resolves to undefined — fall back to the component's default placement.
const position = computed( () => ( strategies[ direction.value ] ?? createBottomStart )( {

	window: {

		width: windowWidth.value,
		height: windowHeight.value,

	},

	// Zero: the offset is the padding above, and it is already part of the
	// measured context box the strategies place.
	margin: 0,

	context: {

		width: contextWidth.value,
		height: contextHeight.value

	},

	activator: {

		x: activatorX.value,
		y: activatorY.value,
		width: activatorWidth.value,
		height: activatorHeight.value

	}

} ) );

const animation = computed( () => {
	
	return animationWaiting( getAnimation( animationType.value )( {

		direction: direction.value,

	} ) );

} );

const zIndex = computed( () => props?.zIndex ?? 100 );
const isBlock = computed( () => !!props?.block );

const on = computed( () => ( {

	'close': onHide,

	// Close this menu and every enclosing one — for a submenu item whose
	// selection finishes the whole interaction.
	'closeAll': closeAll,

} ) );

const options = computed( () => ( {} ) );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

function onShow(): void {

	// Re-measure the activator: ResizeObserver/MutationObserver do not fire on
	// ancestor CSS transforms (e.g. gsap scale/translate on a parent dialog),
	// so the cached bounds may be stale by the time the menu opens.
	updateActivatorBounds();

	// Doubles as the activator's mouseenter for hover-driven menus, so it also
	// calls off a close scheduled by walking back from the menu to the activator.
	overActivator.value = true;
	cancelLeave();

	value.value = true;

	// After the Teleport mounts the menu container, measure it once — initial
	// contextWidth/Height are 0 on first open, which would otherwise place the
	// popover by an unsized box.
	nextTick( () => updateContextBounds() );

}

function onHide(): void {

	value.value = false;

}

// ── Leaving the pair ─────────────────────────────────────────────────────────
//
// `onLeave` is the activator-side counterpart of `onShow` and the handler to
// bind to @mouseleave instead of `onHide`: it closes the menu only once the
// pointer is off BOTH the activator and the menu itself, so moving into the
// menu — over the padded backing above, which leaves no dead space on the way —
// keeps it open.

// Long enough to span the frame between leaving one element and entering the
// other, short enough to read as immediate.
const LEAVE_GRACE = 80;

type TElementGetter = () => Element | null;

/**
 * What a nested menu reports to the enclosing one: its hover ( see
 * `onContextEnter` ), its popover box ( see `isInsideDescendant` ) and a request
 * to close the whole chain ( see `closeAll` ).
 */
interface IMenuFamily {
	enter: () => void;
	leave: () => void;
	register: ( get: TElementGetter ) => void;
	unregister: ( get: TElementGetter ) => void;
	closeAll: () => void;
};

const menuFamilyKey: InjectionKey<IMenuFamily> = Symbol.for( 'ui-menu-family' );

// Injected before this menu provides its own, so it resolves to the enclosing
// menu ( undefined for a top-level one ), never to itself.
const parentHover = inject( menuFamilyKey, undefined );

// Popovers of all nested menus at any depth: each registers its own with the
// parent, which passes it further up.
const descendants = new Set<TElementGetter>();

function register ( get: TElementGetter ): void {

	descendants.add( get );
	parentHover?.register( get );

}

function unregister ( get: TElementGetter ): void {

	descendants.delete( get );
	parentHover?.unregister( get );

}

function isInsideDescendant ( target: EventTarget | null ): boolean {

	if ( !( target instanceof Node ) ) return false;

	for ( const get of descendants ) {

		if ( get()?.contains( target ) ) return true;

	}

	return false;

}

const getContext: TElementGetter = () => context.value;

parentHover?.register( getContext );
onBeforeUnmount( () => parentHover?.unregister( getContext ) );

function closeAll (): void {

	onHide();
	parentHover?.closeAll();

}

const overActivator = ref<boolean>( false );
const overContext   = ref<boolean>( false );

// Flipped by the first `onLeave`. Without it a click-opened menu — one that
// never binds `onLeave` at all — would start closing itself the moment the
// pointer wandered off its body.
const hoverManaged  = ref<boolean>( false );

let leaveTimer: ReturnType<typeof setTimeout> | null = null;

function cancelLeave(): void {

	if ( leaveTimer === null ) return;

	clearTimeout( leaveTimer );
	leaveTimer = null;

}

function scheduleLeave(): void {

	cancelLeave();

	leaveTimer = setTimeout( () => {

		leaveTimer = null;

		if ( overActivator.value || overContext.value ) return;

		onHide();

	}, LEAVE_GRACE );

}

function onLeave(): void {

	hoverManaged.value  = true;
	overActivator.value = false;

	scheduleLeave();

}

function onContextEnter(): void {

	overContext.value = true;
	cancelLeave();

	// A submenu's popover is teleported out of its parent's box, so entering it
	// reads as leaving the parent. Tell the parent the pointer is still within
	// the family, or it would close and take this menu — its own content — down
	// with it.
	parentHover?.enter();

}

function onContextLeave(): void {

	overContext.value = false;

	if ( hoverManaged.value ) scheduleLeave();

	parentHover?.leave();

}

// Hand the same two calls down: a ui-menu rendered inside this one's content is
// a component descendant even though its popover is teleported away, so inject
// reaches us.
provide( menuFamilyKey, { enter: onContextEnter, leave: onContextLeave, register, unregister, closeAll } );

onBeforeUnmount( cancelLeave );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-menu {

	z-index: v-bind( zIndex );

}

</style>


<template>

	<ui-transition

		v-model="value"

		@on-after-leave="onHidingEnd"

		v-bind:on-enter="showHandler"
		v-bind:on-leave="hideHandler"

		:duration="300"

	>

		<div

			ref="win"
			v-bind="mainAttrs"
			:style="winStyle"
			@pointerdown="onFocus"

		>

			<div

				class="ui-window__bar"
				@pointerdown="onDragStart"
                @dblclick="onZoom"

			>

                <div class="ui-window__prepend">

                    <slot name="prepend" v-bind="{ on, options }" />

                </div>

				<div class="ui-window__title">

					<slot name="title">{{ title }}</slot>

				</div>

				<div class="ui-window__actions">

					<slot name="actions" v-bind="{ on, options }" />

					<ui-btn

						v-if="maximizable"
						icon
						icon-name="window-minimize"
						plain
						rounded="100%"
						width="28"
						height="28"
						flat
						@click="onMinimize"

					/>

					<ui-btn

						v-if="maximizable"
						icon
						:icon-name="maximized ? 'window-restore' : 'window-maximize'"
						plain
						rounded="100%"
						width="28"
						height="28"
						flat
						@click="onZoom"

					/>

					<ui-btn

						v-if="closable"
						icon
						icon-name="close"
						plain
						rounded="100%"
						width="28"
						height="28"
						flat
						@click="onClose"

					/>

				</div>

			</div>

			<div

				ref="content"
				class="ui-window__content"

			>

				<ui-scrolling width="100%" height="100%">

					<slot v-bind="{ on, options }" />

				</ui-scrolling>

			</div>

			<template v-if="resizable && !maximized">

				<span
					v-for="dir in HANDLES"
					:key="dir"
					:class="`ui-window__resize ui-window__resize_${ dir }`"
					@pointerdown="onResizeStart( dir, $event )"
				/>

			</template>

		</div>

	</ui-transition>

</template>

<script lang="ts" setup>
import gsap from 'gsap';
import {

	ref,
	reactive,
	computed,
	watch,
	nextTick,
	useSlots,
	useTemplateRef,
	onMounted,
	onBeforeUnmount,

} from 'vue';
import { useBem } from '@/composables/useBem';
import { useEscapeLayer } from '@/composables/useEscapeLayer';

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	/** Position relative to the nearest positioned ancestor (true) vs viewport (false). */
	absolute: boolean;
	zIndex: string | number;

	title: string;

	/** Initial geometry, in pixels. */
	x: string | number;
	y: string | number;
	width: string | number;
	height: string | number;

	minWidth: string | number;
	minHeight: string | number;

	draggable: boolean;
	resizable: boolean;
	maximizable: boolean;
	closable: boolean;
	/** Closes on Esc ( via the shared layer stack ). */
	escapable: boolean;

	onShow: ( el: HTMLElement, duration: number ) => any;
	onHide: ( el: HTMLElement, duration: number ) => any;

}

defineOptions( {

	name: 'UiWindow',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	absolute: false,
	zIndex: 80,
	title: '',
	x: 40,
	y: 40,
	width: 480,
	height: 320,
	minWidth: 240,
	minHeight: 160,
	draggable: true,
	resizable: true,
	maximizable: true,
	closable: true,
	escapable: true,

} );

const emit = defineEmits( [ 'close', 'focus' ] );

const slot = useSlots();
const value = defineModel( { default: false } );

// A window without a close button ( closable: false ) doesn't close on Esc either.
useEscapeLayer( value, () => { value.value = false; }, { enabled: () => props.escapable && props.closable } );

const win =useTemplateRef<HTMLElement | null>( 'win' );
const content = useTemplateRef<HTMLElement | null>( 'content' );

const HANDLES: ResizeDir[] = [ 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw' ];

// Live geometry in px. Drag/resize mutate this directly; the template binds it
// as inline styles. Kept numeric so the pointer math stays simple.
const geo = reactive( { x: 0, y: 0, w: 0, h: 0 } );

const maximized = ref<boolean>( false );
const interacting = ref<boolean>( false );
// Geometry snapshot saved before maximizing, restored on un-maximize.
const restoreGeo = ref<{ x: number; y: number; w: number; h: number } | null>( null );

const minW = computed( () => toPx( props.minWidth, 240 ) );
const minH = computed( () => toPx( props.minHeight, 160 ) );

function toPx( value: string | number | undefined, fallback: number ): number {
	const n = parseFloat( String( value ) );
	return Number.isFinite( n ) ? n : fallback;
}

// The box we clamp dragging/maximizing against: the offset parent for an
// absolute window, otherwise the viewport.
function bounds(): { w: number; h: number } {
	if ( props.absolute ) {
		const parent = win.value?.offsetParent as HTMLElement | null;
		if ( parent ) return { w: parent.clientWidth, h: parent.clientHeight };
	}
	return { w: window.innerWidth, h: window.innerHeight };
}

function clamp( v: number, min: number, max: number ): number {
	return Math.max( min, Math.min( v, max ) );
}

const { block, element } = useBem( 'UiWindow' );

const mainClass = computed( () => block
	.mix( props.namespace )
	.m( 'absolute', props.absolute )
	.m( 'maximized', maximized.value )
	.m( 'interacting', interacting.value )
	.classify() );

const mainAttrs = computed( () => ( { 'class': mainClass.value } ) );

const winStyle = computed( () => ( {
	left:   `${ geo.x }px`,
	top:    `${ geo.y }px`,
	width:  `${ geo.w }px`,
	height: `${ geo.h }px`,
	zIndex: String( props.zIndex ),
} ) );

const on = computed( () => ( {
	close: onClose,
	zoom:  onZoom,
} ) );

const options = computed( () => ( {
	maximized: maximized.value,
} ) );

// ---- dragging --------------------------------------------------------------

function onDragStart( e: PointerEvent ): void {

	if ( !props.draggable || maximized.value ) return;
	// Clicks on the edge cells (controls / prepended content) must not drag.
	if ( ( e.target as HTMLElement )?.closest?.( '.ui-window__actions, .ui-window__prepend' ) ) return;

	e.preventDefault();
	interacting.value = true;

	const startX = e.clientX;
	const startY = e.clientY;
	const ox = geo.x;
	const oy = geo.y;

	const move = ( ev: PointerEvent ): void => {
		const b = bounds();
		geo.x = clamp( ox + ( ev.clientX - startX ), 0, b.w - geo.w );
		geo.y = clamp( oy + ( ev.clientY - startY ), 0, b.h - geo.h );
	};

	const up = (): void => {
		interacting.value = false;
		document.removeEventListener( 'pointermove', move );
		document.removeEventListener( 'pointerup', up );
	};

	document.addEventListener( 'pointermove', move );
	document.addEventListener( 'pointerup', up );

}

// ---- resizing --------------------------------------------------------------

function onResizeStart( dir: ResizeDir, e: PointerEvent ): void {

	if ( !props.resizable || maximized.value ) return;

	e.preventDefault();
	e.stopPropagation();
	interacting.value = true;

	const startX = e.clientX;
	const startY = e.clientY;
	const s = { x: geo.x, y: geo.y, w: geo.w, h: geo.h };

	const move = ( ev: PointerEvent ): void => {

		const dx = ev.clientX - startX;
		const dy = ev.clientY - startY;

		if ( dir.includes( 'e' ) ) geo.w = Math.max( minW.value, s.w + dx );
		if ( dir.includes( 's' ) ) geo.h = Math.max( minH.value, s.h + dy );

		// West / north edges move the origin while resizing, so the opposite
		// edge stays anchored.
		if ( dir.includes( 'w' ) ) {
			const nw = Math.max( minW.value, s.w - dx );
			geo.x = s.x + ( s.w - nw );
			geo.w = nw;
		}
		if ( dir.includes( 'n' ) ) {
			const nh = Math.max( minH.value, s.h - dy );
			geo.y = s.y + ( s.h - nh );
			geo.h = nh;
		}

	};

	const up = (): void => {
		interacting.value = false;
		document.removeEventListener( 'pointermove', move );
		document.removeEventListener( 'pointerup', up );
	};

	document.addEventListener( 'pointermove', move );
	document.addEventListener( 'pointerup', up );

}

// ---- actions ---------------------------------------------------------------

function onFocus(): void {
	emit( 'focus' );
}

function onMinimize(): void {

}

function onClose(): void {
	value.value = false;
}

function onZoom(): void {

	if ( !props.maximizable ) return;

	if ( !maximized.value ) {
		restoreGeo.value = { x: geo.x, y: geo.y, w: geo.w, h: geo.h };
		maximized.value = true;
	} else {
		if ( restoreGeo.value ) Object.assign( geo, restoreGeo.value );
		maximized.value = false;
	}

	// Maximise and restore are special cases of fitting into the available
	// space: it stretches the window over the whole area, and it also brings the
	// restored size back within bounds if the space has shrunk since.
	fitIntoBounds();

}

// ---- fitting into the available space --------------------------------------
//
// The window geometry lives in pixels and used to be computed exactly twice: on
// mount and on maximise. Resizing ( or maximising ) the app window made those
// pixels stale: the window kept its size and spilled off the screen edge along
// with all its content.

// How long to wait after the last resize event before restoring smooth
// transitions: during a drag they lag behind the cursor.
const FIT_SETTLE_MS = 200;

let fitSettleTimer: ReturnType<typeof setTimeout> | null = null;
let boundsObserver: ResizeObserver | null = null;

function fitIntoBounds(): void {

	const b = bounds();
	if ( !b.w || !b.h ) return;

	// A maximised window simply mirrors the available area.
	if ( maximized.value ) {
		geo.x = 0;
		geo.y = 0;
		geo.w = b.w;
		geo.h = b.h;
		return;
	}

	// A regular window is shrunk to the area and moved fully inside it. The lower
	// bound respects the area itself: on a screen smaller than the minimum size
	// the window must get smaller than its minimum rather than stick out.
	geo.w = clamp( geo.w, Math.min( minW.value, b.w ), b.w );
	geo.h = clamp( geo.h, Math.min( minH.value, b.h ), b.h );

	geo.x = clamp( geo.x, 0, Math.max( 0, b.w - geo.w ) );
	geo.y = clamp( geo.y, 0, Math.max( 0, b.h - geo.h ) );

}

function onBoundsChange(): void {

	// Mute transitions with the same flag as dragging: on a continuous stream of
	// events they turn the fitting into mush.
	interacting.value = true;

	fitIntoBounds();

	if ( fitSettleTimer ) clearTimeout( fitSettleTimer );
	fitSettleTimer = setTimeout( () => { interacting.value = false }, FIT_SETTLE_MS );

}

/**
 * Watch whatever the bounds are computed from: the screen itself and, for an
 * `absolute` window, its container too ( it resizes without the screen being
 * involved, e.g. when a neighbouring panel expands ).
 */
function observeBounds(): void {

	stopObservingBounds();

	if ( !props.absolute ) return;

	const parent = win.value?.offsetParent as HTMLElement | null;
	if ( !parent ) return;

	boundsObserver = new ResizeObserver( onBoundsChange );
	boundsObserver.observe( parent );

}

function stopObservingBounds(): void {
	boundsObserver?.disconnect();
	boundsObserver = null;
}

// ---- show / hide animation -------------------------------------------------

const showHandler = computed( () => props?.onShow ?? onShow );
const hideHandler = computed( () => props?.onHide ?? onHide );

function onShow( el: HTMLElement, duration: number ): void {
	gsap.fromTo(
		el,
		{ opacity: 0, scale: 0.96, y: 12 },
		{ opacity: 1, scale: 1, y: 0, duration: duration / 1000, ease: 'power2.out' },
	);
}

function onHide( el: HTMLElement, duration: number ): void {
	gsap.to(
		el,
		{ opacity: 0, scale: 0.96, y: 12, duration: duration / 1000, ease: 'power2.in' },
	);
}

function onHidingEnd(): void {
	emit( 'close' );
}

// ---- lifecycle -------------------------------------------------------------

onMounted( () => {
	geo.x = toPx( props.x, 40 );
	geo.y = toPx( props.y, 40 );
	geo.w = toPx( props.width, 480 );
	geo.h = toPx( props.height, 320 );

	// The given size may not fit even now — on a small screen or in a narrow
	// container.
	fitIntoBounds();

	window.addEventListener( 'resize', onBoundsChange );
} );

// The window appears inside <ui-transition>, so its node doesn't exist yet when
// the component mounts: the container observer is attached when it is shown
// and detached when hidden.
watch( value, ( shown ) => {

	if ( !shown ) {
		stopObservingBounds();
		return;
	}

	nextTick( () => {
		fitIntoBounds();
		observeBounds();
	} );

}, { immediate: true } );

onBeforeUnmount( () => {
	// Gesture listeners attach/detach per gesture; these two outlive gestures.
	window.removeEventListener( 'resize', onBoundsChange );
	stopObservingBounds();
	if ( fitSettleTimer ) clearTimeout( fitSettleTimer );
} );

</script>

<style lang="scss" scoped>
@use './styles.scss';
</style>

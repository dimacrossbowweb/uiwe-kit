<template>

	<div
		v-show="overflowing"
		v-bind="trackAttrs"
		data-marquee-ignore
		@mousedown.prevent="onTrackDown"
		@mouseenter="selfHover = true"
		@mouseleave="selfHover = false"
	>

		<!--
		-- A scrollbar laid over an element with native scrolling — the same look
		-- as ui-scrolling: thin, drawn over the content ( takes no space ) and
		-- visible while the pointer is over the area. The `target`'s own native
		-- bar is hidden by the caller ( see ui-virtual-list ). Meant for places
		-- where the scroll must stay native, e.g. useVirtualList counts rows by
		-- scrollTop.
		--
		-- Place it as a sibling of `target` inside a shared position: relative
		-- wrapper. The comment lives inside the root: outside it would turn the
		-- root into a fragment.
		-->

		<div
			v-bind="thumbAttrs"
			@mousedown.stop.prevent="onThumbDown"
		/>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useEventListener, useResizeObserver } from '@vueuse/core';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	/** Element with native vertical scrolling. */
	target: HTMLElement | null;

};

defineOptions( {

	name: 'UiScrollbar',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	target: null,

} );

/** The thumb never gets shorter than this — otherwise it is ungrabbable in a long list. */
const MIN_THUMB = 24;

const scrollTop    = ref<number>( 0 );
const scrollHeight = ref<number>( 0 );
const clientHeight = ref<number>( 0 );

const targetHover = ref<boolean>( false );
const selfHover   = ref<boolean>( false );
const dragging    = ref<boolean>( false );

function measure (): void {

	const el = props.target;
	if ( !el ) return;

	scrollTop.value    = el.scrollTop;
	scrollHeight.value = el.scrollHeight;
	clientHeight.value = el.clientHeight;

}

const target = computed( () => props.target );

// Scroll is the source of the position; sizes change without it too: the
// window is resized, the list grows. Content height comes from the first child
// ( useVirtualList's row wrapper ), so it is observed along with the container.
useEventListener( target, 'scroll', measure, { passive: true } );
useEventListener( target, 'mouseenter', () => { targetHover.value = true; } );
useEventListener( target, 'mouseleave', () => { targetHover.value = false; } );
useResizeObserver( target, measure );
useResizeObserver( computed( () => props.target?.firstElementChild as HTMLElement | null ), measure );

watch( target, measure, { immediate: true, flush: 'post' } );

const overflowing = computed<boolean>( () => scrollHeight.value > clientHeight.value + 1 );

const thumbHeight = computed<number>( () => {

	if ( !overflowing.value ) return 0;

	return Math.max( MIN_THUMB, clientHeight.value / scrollHeight.value * clientHeight.value );

} );

const maxScroll = computed<number>( () => Math.max( 0, scrollHeight.value - clientHeight.value ) );
const maxThumb  = computed<number>( () => Math.max( 0, clientHeight.value - thumbHeight.value ) );

const thumbTop = computed<number>( () => maxScroll.value
	? scrollTop.value / maxScroll.value * maxThumb.value
	: 0 );

// ── Thumb dragging ──────────────────────────────────────────────────────────

let dragStartY   = 0;
let dragStartTop = 0;

function onMove ( e: MouseEvent ): void {

	const el = props.target;
	if ( !el || !maxThumb.value ) return;

	el.scrollTop = dragStartTop + ( e.clientY - dragStartY ) * ( maxScroll.value / maxThumb.value );

}

function onUp (): void {

	dragging.value = false;
	window.removeEventListener( 'mousemove', onMove );
	window.removeEventListener( 'mouseup', onUp );

}

function onThumbDown ( e: MouseEvent ): void {

	if ( e.button !== 0 || !props.target ) return;

	dragging.value = true;
	dragStartY     = e.clientY;
	dragStartTop   = props.target.scrollTop;

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );

}

/** A click on the track centres the thumb on the click point, like ui-scrolling. */
function onTrackDown ( e: MouseEvent ): void {

	const el = props.target;
	if ( e.button !== 0 || !el || !maxThumb.value ) return;

	const rect  = ( e.currentTarget as HTMLElement ).getBoundingClientRect();
	const ratio = Math.min( Math.max( ( e.clientY - rect.top - thumbHeight.value / 2 ) / maxThumb.value, 0 ), 1 );

	el.scrollTop = ratio * maxScroll.value;

}

onBeforeUnmount( onUp );

// ── BEM ─────────────────────────────────────────────────────────────────────

const { block, element } = useBem( 'UiScrollbar' );

const trackAttrs = computed( () => ( {

	'class': block
			.mix( props.namespace ?? '' )
			.m( 'visible', targetHover.value || selfHover.value || dragging.value )
			.classify(),

} ) );

const thumbAttrs = computed( () => ( {

	'class': element( 'thumb' )
			.mix( props.namespace ?? '' )
			.m( 'active', dragging.value )
			.classify(),

	style: {
		height:    `${ thumbHeight.value }px`,
		transform: `translateY(${ thumbTop.value }px)`,
	},

} ) );

</script>

<style lang="scss" scoped>
@use '@/styles/variables' as vars;

// Geometry and colours are shared with ui-scrolling and the native scrollbars
// ( styles/_scrollbar.scss ).
.ui-scrollbar {

	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 2;

	width: vars.$scrollbar-size;

	background: var( --ui-scrollbar-track );

	opacity: 0;
	transition: opacity 0.2s, background 0.2s;

	&_visible {

		opacity: 1;

	}

	&__thumb {

		position: absolute;
		top: 0;
		left: vars.$scrollbar-inset;
		right: vars.$scrollbar-inset;

		border-radius: vars.$scrollbar-radius;
		background: var( --ui-scrollbar-thumb );

		cursor: pointer;
		will-change: transform;
		transition: background 0.2s;

		&:hover,
		&_active {

			background: var( --ui-scrollbar-thumb-hover );

		}

	}

}
</style>

<template>

	<!--
	-- Virtual list on top of @vueuse/core useVirtualList. Rows have a fixed
	-- height of minSize.
	--
	-- The root is a frame: outside classes and styles land on it ( size, flex,
	-- padding ), its dimensions come from the parent ( width/height: 100% ). A
	-- nested container ( containerProps ) does the scrolling: it is stretched
	-- over the frame and inherits its padding, so rows scroll under it. The
	-- scroll must stay native — useVirtualList counts rows by scrollTop — but the
	-- native bar is hidden and a ui-scrollbar matching ui-scrolling is laid on
	-- top. A horizontal list keeps the native bar.
	-->

	<div class="ui-virtual-list-base">

		<div
			v-bind="containerProps"
			:class="scrollerClass"
			:style="fadeStyle"
		>

			<div
				v-bind="wrapper"
				:class="wrapperClass"
			>

				<div
					v-for="row of visible"
					:key="row.index"
					:style="rowStyle"
				>

					<slot :items="row.data" />

				</div>

			</div>

		</div>

		<ui-scrollbar v-if="!isHorizontal" :target="scroller" />

		<!-- Layer above the list, tied to the frame rather than the scrolling
		     rows: pinned buttons ( e.g. "back to top" ) stay in place. -->
		<slot name="overlay" />

	</div>

</template>

<script lang="ts" setup>
import { computed, ref, shallowRef, watch, nextTick, onMounted } from 'vue';
import { useVirtualList, useEventListener, useResizeObserver } from '@vueuse/core';
import { edgeFadeStyle, type TEdgeFadeSide } from '@/global/utils/edgeFade';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	/** v-model: index of the first visible row. Hook for page navigation. */
	modelValue: number;
	/** Fixed row size in px (height, or width for a horizontal list). */
	minSize: string | number;
	/** Horizontal list direction. Vertical by default. */
	isHorizontal: string | boolean;
	/** Number of items per row (grid). */
	itemsPerRow: string | number;
	/** Gap between rows in px. Part of the row stride rather than flex-gap, so
	 *  useVirtualList's fixed-row-size math stays exact. */
	gap: string | number;
	/** List data. */
	items: any[];
	/** Fade the top / bottom of the viewport over this many px — only where
	 *  more rows lie past the edge ( see styles/_edge-fade.scss ). 0 — off.
	 *  Vertical lists only. */
	fadeEdges: number;
	/** Which edges to fade: both, top only or bottom only. */
	fadeSide: TEdgeFadeSide;

}

defineOptions( {

	name: 'UiVirtualList',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	modelValue: 0,
	minSize: 0,
	isHorizontal: false,
	itemsPerRow: 1,
	gap: 0,
	items: () => ( [] ),
	fadeEdges: 0,
	fadeSide: 'both',

} );

const emit = defineEmits<{

	( e: 'update:modelValue', value: number ): void;

}>();

// Direction is static for the component's lifetime (useVirtualList picks
// itemHeight vs itemWidth once), so the prop is read once at setup.
const isHorizontal: boolean = ( () => {

	const value = props.isHorizontal;

	if ( typeof value === 'string' ) {

		const v = value.toLowerCase();
		return !( v === 'false' || v === '0' || v === '' );

	}

	return !!value;

} )();

const itemSize = computed<number>( () => Number( props.minSize ) || 0 );
const gapSize = computed<number>( () => Number( props.gap ) || 0 );
const perRow = computed<number>( () => Math.max( 1, parseInt( String( props.itemsPerRow ), 10 ) || 1 ) );

// Row stride = content + gap. That is what useVirtualList sees as the fixed
// row size, so offsets and total scroll height stay exact; the gap is drawn as
// the row's inner padding (see rowStyle).
const rowStride = computed<number>( () => itemSize.value + gapSize.value );

// Virtualise by ROWS: each list entry is one row of height itemSize. A grid
// (itemsPerRow > 1) is just chunks of N items.
const rows = computed<any[][]>( () => {

	const source = props.items ?? [];
	const size = perRow.value;

	if ( size <= 1 ) return source.map( ( item ) => [ item ] );

	const result: any[][] = [];
	for ( let i = 0; i < source.length; i += size ) {
		result.push( source.slice( i, i + size ) );
	}
	return result;

} );

const options = isHorizontal
	? { itemWidth: () => rowStride.value, overscan: 6 }
	: { itemHeight: () => rowStride.value, overscan: 6 };

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList( rows, options );

/**
 * Visible rows — updated only when the set actually changed.
 *
 * useVirtualList recomputes `list` on every scroll event and returns a new
 * array even when the window holds the same rows. Rendering `list` directly
 * would re-render every visible row ( plus overscan ) and everything inside it
 * on each scroll event — dozens per second; in a dense grid that is hundreds of
 * nodes per frame. Rows only change when a new one enters the window. Compared
 * by index and data: a change of the data itself ( search, rebuild ) must
 * still reach the markup.
 */
const visible = shallowRef( list.value );

function sameRows ( a: typeof list.value, b: typeof list.value ): boolean {

	if ( a.length !== b.length ) return false;

	for ( let i = 0; i < a.length; i++ ) {
		if ( a[ i ]!.index !== b[ i ]!.index || a[ i ]!.data !== b[ i ]!.data ) return false;
	}

	return true;

}

watch( list, ( next ) => {
	if ( !sameRows( visible.value, next ) ) visible.value = next;
} );

// Same for the wrapper style ( top offset and height for off-screen rows ):
// useVirtualList rebuilds it on every scroll event, and binding to it would
// re-render the template — and all rows — just as often. Like the rows, it only
// changes when the window shifts.
const wrapper = shallowRef( wrapperProps.value );

function sameStyle ( a: Record<string, unknown>, b: Record<string, unknown> ): boolean {

	const keys = Object.keys( a );

	return keys.length === Object.keys( b ).length && keys.every( ( k ) => a[ k ] === b[ k ] );

}

watch( wrapperProps, ( next ) => {
	if ( !sameStyle( wrapper.value.style, next.style ) ) wrapper.value = next;
} );

// The scroll container itself — the ui-scrollbar target. Reuses the ref that
// useVirtualList already puts on it via containerProps: a second `ref` on the
// same element would override the first and the list would lose its container.
const scroller = containerProps.ref;

// Edge fade: the mask sits on the scroller itself; the ui-scrollbar lies next
// to it and is unaffected.
const hasFade = computed<boolean>( () => !isHorizontal && ( Number( props.fadeEdges ) || 0 ) > 0 );

const scrollerClass = computed( () => [
	'ui-virtual-list-base__scroller',
	{ 'ui-virtual-list-base__scroller_overlay': !isHorizontal },
	{ 'edge-fade': hasFade.value },
] );

// Native scroll position and range — to decide which edge to fade. Re-measured
// on scroll, on scroller resize and when the row count changes ( content height
// grows / shrinks ).
const scrollPos = ref<number>( 0 );
const scrollMax = ref<number>( 0 );

function measureScroll (): void {

	const el = scroller.value;
	if ( !el ) return;

	scrollPos.value = el.scrollTop;
	scrollMax.value = el.scrollHeight - el.clientHeight;

}

useEventListener( scroller, 'scroll', measureScroll, { passive: true } );
useResizeObserver( scroller, measureScroll );
watch( () => rows.value.length, () => nextTick( measureScroll ) );

const fadeStyle = computed( () => hasFade.value
	? edgeFadeStyle( scrollPos.value, scrollMax.value, Number( props.fadeEdges ), props.fadeSide )
	: undefined );

const wrapperClass = computed( () => isHorizontal
	? 'ui-virtual-list-base__horizontal'
	: 'ui-virtual-list-base__vertical' );

// A row takes the full stride (content + gap); the gap is padding towards the
// next row, and box-sizing: border-box keeps the outer size exactly rowStride,
// as useVirtualList expects.
const rowStyle = computed( () => isHorizontal
	? { width: `${ rowStride.value }px`, paddingRight: `${ gapSize.value }px`, boxSizing: 'border-box' as const }
	: { height: `${ rowStride.value }px`, paddingBottom: `${ gapSize.value }px`, boxSizing: 'border-box' as const } );

// Index of the first visible row → out (v-model).
const firstIndex = computed<number>( () => visible.value[ 0 ]?.index ?? 0 );

watch( firstIndex, ( index ) => {
	if ( index !== props.modelValue ) emit( 'update:modelValue', index );
} );

// Programmatic jump to a row (e.g. to a category).
watch( () => props.modelValue, ( index ) => {
	if ( index !== firstIndex.value ) scrollTo( index );
} );

onMounted( () => {
	if ( props.modelValue > 0 ) scrollTo( props.modelValue );
} );

/** Smoothly to the first row — for "back to top" buttons. */
function scrollToStart (): void {
	scroller.value?.scrollTo( isHorizontal
		? { left: 0, behavior: 'smooth' }
		: { top: 0, behavior: 'smooth' } );
}

// Exact scroll exposed: v-model only gives the first rendered row including
// overscan, so "scrolled away from the start" would show up a few rows late.
defineExpose( { scrollPos, scrollMax, scrollToStart } );
</script>

<style lang="scss" scoped>
.ui-virtual-list-base {

	position: relative;

	width: 100%;
	height: 100%;

	&__scroller {

		position: absolute;
		inset: 0;

		// Padding set on the frame from outside ( px-3 py-3 etc. ) applies here:
		// rows scroll under it, as when the frame scrolled itself.
		padding: inherit;
		box-sizing: border-box;

		// The native bar is hidden — ui-scrollbar draws it. The standard property
		// is what we want here: in Chromium it switches ::-webkit-scrollbar off.
		&_overlay {

			scrollbar-width: none;

		}

	}

	&__vertical {

		display: flex;
		flex-direction: column;

	}

	&__horizontal {

		display: flex;
		flex-direction: row;

	}

}
</style>

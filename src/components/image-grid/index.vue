<template>

	<div v-bind="mainAttrs" ref="root">

		<div
			v-for="( vnode, i ) in items"
			:key="i"
			:class="itemClass"
			:style="itemStyle( i )"
		>

			<component :is="vnode" />

		</div>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed, useSlots, onMounted, onBeforeUnmount, nextTick, watch, Comment } from 'vue';
import type { VNode, VNodeArrayChildren } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { gridItemFlex } from './flex';

defineOptions( {

	name: 'UiImageGrid',

} );

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	gap: string | number;
	rowHeight: string | number;
	cover: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	gap: 2,
	rowHeight: 200,
	cover: true,

} );

const { parseValue } = useFormat();

const root = ref<HTMLElement | null>( null );
const slots = useSlots();

const ratios = ref<number[]>( [] );

// Flatten the default slot into a plain vnode list, unwrapping fragments
// (e.g. the result of v-for).
const items = computed<VNode[]>( () => {

	const result: VNode[] = [];

	const isVNode = ( obj: unknown ): obj is VNode =>
		typeof obj === 'object' && obj !== null && '__v_isVNode' in obj && ( obj as any ).__v_isVNode === true;

	const flatten = ( list: VNodeArrayChildren | undefined ): void => {

		if ( !list ) return;

		list.forEach( ( vnode ) => {

			if ( !isVNode( vnode ) ) return;

			if ( vnode.type === Symbol.for( 'v-fgt' ) && Array.isArray( vnode.children ) )
				flatten( vnode.children as VNodeArrayChildren );
			else if ( vnode.type !== Comment )
				result.push( vnode );

		} );

	};

	flatten( slots.default?.() );

	return result;

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const cover = computed( () => !!props.cover );

const gap = computed( () => parseValue( props.gap ).toString() );
const rowHeight = computed( () => parseValue( props.rowHeight ).toString() );

const objectFit = computed( () => cover.value ? 'cover' : 'contain' );

const { block, element } = useBem( 'UiImageGrid' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const itemClass = computed( () => {

	return element( 'item' )
			.mix( namespace.value )
			.classify();

} );

// flex-grow is proportional to the aspect ratio — within a row widths are
// distributed so heights line up and the row fills the container. See ./flex
// for factor normalisation ( without it a lone portrait picture fell short of
// the edge ).
function itemStyle ( i: number ): Record<string, string> {

	return gridItemFlex( ratios.value, i, parseInt( rowHeight.value ) || 200 );

}

// Measure real aspect ratios from the loaded <img>/<video> inside the
// wrappers. Until the media has loaded, 1:1 is used.
function measure (): void {

	if ( !root.value ) return;

	const wrappers = root.value.querySelectorAll<HTMLElement>( `.${ element( 'item' ).classify() }` );
	const next: number[] = [];

	wrappers.forEach( ( wrapper, index ) => {

		const img = wrapper.querySelector( 'img' );
		const video = wrapper.querySelector( 'video' );

		if ( img && img.naturalWidth && img.naturalHeight ) {

			next[ index ] = img.naturalWidth / img.naturalHeight;

		} else if ( video && video.videoWidth && video.videoHeight ) {

			next[ index ] = video.videoWidth / video.videoHeight;

		} else {

			next[ index ] = ratios.value[ index ] || 1;

			if ( img && !img.complete )
				img.addEventListener( 'load', measure, { once: true } );

			if ( video && !video.videoWidth )
				video.addEventListener( 'loadedmetadata', measure, { once: true } );

		}

	} );

	ratios.value = next;

}

watch( items, () => nextTick( measure ) );

onMounted( () => {

	nextTick( measure );

} );

onBeforeUnmount( () => {

	if ( !root.value ) return;

	root.value
		.querySelectorAll( 'img' )
		.forEach( ( img ) => img.removeEventListener( 'load', measure ) );

	root.value
		.querySelectorAll( 'video' )
		.forEach( ( video ) => video.removeEventListener( 'loadedmetadata', measure ) );

} );

</script>

<style lang="scss" scoped>
.ui-image-grid {

	position: relative;

	display: flex;
	flex-wrap: wrap;

	box-sizing: border-box;

	gap: v-bind( gap );

	&__item {

		position: relative;

		overflow: hidden;

		min-width: 0;

		// Child content (img / ui-image / video) stretches to the cell width;
		// height follows the aspect ratio so rows line up.
		:deep( img ),
		:deep( video ) {

			display: block;

			width: 100%;
			height: auto;

			object-fit: v-bind( objectFit );

		}

		:deep( .ui-image ),
		:deep( .ui-image__image ) {

			display: block;

			width: 100%;
			height: auto;

		}

	}

}
</style>

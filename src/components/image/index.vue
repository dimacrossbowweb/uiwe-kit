<template>
	
	<div v-bind="mainAttrs">

		<img
		
			v-bind="imageAttrs"
			
		/>

		<div
		
			v-if="!loaded"
			v-bind="overlayAttrs"
			
		>

			<slot name="preload"></slot>

		</div>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

defineOptions({

	name: 'UiImage',

});

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	src: string;
	lazySrc: string;
	width: string | number;
	height: string | number;
	minWidth: string | number;
	maxWidth: string | number;
	minHeight: string | number;
	maxHeight: string | number;
	alt: string;

};

const props = withDefaults ( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	src: '',
	lazySrc: '',
	width: 'auto',
	height: 'auto',
	alt: '',

} );

const { parseValue } = useFormat();

const loaded = ref<boolean>( true );

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const src = computed( () => props?.src ? props.src : '' );
const lazySrc = computed( () => props?.lazySrc ? props.lazySrc : '' );

function cssSize( value: string | number | undefined, fallback: string ): string {
	if ( value === undefined || value === '' ) return fallback;
	const v = value.toString();
	if ( !/^-?\d/.test( v ) ) return v;
	return parseValue( v ).toString();
}

const width  = computed( () => parseValue( props.width ).toString() );
const height = computed( () => parseValue( props.height ).toString() );

const minWidth  = computed( () => cssSize( props.minWidth,  'auto' ) );
const maxWidth  = computed( () => cssSize( props.maxWidth,  'none' ) );
const minHeight = computed( () => cssSize( props.minHeight, 'auto' ) );
const maxHeight = computed( () => cssSize( props.maxHeight, 'none' ) );

const alt = computed( () => props?.alt ? props.alt : '' );

const { block, element } = useBem( 'UiImage' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const imageClass = computed( () => {

	return element( 'image' )
			.mix( namespace.value )
			.classify();

} );

const imageAttrs = computed( () => ( {

	'class': imageClass.value,

	'src': src.value,
	'lowsrc': lazySrc.value,
	'alt': alt.value,

	load,

} ) );

const overlayClass = computed( () => {

	return element( 'overlay' )
			.mix( namespace.value )
			.classify();

} );

const overlayAttrs = computed( () => ( {

	'class': overlayClass.value,

} ) );

function load (): void {

	loaded.value = true;

}

</script>

<style lang="scss" scoped>
.ui-image {

	position: relative;

	display: inline-block;

	width: v-bind( width );
	height: v-bind( height );

	min-width: v-bind( minWidth );
	max-width: v-bind( maxWidth );
	min-height: v-bind( minHeight );
	max-height: v-bind( maxHeight );

	&__image {

		display: block;

		pointer-events: none;

		width: v-bind( width );
		height: v-bind( height );

		min-width: v-bind( minWidth );
		max-width: v-bind( maxWidth );
		min-height: v-bind( minHeight );
		max-height: v-bind( maxHeight );

		object-fit: contain;

	}

	&__overlay {

		display: flex;
		justify-content: center;
		align-items: center;

		position: absolute;
		left: 0;
		top: 0;

		width: 100%;
		height: 100%;

		box-sizing: border-box;

		background-color: #00000099;

		backdrop-filter: blur( 5px );

	}

}
</style>

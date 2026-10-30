<template>

	<div v-bind="mainAttrs">
		
		<slot/>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	width: string | number;
	height: string | number;
	maxWidth: string | number;
	maxHeight: string | number;
	opacity: string | number;
	rounded: string | number;
	color: string;

};

defineOptions( {

	name: 'UiSkeleton',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	width: 'auto',
	height: 'auto',
	maxWidth: 'auto',
	maxHeight: 'auto',
	opacity: 1,
	rounded: 0,
	color: 'neutral'

} );

const { parseColor, parseValue } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );
const maxWidth = computed( () => parseValue( props?.maxWidth ).toString() );
const maxHeight = computed( () => parseValue( props?.maxHeight ).toString() );
const opacity = computed( () => props.opacity );
const rounded = computed( () => parseValue( props?.rounded ).toString() );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );

const { block } = useBem( 'UiSkeleton' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
@keyframes bgAnimate {

	0% {
		
		background-position: 50% 0;
	
	}

	100% {
		
		background-position: -150% 0;
	
	}

}
.ui-skeleton {

	display: inline-flex;

	width: v-bind( width );
	height: v-bind( height );

	max-width: v-bind( maxWidth );
	max-height: v-bind( maxHeight );

	border-radius: v-bind( rounded );

	opacity: v-bind( opacity );

	background-color: v-bind( color );

	background-image: linear-gradient(
		to right,
		v-bind( color ) 0%,
		#ffffff22 50%,
		v-bind( color ) 100%
	);
	
	background-size: 200% 100%;
	
	box-shadow: 0 4px 6px -1px rgb( 0 0 0 / 0.1 ), 0 2px 4px -2px rgb( 0 0 0 / 0.1 );
	
	animation: bgAnimate 1.2s linear infinite;

}
</style>
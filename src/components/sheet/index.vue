<template>

	<div
	
		ref="el"
		v-bind:class="mainClass"
		
	>
	
		<slot />

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useElevation } from '@/composables/useElevation';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

defineOptions( {

	name: 'UiSheet',

} );

interface IProps {

	// Optional like every other prop here: `defineProps<IProps>()` ( no Partial )
	// turns a non-optional field into a *required* prop, and Vue warns about a
	// missing required prop even when withDefaults supplies one — it checks the
	// raw props, not the resolved ones.
	theme?: 'auto' | 'light' | 'dark';

	namespace?: string;
	color?: string;
	height?: string | number;
	width?: string | number;
	rounded?: string | number;
	bordered?: string | number;
	borderColor?: string;
	elevation?: string | number;
	image?: string;
	block?: boolean;
	disabled?: boolean;
	// When true, text color is forced to the contrast of the background
	// (computed via parseColor(...).contrast()). When false (default), text
	// color is inherited so the surrounding theme / parent decides.
	contrastText?: boolean;

};

const props = withDefaults( defineProps<IProps>(), {

	theme: 'auto',

	namespace: '',
	color: 'card',
	height: 'auto',
	width: 'auto',
	rounded: 10,
	bordered: 0,
	borderColor: 'neutral',
	elevation: 2,
	block: false,
	disabled: false,
	contrastText: false,

} );

const {
	
	parseColor,
	parseValue,

} = useFormat();

const namespace = computed( () => props.namespace );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );

const colorToString = computed( () => color.value.toString() );

const textColor = computed( () =>
	props.contrastText ? color.value.contrast().toString() : 'inherit'
);
const height = computed( () => parseValue( props.height ).toString() );
const width = computed( () => parseValue( props.width ).toString() );
const elevation = computed( () => useElevation( props.elevation ).toString() );
const image = computed( () => `url( ${ props.image } )` );
const rounded = computed( () => parseValue( props.rounded ).toString() );
const bordered = computed( () => parseValue( props.bordered ).toString() );

const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );

const borderColor = computed( () => parseColor( borderColorVar?.value ? borderColorVar.value : props.borderColor ).toString() );

const border = computed( () => `${ bordered.value } solid ${ borderColor.value }` );

const { block } = useBem( 'UiSheet' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'disabled', props.disabled )
			.m( 'block', props.block )
			.m( 'image', !!props.image )
			.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-sheet {

	background-color: v-bind( colorToString );

	height: v-bind( height );
	width: v-bind( width );

	border: v-bind( border );

	border-radius: v-bind( rounded );

	box-shadow: v-bind( elevation );

	color: v-bind( textColor );

	box-sizing: border-box!important;

	&_image {

		background: {

			position: center;
			size: cover;
			repeat: no-repeat;
			image: v-bind( image );

		}		

	}

}

</style>

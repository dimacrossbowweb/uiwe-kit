<template>

	<span v-bind:class="mainClass"></span>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	name: string;
	size: string | number;
	color: string;

};

defineOptions( {

	name: 'UiIcon',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	name: '',
	size: '18',
	color: 'text-primary',

} );

const { 

	parseValue,
	parseColor,

} = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const name = computed( () => props.name );
const size = computed( () => parseValue( props.size )?.toString() ?? '24px' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props?.color ).toString() );

const mainClass = computed( () => {

	return useBem( 'UiIcon' )
			.block
			.mix( 'mdi' )
			.mix( `mdi-${ name.value }` )
			.m( namespace.value )
			.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-icon {

	user-select: none;

	font-size: v-bind( size );

	line-height: normal;

	color: v-bind( color )!important;

}

</style>

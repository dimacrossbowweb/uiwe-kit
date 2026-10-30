<template>

	<div v-bind="mainAttrs">

		<slot/>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { TBreakpointsValues, type TBreakpoint } from '@/global/types';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	noGutters: boolean;
	exact: boolean;
	fill: boolean;
	reverse: boolean;
	start: TBreakpoint;
	center: TBreakpoint;
	end: TBreakpoint;
	top: TBreakpoint;
	middle: TBreakpoint;
	bottom: TBreakpoint;
	around: TBreakpoint;
	between: TBreakpoint;

};

defineOptions( {

	name: 'UiRow',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	noGutters: false,
	exact: false,
	fill: false,
	reverse: false,

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const noGutters = computed( () => !!props?.noGutters );
const exact = computed( () => !!props?.exact );
const fill = computed( () => !!props?.fill );
const reverse = computed( () => !!props?.reverse );

const start = computed( () => typeof props?.start === 'string' && TBreakpointsValues.includes( props.start ) );
const center = computed( () => typeof props?.center === 'string' && TBreakpointsValues.includes( props.center ) );
const end = computed( () => typeof props?.end === 'string' && TBreakpointsValues.includes( props.end ) );
const top = computed( () => typeof props?.top === 'string' && TBreakpointsValues.includes( props.top ) );
const middle = computed( () => typeof props?.middle === 'string' && TBreakpointsValues.includes( props.middle ) );
const bottom = computed( () => typeof props?.bottom === 'string' && TBreakpointsValues.includes( props.bottom ) );
const around = computed( () => typeof props?.around === 'string' && TBreakpointsValues.includes( props.around ) );
const between = computed( () => typeof props?.between === 'string' && TBreakpointsValues.includes( props.between ) );

const { block } = useBem( 'UiRow' );

const mainClass = computed( () => {

	return block

			.mix( namespace.value )

			.m( 'no-gutters', noGutters.value )
			.m( 'exact', exact.value )
			.m( 'fill', fill.value )
			.m( 'reverse', reverse.value )

			.m( 'start', start.value )
			.m( 'center', center.value )
			.m( 'end', end.value )
			.m( 'top', top.value )
			.m( 'middle', middle.value )
			.m( 'bottom', bottom.value )

			.m( 'around', around.value )
			.m( 'between', between.value )

			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,	

} ) );

</script>

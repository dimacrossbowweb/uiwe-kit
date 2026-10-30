<template>

	<div v-bind="mainAttrs">

		<slot></slot>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	width: string | number;
	height: string | number;
	fillHeight: boolean;

};

defineOptions( {

	name: 'UiApp',

} );

const props = withDefaults(defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	width: 'auto',
	height: 'auto',
	fillHeight: false,

});

const { parseValue } = useFormat();

const { block } = useBem( 'UiApp' );

const namespace = computed( () => props?.namespace ?? '' );
const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => !!props.fillHeight ? '100dvh' : parseValue( props?.height ).toString() );

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
.ui-app {

	width: v-bind( width );
	height: v-bind( height );

	box-sizing: border-box;

}

</style>

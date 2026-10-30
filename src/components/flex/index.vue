<template>
	
	<div v-bind="mainAttrs">

		<slot></slot>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	stretch: boolean;

};

defineOptions({

	name: 'UiFlex',

});

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	stretch: false,

} );

const { block } = useBem( 'UiFlex' );

const namespace = computed( () => props?.namespace ?? '' );
const stretch = computed( () => !!props.stretch );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'stretch', stretch.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-flex {

	position: relative;

	box-sizing: border-box;

	flex-grow: 0;

	&_stretch {

		flex-grow: 1;
		flex-shrink: 1;

	}

}

</style>

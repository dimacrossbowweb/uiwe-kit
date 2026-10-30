<template>

	<div v-bind:class="mainClass">

		<slot/>

	</div>

</template>

<script lang="ts" setup>
/**
 * Counterpart of Vuetify's v-container: centred by default and capped at a
 * responsive max width ( see styles.scss ); with `fluid` it spans the full
 * width of its parent.
 */
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	fluid: boolean;
	fillHeight: boolean;

};

defineOptions( {

	name: 'UiContainer',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	fluid: false,
	fillHeight: false,

} );

const { block } = useBem( 'UiContainer' );

const mainClass = computed( () => {

	return block
		.m( 'fluid', !!props.fluid )
		.m( 'fill-height', !!props.fillHeight )
		.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

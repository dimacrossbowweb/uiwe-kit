<template>

	<div v-bind="rootAttrs">

		<div v-bind="ringAttrs">

			<slot name="ring"></slot>

		</div>

		<div v-bind="contentAttrs">

			<slot></slot>

		</div>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

};

defineOptions( {

	name: 'UiRing',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const { block, element } = useBem( 'UiRing' );

const namespace = computed( () => props?.namespace ?? '' );

const rootClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const ringClass = computed( () => {

	return element( 'ring' )
			.mix( namespace.value )
			.classify();

} );

const contentClass = computed( () => {

	return element( 'content' )
			.mix( namespace.value )
			.classify();

} );

const rootAttrs = computed( () => ( {

	'class': rootClass.value,

} ) );

const ringAttrs = computed( () => ( {

	'class': ringClass.value,

} ) );

const contentAttrs = computed( () => ( {

	'class': contentClass.value,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';
</style>

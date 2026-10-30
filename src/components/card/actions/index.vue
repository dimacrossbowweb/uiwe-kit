<template>

	<div v-bind:class="mainClass">

		<slot></slot>

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

	name: 'UiCardActions',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { block } = useBem( 'UiCardActions' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

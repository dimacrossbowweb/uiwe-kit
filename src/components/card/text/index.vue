<template>

	<div v-bind:class="mainClass">

		<component :is="tag">

			<slot></slot>

		</component>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	tag: string;

};

defineOptions( {

	name: 'UiCardText',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	tag: 'div',

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { block } = useBem( 'UiCardText' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

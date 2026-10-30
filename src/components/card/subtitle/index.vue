<template>

	<component
	
		:is="tag"

		v-bind:class="mainClass"
		
	>

		<slot></slot>

	</component>

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

	name: 'UiCardSubtitle',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	tag: 'div',

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { block } = useBem( 'UiCardSubtitle' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

<template>

	<div v-bind="mainAttrs">

		<ui-text truncate>
			
			<slot/>

		</ui-text>

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

	name: 'UiListSubtitle',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const { block } = useBem( 'UiListSubtitle' );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,
	
} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss' as *;

</style>

<template>

	<form v-bind="mainAttrs">

		<slot/>

	</form>

</template>

<script lang="ts" setup>
import { useAttrs, computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	readonly: boolean;
	disabled: boolean;

};


defineOptions( {

	name: 'UiForm',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	readonly: false,
	disabled: false,

} );

const namespace = computed( () => props.namespace );

const readonly = computed( () => !!props?.readonly );
const disabled = computed( () => !!props?.disabled );

const attrs = useAttrs();

const { block } = useBem( 'UiForm' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'readonly', readonly.value )
			.m( 'disabled', disabled.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	...attrs,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

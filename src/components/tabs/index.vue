<template>

	<div v-bind="mainAttrs">

		<template
		
			v-for="( item, i ) in items"
			:key="i"
			
		>
	
			<component
			
				@click="value = i"
				:selected="value === i"
				:disabled="disabled"
				:block="isBlock"
				:is="item"
			
			></component>
		
		</template>

	</div>

</template>

<script lang="ts" setup>
import {
	
	useSlots,
	computed,

} from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	mandatory: boolean;

	color: string;

	disabled: boolean;

	gap: string | number;

	block: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	squere: 2,
	rounded: 4,
	gap: 4,
	block: false,

} );

const emit = defineEmits( [ 'update:modelValue' ] );

const value = defineModel( { default: 0 } )

const slots = useSlots();

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );

const gap = computed( () => parseValue( props?.gap ).toString() );

const isBlock = computed( () => !!props?.block );

const items = computed( () => slots.default?.() || [] );

const { block } = useBem( 'UiTabs' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'block', isBlock.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

</script>

<style lang="scss">
.ui-tabs {

	$selector: &;

	display: inline-flex;

	position: relative;

	gap: v-bind( gap );

	&_block {

		display: flex;

	}

}

</style>

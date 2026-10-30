<template>

	<div v-bind="mainAttrs">

		<template v-if="selectable">

			<component

				v-for=" ( item, i ) in items "
				:key="i"

				:is="item"
				v-bind="item.props"

				:active=" i === value "
				@click="onClick( i )"

			></component>

		</template>

		<template v-else>

			<component

				v-for=" ( item, i ) in items "
				:key="i"

				:is="item"
				v-bind="item.props"

			></component>

		</template>

	</div>

</template>

<script lang="ts" setup>
import {
	
	computed,
	useSlots,
	// defineModel,

} from 'vue';

import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	disabled: boolean;
	gap: string | number;
	selectable: boolean;

};

defineOptions( {

	name: 'UiList',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	disabled: false,
	gap: 8,

} );

const value = defineModel<number | null>( { default: 0 } );

const { parseValue } = useFormat();

const slots = useSlots();

const items = computed( () => {

	if ( !!slots.default ) {

		return slots.default();

	}

	return [];

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const disabled = computed( () => !!props?.disabled );

const gap = computed( () => parseValue( props?.gap ).toString() );

const selectable = computed( () => !!props.selectable );

const { block } = useBem( 'UiList' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'disabled', disabled.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

} ) );

function onClick( index: number | null ) {

	value.value = index;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-list {

	gap: v-bind( gap );

}

</style>

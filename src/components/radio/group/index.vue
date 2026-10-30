<template>

	<div v-bind:class="containerClass">

		<div
			v-for="(item, key) in listWithChecked"
			:key="key"
			v-bind:class="itemClass"
			@click="onCheck(key, item)"
		>

			<slot :item="item" />
		
		</div>
		
	</div>

</template>

<script lang="ts" setup>

	import { ref, computed, watch, onMounted } from 'vue';
	import { useBem } from '@/composables/useBem';
	import type { IProps } from './props.type';

	const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

		namespace: '',
		list: () => [],
		valueKey: 'id',

	} );

	const namespace = computed( () => props.namespace ?? '' );
	const list = computed( () => props.list ?? [] );
	const valueKey = computed( () => props.valueKey ?? 'id' );
	const checkedIndex = ref<number | null>( null );

	/**
	** Holds the value of the object picked from `list`.
	** null when nothing is selected.
	** Returns the selected object's attribute named by `valueKey`;
	** if the object has no such attribute, its 0-based index in `list`.
	**/
	const checkedValue = defineModel<any>( { default: null } );

	const { block, element } = useBem( 'UiRadioGroup' );
	const containerClass = computed( () => block.mix( namespace.value ).classify() );
	const itemClass = computed( () => element('item').mix( namespace.value ).classify() );

	const listWithChecked = computed( () => list.value.map( (item, i) => ({
		...item,
		checked: checkedIndex.value === i
	})) );

	function onCheck(index: number, item: Record<string, unknown>) {

		if (!item.disabled) {

			if (index > -1 && index < list.value.length) {
				checkedIndex.value = index;
				checkedValue.value = list.value[index]![valueKey.value] ?? index;
			} else {
				checkedIndex.value = null;
				checkedValue.value = null;
			}

		}

	}

	function setCheckedIndex() {

		const findIndex = list.value.findIndex( (item, i) => 
			item[valueKey.value] !== undefined 
			? item[valueKey.value] === checkedValue.value 
			: i === checkedValue.value
		);

		if (findIndex > -1)
			checkedIndex.value = findIndex;
		else
			checkedIndex.value = null;

	}

	onMounted( () => {

		setCheckedIndex();

	} )

	watch( checkedValue, () => {

		setCheckedIndex();

	} );

</script>

<style lang="scss" scoped>

.ui-radio-group {

	display: flex;
	flex-direction: column;
	gap: 0.5rem;

}

</style>
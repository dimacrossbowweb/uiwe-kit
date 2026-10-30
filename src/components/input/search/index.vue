<template>

	<div v-bind="mainAttrs">
	
		<ui-input 
			v-bind="{ ...$attrs }"
			ref="input"
		>
			
			<template 
				v-for="( _, slotName ) in $slots" 
				#[slotName]
			>

				<slot 
					:name="slotName"
				/>

			</template>

			<template #append>

				<ui-icon

					name="search"
					:color="'var( --ui-color-text )'"
				/>

			</template>

		</ui-input>
		
	</div>
	
</template>

<script lang="ts" setup>
import {
	
	useTemplateRef,
	defineComponent,
	computed,

} from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const input = useTemplateRef( 'input' );

defineComponent({

	inheritAttrs: false,

});

defineExpose ( {

	focus: () => { input?.value?.focus() },
	showPicker: () => { input?.value?.showPicker() },

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { block } = useBem( 'UiInputSearch' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

} ) );

</script>

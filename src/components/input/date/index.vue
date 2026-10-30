<template>

	<div v-bind="mainAttrs">
		
		<ui-input 
			v-bind="{ ...attrs }" 
			type="date"
		>
			
			<template 
				v-for="( _, slotName ) in slots" 
				#[slotName]
			>

				<slot 
					:name="slotName"
				/>

			</template>

			<template #append>
				
				<ui-icon

					name="calendar"

				/>

			</template>

		</ui-input>

	</div>
	
</template>

<script lang="ts" setup>
import {
	
	defineComponent,
	computed,
    useAttrs,
    useSlots,

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

const attrs = useAttrs();

const slots = useSlots();

defineComponent({

	inheritAttrs: false,

});

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { block } = useBem( 'UiInputDate' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

} ) );

</script>

<style lang="scss">
input[type="date"]::-webkit-calendar-picker-indicator {

    display: none;
    -webkit-appearance: none;

}

input[type="date"] {
    
    -moz-appearance: textfield;

}

</style>

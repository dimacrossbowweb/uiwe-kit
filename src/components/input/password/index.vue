<template>

	<div v-bind="mainAttrs">
		
		<ui-input
			v-bind="$attrs"
			:type="isPassword ? 'password' : 'text'"
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
					class="ui-input-password__toggle"
					:name="iconName"
					:size="18"
					color="text-secondary"
					@click="toggleInputType"
				/>

			</template>

		</ui-input>

	</div>
	
</template>

<script lang="ts" setup>
import {

	ref,
	computed,

} from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

};

// `defineComponent({ inheritAttrs: false })` was called here previously, which
// builds a throwaway options object and has no effect on this component.
// defineOptions is the macro that actually applies it.
defineOptions( {

	name: 'UiInputPassword',
	inheritAttrs: false,

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const isPassword = ref<boolean>(true);

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const iconName = computed(() => isPassword.value ? 'eye' : 'eye-off');

const toggleInputType = () => {

	isPassword.value = !isPassword.value;

};

const { block } = useBem( 'UiInputPassword' );

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
.ui-input-password__toggle {

	cursor: pointer;
	user-select: none;

}
</style>

<template>

	<div v-bind="mainAttrs">

		<input
			:value="value"
			v-bind="checkboxAttrs" />

		<div v-bind="overlayAttrs"></div>

		<div v-bind="containerAttrs">

			<ui-icon

				name="check"
				:color="iconColor"
				:size="14"
				v-bind="iconAttrs"

			/>

		</div>

	</div>

</template>

<script lang="ts" setup>
// import UiIcon from '@/components/ui/icon/index.vue';
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';
import { useElevation } from '@/composables/useElevation';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	checked: boolean;
	disabled: boolean;
	rounded: string | number;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'brand',
	checked: false,
	disabled: false,
	rounded: 5,

} );

const value = defineModel( { default: false } );

const namespace = computed( () => props?.namespace ?? '' );
const checked = computed( () => !!props.checked );

const { parseColor, parseValue } = useFormat();

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );

const rounded = computed( () => parseValue( props.rounded ).toString() );

const colorToString = computed( () => color.value.toString() );

const iconColor = computed( () => color.value.contrast().toString() || useCSSVar( 'text-color', props.theme ) );

const isChecked = computed( () => value.value || checked.value );

const disabled = computed( () => !!props?.disabled );

const { block, element } = useBem( 'UiCheckbox' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'checked', isChecked.value )
			.m( 'disabled', disabled.value )
			.classify();
	
} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	onClick,

} ) );

const checkboxClass = computed( () => {

	return element( 'checkbox' )
			.mix( namespace.value )
			.classify();
	
} );

const checkboxAttrs = computed( () => ( {

	'class': checkboxClass.value,

} ) );

const containerClass = computed( () => {

	return element( 'container' )
			.mix( namespace.value )
			.classify();
	
} );

const containerAttrs = computed( () => ( {

	'class': containerClass.value,

} ) );

const iconClass = computed( () => {

	return element( 'icon' )
			.mix( namespace.value )
			.classify();
	
} );

const iconAttrs = computed( () => ( {

	'class': iconClass.value,

} ) );

const overlayClass = computed( () => {

	return element( 'overlay' )
			.mix( namespace.value )
			.classify();
	
} );

const overlayAttrs = computed( () => ( {

	'class': overlayClass.value,

} ) );

function onClick() {

	value.value = !value.value;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-checkbox {

	border-radius: v-bind( rounded );

	&__overlay {

		background-color: v-bind( colorToString );

	}

}

</style>

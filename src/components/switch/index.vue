<template>

	<div v-bind:class="mainClass">

		<div 

			v-bind:class="controllerClass" 
			@click="toggle"

		>
			
			<div :class="togglerClass"></div>

		</div>

		<span :class="labelClass">
			
			{{ label }}
		
		</span>
	
	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

const sizes: Record<string, number> = {

	'small': 12,
	'normal': 16,
	'large': 20

};

export interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	label: string;
	disabled: boolean;
	size: string | number;

}

defineOptions( {

	name: 'UiSwitch',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'brand',
	label: '',
	disabled: false,
	size: 16,

} );

const { parseColor } = useFormat();

const state = defineModel( { default: false });

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );

const label = computed( () => props.label );
const disabled = computed( () => !!props.disabled );

const size = computed( () => {
	
	if ( typeof props.size === 'string' && props.size in sizes ) {

		return `${ sizes[ props.size ] }px`;

	}

	return `${ props.size }px`;

} );
const containerWidth = computed( () => {
	
	if ( typeof props.size === 'string' && props.size in sizes ) {

		return `${ sizes[ props.size ]! * 2 }px`;

	}

	return `${ +props.size * 2 }px`;

} );

const { block, element } = useBem( 'UiSwitch' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'disabled', disabled.value )
			.classify();

} );

const controllerClass = computed( () => {

	return element( 'controller' )
			.m( 'on', state.value )
			.m( 'disabled', disabled.value )
			.classify();

} );

const togglerClass = computed( () => {

	return element( 'toggler' )
			.m( 'disabled', disabled.value )
			.classify();

} );

const labelClass = computed( () => {

	return element( 'label' )
			.m( 'disabled', disabled.value )
			.classify();

} );

function toggle(): void {

	state.value = !state.value;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-switch {

	&__controller {

		background-color: v-bind( color );

		width: v-bind( containerWidth );

		&_on {

			background-color: v-bind( color );

			& .ui-switch__toggler {

				transform: translateX( 100% );

			}

		}

	}

	&__toggler {

		width: v-bind( size );
		height: v-bind( size );

	}

}

</style>

<template>

	<ui-sheet v-bind="mainAttrs">

		<slot></slot>

	</ui-sheet>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { TPositionValues, type TPosition } from '@/global/types';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	elevation: string | number;
	height: string | number;
	width: string | number;
	maxHeight: string | number;
	maxWidth: string | number;
	minHeight: string | number;
	minWidth: string | number;
	position: TPosition;
	rounded: string | number;
	bordered: string | number;
	borderColor: string;
	flat: boolean;
	tile: boolean;
	disabled: boolean;
	image: string;
	contrastText: boolean;

};

defineOptions( {

	name: 'UiCard',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'card',
	elevation: 2,
	height: 'auto',
	width: 'auto',
	maxHeight: 'auto',
	maxWidth: 'auto',
	minHeight: 'auto',
	minWidth: 'auto',
	position: 'static',
	rounded: 12,
	bordered: 0,
	borderColor: 'neutral',
	flat: false,
	tile: false,
	disabled: false,
	contrastText: true,

} );

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const maxHeight = computed( () => parseValue( props.maxHeight ).toString() );
const maxWidth = computed( () => parseValue( props.maxWidth ).toString() );
const minHeight = computed( () => parseValue( props.minHeight ).toString() );
const minWidth = computed( () => parseValue( props.minWidth ).toString() );
const position = computed( () => {
	
	if ( typeof props?.position === 'string' && TPositionValues.includes( props.position ) ) {

		return props.position;

	}

	return 'static'; 

} );

const tile = computed( () => !!props.tile );
const flat = computed( () => !!props?.flat );

const { block } = useBem( 'UiCard' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'tile', tile.value )
			.m( 'flat', flat.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

	// The card resolves no colour of its own — <ui-sheet> does, through
	// useCSSVar( name, theme ). Without forwarding this, `<ui-card theme="dark">`
	// was accepted and then quietly ignored.
	theme: props.theme,

	color: props.color,
	elevation: props.elevation,
	height: props.height,
	width: props.width,
	rounded: props.rounded,
	bordered: props.bordered,
	borderColor: props.borderColor,
	disabled: props.disabled,
	image: props.image,
	contrastText: props.contrastText,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-card {

	position: v-bind( position );

	max-height: v-bind( maxHeight );
	max-width: v-bind( maxWidth );
	min-height: v-bind( minHeight );
	min-width: v-bind( minWidth );

}

</style>

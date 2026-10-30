<template>

	<div v-bind="mainAttrs">

		<div v-bind="leftAttrs"></div>

		<span v-if="!!label" v-bind="labelAttrs">{{ label }}</span>

		<div v-if="!!label" v-bind="rightAttrs"></div>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	label: string;
	vertical: boolean;
	height: string | number;

};

defineOptions( {

	name: 'UiDivider',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'neutral-200',
	label: '',
	vertical: false,
	height: '100%',

} );

const { parseColor, parseValue } = useFormat();

const namespace = computed( () => props.namespace );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() ?? 'neutral-200' );

const label = computed( () => props?.label ?? '' );

const vertical = computed( () => !!props.vertical );

// `height` is only meaningful when vertical=true (the divider draws along
// the cross axis there). For horizontal direction the value is ignored —
// the divider just stretches to its parent's width and is 1 px tall.
const height = computed( () => parseValue( props.height ).toString() );

const { block, element } = useBem( 'UiDivider' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'vertical', vertical.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const leftClass = computed( () => {

	return element( 'left' )
			.mix( namespace.value )
			.classify();

} );

const leftAttrs = computed( () => ( {

	'class': leftClass.value,

} ) );

const labelClass = computed( () => {

	return element( 'label' )
			.mix( namespace.value )
			.classify();

} );

const labelAttrs = computed( () => ( {

	'class': labelClass.value,

} ) );

const rightClass = computed( () => {

	return element( 'right' )
			.mix( namespace.value )
			.classify();

} );

const rightAttrs = computed( () => ( {

	'class': rightClass.value,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-divider {

	$selector: &;

	color: v-bind( color );

	padding: 0;

	&__left {

		background-color: v-bind( color );
		height: 1px;
		padding: 0;

	}

	&__right {

		background-color: v-bind( color );
		height: 1px;
		padding: 0;

	}

	&_vertical {

		display: flex;
		flex-direction: column;
		height: v-bind( height );
		gap: 12px;

		#{ $selector }__left {

			width: 1px;
			height: auto;

		}

		#{ $selector }__right {

			width: 1px;
			height: auto;

		}

	}

}

</style>

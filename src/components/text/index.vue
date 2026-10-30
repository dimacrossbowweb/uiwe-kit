<template>

	<component
	
		v-bind="mainAttrs"
		:is="tag"

	>

		<slot>{{ text }}</slot>

	</component>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	tag: string;
	truncate: boolean;
	text: string;
	color: string;
	size: string | number;
	block: boolean;
	mono: boolean;
	noWrap: boolean;

};

defineOptions( {

	name: 'UiText',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	tag: 'div',
	truncate: false,
	text: '',
	color: 'text-primary',
	size: 16,
	block: false,
	mono: false,
	noWrap: false,

} );

const { block } = useBem( 'UiText' );

const { parseColor, parseValue } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const tag = computed( () => props?.tag ?? 'div' );

const truncate = computed( () => !!props?.truncate );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );

const size = computed( () => parseValue( props?.size ).toString() );

const isBlock = computed( () => !!props?.block );

const isMono = computed( () => !!props?.mono );

const isNoWrap = computed( () => !!props?.noWrap );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'truncate', truncate.value )
			.m( 'block', isBlock.value )
			.m( 'mono', isMono.value )
			.m( 'nowrap', isNoWrap.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss' as *;

.ui-text {

	color: v-bind( color );
	font-size: v-bind( size );

}

</style>

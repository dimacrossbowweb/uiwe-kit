<template>

	<component :is="tag" v-bind="mainAttrs">

		<template v-if="!!slots.prepend">

			<slot name="prepend"></slot>

		</template>

		<span v-bind="textAttrs">

			<slot>{{ text }}</slot>

		</span>

		<template v-if="!!slots.append">

			<slot name="append"></slot>

		</template>

	</component>

</template>

<script lang="ts" setup>
import {
	computed,
	useAttrs,
	useSlots,
} from 'vue';
import { resolveRouterLink } from '@/internal/router';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	truncate: boolean;
	text: string;
	color: string;
	block: boolean;
	mono: boolean;
	disabled: boolean;
	to: string | object;

};

defineOptions( {

	name: 'UiLink',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	truncate: false,
	text: '',
	color: 'link',
	block: false,
	mono: false,
	disabled: false,

} );

const emit = defineEmits( [ 'click' ] );

const attrs = useAttrs();

const slots = useSlots();

const { block, element } = useBem( 'UiLink' );

const { parseColor } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const truncate = computed( () => !!props?.truncate );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );

const isBlock = computed( () => !!props?.block );

const isMono = computed( () => !!props?.mono );

const disabled = computed( () => !!props?.disabled );

const to = computed( () => props?.to ?? '' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'truncate', truncate.value )
			.m( 'block', isBlock.value )
			.m( 'mono', isMono.value )
			.m( 'disabled', disabled.value )
			.classify();

} );

// RouterLink when vue-router is installed, plain <a> otherwise.
const tag = resolveRouterLink();

const isRouterLink = computed( () => tag !== 'a' );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

	// RouterLink takes `to`; a bare anchor needs `href`, and only understands
	// a string target — object routes are meaningless without a router.
	...( isRouterLink.value
		? { to: to.value }
		: { href: typeof to.value === 'string' ? to.value : undefined } ),

	onClick,

	// ...attrs,

} ) );

const textClass = computed( () => {

	return element( 'text' )
			.mix( namespace.value )
			.classify();

} );

const textAttrs = computed( () => ( {

	class: textClass.value,

} ) );

function onClick( e: MouseEvent ) {

	emit( 'click', e );

}

</script>

<style lang="scss">
@use './styles.scss' as *;

.ui-link {

	color: v-bind( color )!important;

}

</style>

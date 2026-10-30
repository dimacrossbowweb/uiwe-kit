<template>
	
	<button

		ref="btn"
		v-bind="mainAttrs"
		class="button-label-m"

	>

		<template v-if="icon">

			<slot>

				<ui-icon

					v-bind="iconAttrs"
					:name="iconName"
					:size="iconSize"
					:color="iconColor"

				/>

			</slot>

		</template>

		<template v-else>

			<div
			
				
				v-bind="containerAttrs"
				
			>

				<template v-if="!!slots.prepend">

					<div v-bind="prependAttrs">

						<slot name="prepend"></slot>

					</div>

				</template>

				<div v-bind="bodyAttrs">

					<slot></slot>

				</div>

				<template v-if="!!slots.append">

					<div v-bind="appendAttrs">

						<slot name="append"></slot>

					</div>

				</template>

			</div>

		</template>

	</button>

</template>

<script lang="ts" setup>
import {

	ref,
	computed,
	useSlots,

} from 'vue';
import { useOptionalRouter, navigate } from '@/internal/router';
import { useBem } from '@/composables/useBem';
import { useElevation } from '@/composables/useElevation';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';
import { usePulsation } from '@/composables/usePulsation';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	width: string | number;
	height: string | number;

	block: boolean;

	type: 'button' | 'submit' | 'reset';

	color: string;

	rounded: string | number;

	icon: boolean;

	iconName: string;

	iconSize: string | number;

	iconColor: string;

	elevation: string | number;

	disabled: boolean;

	plain: boolean;

	flat: boolean;

	bordered: string | number;

	borderColor: string;

	to: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

	width: 'auto',
	height: '3.2rem',

	block: false,

	type: 'button',

	color: 'neutral',

	rounded: 12,

	icon: false,

	iconName: '',

	iconSize: 18,

	elevation: 0,

	disabled: false,

	plain: false,

	flat: false,

	bordered: 0,

	borderColor: 'neutral',

} );

const emit = defineEmits( [

	'click',
	'focus',
	'blur',

] );

// null when vue-router is not installed — `to` then falls back to a plain
// browser navigation, so the button stays usable in a router-less app.
const router = useOptionalRouter();

const slots = useSlots();

const btn = ref<HTMLElement | null>( null );

const focused = ref<boolean>( false );

usePulsation ( btn );

const { parseValue, parseColor } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const width = computed( () => parseValue( props?.width )?.toString() ?? 'auto' );
const height = computed( () => parseValue( props?.height )?.toString() ?? '2.8rem' );

const isBlock = computed( () => !!props?.block );

const type = computed( () => props?.type ?? 'button' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color )?.toString() );

const textColor = computed( () => {

	// On a transparent background (plain) there's nothing to contrast against,
	// so use the color itself — otherwise a white-on-white icon disappears.
	if ( props?.plain ) return color.value;

	return parseColor( color?.value ).contrast().toString() || useCSSVar( 'text-color', props.theme );

} );

const rounded = computed( () => parseValue( props?.rounded ).toString() );

const icon = computed( () => !!props?.icon );

const iconName = computed( () => props?.iconName ?? '' );

const iconSize = computed( () => parseValue( props?.iconSize )?.toString() ?? '18px' );

const iconColor = computed( () => props?.iconColor ? props.iconColor : textColor.value );

const elevation = computed( () => useElevation( props.elevation ).toString() );

const disabled = computed( () => !!props?.disabled );

const plain = computed( () => !!props?.plain );

const flat = computed( () => !!props?.flat );

const bordered = computed( () => parseValue( props?.bordered ).toString() );

const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );

const borderColor = computed( () =>
	parseColor( borderColorVar?.value ? borderColorVar.value : props.borderColor ).toString()
);

const border = computed( () => `${ bordered.value } solid ${ borderColor.value }` );

const to = computed( () => props?.to );

const { block, element } = useBem( 'UiBtn' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.mix( 'pulsed' )
			.m( 'block', isBlock.value )
			.m( 'icon', icon.value )
			.m( 'disabled', disabled.value )
			.m( 'plain', plain.value )
			.m( 'flat', flat.value )
			.m( 'focused', focused.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,
	'type': type.value,

	onClick,
	onFocus,
	onBlur,

} ) );

const containerClass = computed( () => {

	// `aside` — there is a side icon: the container becomes a grid so the
	// content stays centred in the button ( see styles.scss ).
	return element( 'container' )
			.mix( namespace.value )
			.m( 'aside', !!slots.prepend || !!slots.append )
			.classify();

} );

const containerAttrs = computed( () => ( {

	'class': containerClass.value,

} ) );

const prependClass = computed( () => {

	return element( 'prepend' )
			.mix( namespace.value )
			.classify();

} );

const prependAttrs = computed( () => ( {

	'class': prependClass.value,

} ) );

const bodyClass = computed( () => {

	return element( 'body' )
			.mix( namespace.value )
			.classify();

} );

const bodyAttrs = computed( () => ( {

	'class': bodyClass.value,

} ) );

const iconClass = computed( () => {

	return element( 'icon' )
			.mix( namespace.value )
			.classify();

} );

const iconAttrs = computed( () => ( {

	'class': iconClass.value,

} ) );

const appendClass = computed( () => {

	return element( 'append' )
			.mix( namespace.value )
			.classify();

} );

const appendAttrs = computed( () => ( {

	'class': appendClass.value,

} ) );

function onClick ( e: Event ): void {

	e.preventDefault();
	e.stopPropagation();

	emit( 'click', e );

	to.value && navigate( router, to.value );

};

function onFocus ( e: Event ): void {

	e.preventDefault();
	e.stopPropagation();

	focused.value = true;

	emit( 'focus', e );

}

function onBlur ( e: Event ): void {

	e.preventDefault();
	e.stopPropagation();

	focused.value = false;

	emit( 'blur', e );

}

</script>

<style lang="scss">
@use './styles.scss';

.ui-btn {

	background-color: v-bind( color );
	color: v-bind( textColor );

	width: v-bind( width );
	height: v-bind( height );

	border-radius: v-bind( rounded );

	border: v-bind( border );

	box-shadow: v-bind( elevation );

	&__body {

		color: v-bind( textColor );

	}


}

</style>

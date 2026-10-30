<template>

	<div v-bind="mainAttrs">

		<div 
			v-bind:class="prependClass" 
			v-if="slots.prepend"
		>

			<slot name="prepend"/>

		</div>

		<div 
			v-bind:class="iconClass" 
			v-if="slots.icon"
		>

			<slot name="icon"/>

		</div>

		<div 
			v-bind:class="containerClass"
			v-if="slots.default || slots.title || slots.subtitle || slots.content"
		>

			<div 
				v-bind:class="titleClass"
				v-if="slots.default || slots.title"
			>
				
				<div v-bind:class="headingClass" style="width: 100%">

					<slot 
						v-if="slots.title" 
						name="title"
					/>

					<slot v-else/>

				</div>

				<div 
					v-bind:class="titleAppendClass" 
					v-if="slots[ 'title:append' ]"
				>

					<slot name="title:append"/>

				</div>

			</div>

			<div 
				v-bind:class="subtitleClass"
				v-if="slots.subtitle || slots[ 'subtitle:append' ]"
			>

				<div 
					v-bind:class="captionClass" 
					v-if="slots.subtitle"
				>

					<slot name="subtitle"/>

				</div>

				<div 
					v-bind:class="subtitleAppendClass" 
					v-if="slots[ 'subtitle:append' ]"
				>

					<slot name="subtitle:append"/>

				</div>

			</div>

		</div>

		<div 
			v-bind:class="actionClass" 
			v-if="slots.action"
		>

			<slot name="action"/>

		</div>

		<div 
			v-bind:class="appendClass" 
			v-if="slots.append"
		>

			<slot name="append"/>

		</div>

	</div>

</template>

<script lang="ts" setup>
import {

	ref,
	computed,
	useSlots,

} from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	disabled: boolean;
	active: boolean;
	color: string;
	textColor: string;
	subtitleColor: string;
	rounded: string | number;

};

defineOptions( {

	name: 'UiListItem',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	disabled: false,
	active: false,
	color: 'brand',
	textColor: 'text-primary',
	subtitleColor: 'text-secondary',
	rounded: 8,

} );

const { parseValue, parseColor } = useFormat();

const slots = useSlots();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );

const colorToString = computed( () => color.value.toString() );

const rounded = computed( () => parseValue( props?.rounded ).toString() );

const textColor = computed( () => {

	if ( props?.textColor ) {
	
		const _color = useCSSVar( props.textColor, props.theme );

		return parseColor( _color ).toString();

	}

	return color.value.contrast().toString() || useCSSVar( 'text-primary', props.theme );

} );

const subtitleColor = computed( () => {

	if ( props?.subtitleColor ) {
	
		const _color = useCSSVar( props.subtitleColor, props.theme );

		return parseColor( _color ).toString();

	}

	return color.value.contrast().toString() || useCSSVar( 'text-secondary', props.theme );

} );

// An active row is painted with the solid `color` fill, so the theme's own text
// tokens stop applying — text-primary / text-secondary are chosen to read against
// the surface, not against the fill ( on the light theme text-secondary #6b6478
// sank straight into the brand #6D6FA2 ). Derive both from the fill's contrast
// instead, and keep the subtitle's secondary rank with alpha rather than a second
// token: no theme token is guaranteed to read on an arbitrary `color`.
const activeTextColor = computed( () => color.value.contrast().toString() );
const activeSubtitleColor = computed( () => color.value.contrast().opacity( 0.75 ).toString() );

const isHovered = ref<boolean>( false );
const isActive = computed( () => !!props.active );
const isDisabled = computed( () => props.disabled );
const isEnabled = computed( () => !isDisabled.value );

const emit = defineEmits( [ 
	
	'click',
	'hover',

] );

const { block, element } = useBem( 'UiListItem' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

	onClick,
	onMouseenter,
	onMouseleave,

} ) );

const prependClass = computed( () => {

	return element( 'prepend' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const iconClass = computed( () => {

	return element( 'icon' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const containerClass = computed( () => {

	return element( 'container' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const titleClass = computed( () => {

	return element( 'title' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const headingClass = computed( () => {

	return element( 'heading' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const titleAppendClass = computed( () => {

	return element( 'title-append' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const subtitleClass = computed( () => {

	return element( 'subtitle' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const captionClass = computed( () => {

	return element( 'caption' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const subtitleAppendClass = computed( () => {

	return element( 'subtitle-append' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const actionClass = computed( () => {

	return element( 'action' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

const appendClass = computed( () => {

	return element( 'append' )
			.mix( namespace.value )
			.m( 'active', isActive.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.classify();

} );

function onClick ( e: MouseEvent ): void {

	if ( !props.disabled ) {

		e.stopPropagation();

		// Forward the event, as <ui-btn> and <ui-chip> do — a consumer that wants
		// to anchor something at the pointer ( a menu, a tooltip ) has no other
		// way to reach it: a declared emit shadows the native listener, so the
		// parent's @click never sees the DOM event.
		emit( 'click', e );

	}

};

function onMouseenter (): void {

	if ( isEnabled.value ) {

		isHovered.value = true;
		emit( 'hover', true );

	}

};

function onMouseleave (): void {

	if ( isEnabled.value ) {

		isHovered.value = false;
		emit( 'hover', false );

	}

};

</script>

<style lang="scss" scoped>
@use './styles';

.ui-list-item {

	// Default: inherit text color from parent (theme's text-primary, or the
	// contrast color forced by an enclosing <ui-card contrastText>).
	color: inherit;

	border-radius: v-bind( rounded );

	cursor: pointer;

	transition: color .4s ease-in-out;

	&:after {

		content: '';

		position: absolute;
		left: 0;
		top: 0;

		width: 100%;
		height: 100%;

		background-color: v-bind( colorToString );

		opacity: 0;

		transition: opacity .25s ease-in-out;

		z-index: 0;

		// Purely visual tint. It sits above the non-positioned slots ( icon,
		// append, action ), so without this it swallowed clicks meant for buttons
		// placed there and the row's own @click fired instead.
		pointer-events: none;

	}

	// Hover: lay down a subtle brand tint but keep the theme's own text color.
	// Flipping to the solid-fill contrast (white) here made text vanish on the
	// light theme, where a half-opacity brand tint over a white surface stays
	// very pale. A low-opacity tint reads against text-primary in both themes.
	&_hovered:not( &_active ) {

		&:after {

			opacity: 0.16;

		}

	}

	// Active: solid brand fill, so text flips to its contrast color. The tint
	// overlay is dropped — over a solid fill it would only wash the color out.
	// __title / __subtitle need the override spelled out: their own rules below
	// are the ones that actually paint them, so inheriting from the row here
	// would leave the theme tokens sitting on top of the fill.
	&_active {

		color: v-bind( activeTextColor );
		background-color: v-bind( colorToString );

		&:after {

			opacity: 0;

		}

		.ui-list-item__title {

			color: v-bind( activeTextColor );

		}

		.ui-list-item__subtitle {

			color: v-bind( activeSubtitleColor );

		}

	}

	&__title {

		color: v-bind( textColor );

	}

	&__subtitle {

		color: v-bind( subtitleColor );

	}

}

</style>

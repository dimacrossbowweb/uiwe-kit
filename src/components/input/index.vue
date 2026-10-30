<template>

	<label
	
		v-bind="mainAttrs"
		v-bind:class="mainClass"
		
	>

		<div v-bind:class="containerClass">

			<div 
				v-bind:class="prependClass"
				v-if="slots.prepend"
			>

				<slot name="prepend"/>

			</div>

			<div v-bind:class="bodyClass">

				<input
					ref="control"
					v-model="state"
					v-bind="controlAttrs"
					v-bind:class="controlClass"
				/>

				<div v-bind:class="placeholderClass">

					<span v-bind:class="placeholderTextClass">{{ placeholder }}</span>

				</div>

			</div>

			<div
				v-bind:class="appendClass"
				v-if="slots.append"
			>

				<slot name="append"/>

			</div>

		</div>
		
	</label>

</template>

<script lang="ts" setup>
import {

	useSlots,
	useId,
	ref,
	computed,
	nextTick,
	watch,

} from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

export type TInputType = 'text' | 'password' | 'date' | 'datetime-local';
export type IInputAutocomplete = 'on' | 'off';

export interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	type: TInputType;
	color: string;
	placeholder: string;
	autocomplete: IInputAutocomplete;
	autofocus: boolean;
	readonly: boolean;
	disabled: boolean;
	invalid: boolean;
	preventDefault: boolean;
	required: boolean;
	pattern: string;
	maxlength: string | number;
	rounded: string | number;
	height: string | number;

};

defineOptions( {

	name: 'UiInput',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	type: 'text',
	color: 'input',
	autocomplete: 'off',
	autofocus: false,
	readonly: false,
	disabled: false,
	preventDefault: false,
	required: false,
	rounded: 12,
	height: '3.2rem',

} );

const slots = useSlots();

const state = defineModel( { default: '' });

const emit = defineEmits( [ 
	
	'focus', 
	'blur', 
	'hover',
	'mouseenter',
	'mouseleave',
	'input', 
	'change',
	'cut', 
	'copy', 
	'paste',
	'click',
	'changeValue',
	'invalid',

] );

const { parseValue, parseColor } = useFormat();

const isFocused = ref<boolean>( false );
const isHovered = ref<boolean>( false );

const namespace = computed( () => props.namespace );

const rounded = computed( () => parseValue( props?.rounded ).toString() );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );

const colorToString = computed( () => color.value.toString() );

const textColor = computed( () => color.value.contrast().toString() || useCSSVar( 'text-color', props.theme ) );

const height = computed( () => parseValue( props?.height ).toString() );

const isDisabled = computed<boolean>( () => props.disabled );
const isEnabled = computed<boolean>( () => !isDisabled.value );
const isRequired = computed<boolean>( () => !props?.required );
const isInvalid = computed<boolean>( () => !!props?.invalid );

const pattern = computed<string>( () => props?.pattern ?? '' );
const maxlength = computed( () => props?.maxlength );

const control = ref<HTMLElement>();

const { block, element } = useBem( 'UiInput' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'focused', isFocused.value )
			.m( 'hovered', isHovered.value )
			.m( 'disabled', isDisabled.value )
			.m( 'invalid', isInvalid.value )
			.classify();

} );
// The root is a <label>. Without `for` its control is the first labelable
// element inside, and prepend / append may hold buttons that precede the field
// in the DOM: a click anywhere in the field became a click on such a button.
// `for` binds the label to its own control.
const controlId = useId();

const mainAttrs = computed( () => ( {

	for: controlId,

	onMouseenter,
	onMouseleave,
	onClick,

} ) );

const containerClass = computed( () => {

	return element( 'container' )
			.mix( namespace.value )
			.m( 'disabled', props.disabled )
			.classify();

} );

const prependClass = computed( () => {

	return element( 'prepend' )
			.m( 'disabled', props.disabled )
			.classify();

} );

const bodyClass = computed( () => {

	return element( 'body' )
			.m( 'disabled', props.disabled )
			.classify();

} );

const appendClass = computed( () => {

	return element( 'append' )
			.m( 'disabled', props.disabled )
			.classify();

} );

const controlClass = computed( () => {

	return element( 'control' )
			.m( 'disabled', props.disabled )
			.m( 'readonly', props.readonly )
			.classify();

} );

const placeholderClass = computed( () => {

	return element( 'placeholder' )
			.classify();

} );

const placeholderTextClass = computed( () => {

	return element( 'placeholder-text' )
			.m( 'activated', !!state.value || isFocused.value )
			.classify();

} );

const controlAttrs = computed( () => ( {

	id: controlId,

	'type': props.type,
	'autocomplete': props.autocomplete,
	'autofocus': props.autofocus && isEnabled.value,
	'readonly': props.readonly,
	'disabled': props.disabled,
	'pattern': pattern.value,
	'maxlength': maxlength.value,
	'required': isRequired.value,

	onFocus,
	onBlur,
	onChange,
	onInput,
	onCut,
	onCopy,
	onPaste,
	onInvalid,

} ) );

/**
** 
**/
function onFocus (): void {

	if ( isEnabled.value ) {

		isFocused.value = true;
		
		emit( 'focus', true );
		emit( 'blur', false );

	}

};

/**
** 
**/
function onBlur (): void {

	if ( isEnabled.value ) {

		isFocused.value = false;

		emit( 'blur', true );
		emit( 'focus', false );

	}

};

/**
** 
**/
function onChange (): void {

	if ( isEnabled.value ) {

		emit( 'change', state.value );

	}


}

/**
** 
**/
function onInput (): void {

	if ( isEnabled.value ) {

		emit( 'input', state.value );

	}

}

/**
** 
**/
function onCut ( e: Event ): void {

	if ( isEnabled.value ) {

		emit( 'cut', e );

	}

}

/**
** 
**/
function onCopy ( e: Event ): void {

	if ( isEnabled.value ) {

		emit( 'copy', e );

	}

}

/**
** 
**/
function onPaste ( e: Event ): void {

	if ( isEnabled.value ) {

		emit( 'paste', e );

	}

}

/**
** 
**/
function onInvalid ( e: Event ): void {

	if ( isEnabled.value ) {

		emit( 'invalid', e );

	}

}

/**
** 
**/
function onMouseenter (): void {

	if ( isEnabled.value ) {

		isHovered.value = true;

		emit( 'mouseenter', true );
		emit( 'hover', true );

	}

};

/**
** 
**/
function onMouseleave (): void {

	if ( isEnabled.value ) {

		isHovered.value = false;

		emit( 'mouseleave', false );
		emit( 'hover', false );

	}

};

/**
** 
**/
function onClick ( e: Event ): void {

	e.stopPropagation();
	
	if ( props.preventDefault ) {

		e.preventDefault();

	}

	if ( isEnabled.value ) {

		emit( 'click', e );

	} else {

		e.preventDefault();

	}

};

/**
** 
**/
const click: Function = (): void => {

	nextTick( (): void => {

		control?.value?.click();

	} );

};

/**
** 
**/
const focus: Function = (): void => {

	nextTick( (): void => {

		control?.value?.focus();

	} );

};

/**
** @see https://vuejs.org/api/sfc-script-setup.html#defineexpose
**/
defineExpose ( {

	click,
	focus,

} );

watch( state, val => {

	emit('changeValue', val);

});

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-input {

	background-color: v-bind( colorToString );

	border: 2px solid var( --ui-neutral-200 );

	border-radius: v-bind( rounded );

	height: v-bind( height );

	&:before {

		backdrop-filter: brightness( 150% );

		// Chromium doesn't clip a backdrop-filter layer to the parent's rounding
		// ( overflow: hidden ), so round it to the border's inner edge.
		border-radius: max( 0px, calc( v-bind( rounded ) - 2px ) );

	}

	&_focused {

		&:before {

			opacity: 1;

		}

	}

	&__control {

		color: v-bind( textColor );

	}

	&__placeholder {

		color: v-bind( textColor );
		opacity: 0.7;

	}

}

</style>

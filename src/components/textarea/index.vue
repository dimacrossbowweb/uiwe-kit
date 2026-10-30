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

				<textarea
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
	onMounted,

} from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

export type IBreakKey = 'ctrl' | 'meta' | 'shift' | 'alt' | 'enter';

/**
 * Keys that, together with Enter, insert a newline instead of submitting: one
 * key, an array, or a comma-separated string ( 'ctrl, shift' ). Any of them works.
 */
export type IBreakKeys = IBreakKey | IBreakKey[] | string;

export interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	placeholder: string;
	autofocus: boolean;
	readonly: boolean;
	disabled: boolean;
	invalid: boolean;
	maxlength: string | number;
	rounded: string | number;
	maxLines: number;
	breakKey: IBreakKeys;

};

defineOptions( {

	name: 'UiTextarea',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'input',
	autofocus: false,
	readonly: false,
	disabled: false,
	rounded: 12,
	maxLines: 5,
	breakKey: 'ctrl',

} );

const slots = useSlots();

const state = defineModel( { default: '' } );

const emit = defineEmits( [

	'focus',
	'blur',
	'hover',
	'mouseenter',
	'mouseleave',
	'input',
	'change',
	'click',
	'submit',
	'changeValue',
	'selectionchange',

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

const isDisabled = computed<boolean>( () => props.disabled );
const isEnabled = computed<boolean>( () => !isDisabled.value );
const isInvalid = computed<boolean>( () => !!props?.invalid );

const maxlength = computed( () => props?.maxlength );

const control = ref<HTMLTextAreaElement | null>( null );

const { block, element } = useBem( 'UiTextarea' );

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

const containerClass = computed( () => element( 'container' ).mix( namespace.value ).classify() );
const prependClass   = computed( () => element( 'prepend' ).classify() );
const appendClass    = computed( () => element( 'append' ).classify() );
const bodyClass      = computed( () => element( 'body' ).classify() );
const controlClass   = computed( () => element( 'control' ).m( 'readonly', props.readonly ).classify() );
// Label floated up — either the field holds text or it is focused. The box
// moves from the middle of the field to its top edge, the text shrinks; both
// are animated properties, not a change of layout ( see styles.scss ).
const isActivated = computed<boolean>( () => !!state.value || isFocused.value );

const placeholderClass = computed( () =>

	element( 'placeholder' )
		.m( 'activated', isActivated.value )
		.classify()

);

const placeholderTextClass = computed( () =>

	element( 'placeholder-text' )
		.m( 'activated', isActivated.value )
		.classify()

);

const controlAttrs = computed( () => ( {

	id: controlId,

	'autofocus': props.autofocus && isEnabled.value,
	'readonly': props.readonly,
	'disabled': props.disabled,
	'maxlength': maxlength.value,
	rows: 1,

	onFocus,
	onBlur,
	onChange,
	onInput,
	onKeydown,
	onSelectionchange,

} ) );

function autoResize (): void {

	const ta = control.value;
	if ( !ta ) return;

	ta.style.height = 'auto';

	const cs = getComputedStyle( ta );
	const lh = parseFloat( cs.lineHeight );
	const padTop = parseFloat( cs.paddingTop ) || 0;
	const padBottom = parseFloat( cs.paddingBottom ) || 0;

	const lineHeight = isNaN( lh ) ? parseFloat( cs.fontSize ) * 1.4 : lh;
	const maxLines = Math.max( 1, props.maxLines || 1 );
	const maxHeight = lineHeight * maxLines + padTop + padBottom;

	const next = Math.min( ta.scrollHeight, maxHeight );

	ta.style.height = next + 'px';
	ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden';

}

const BREAK_MODIFIERS: Record<Exclude<IBreakKey, 'enter'>, ( e: KeyboardEvent ) => boolean> = {

	ctrl:  e => e.ctrlKey,
	meta:  e => e.metaKey,
	shift: e => e.shiftKey,
	alt:   e => e.altKey,

};

const isBreakKey = ( key: string ): key is IBreakKey => key === 'enter' || key in BREAK_MODIFIERS;

// `breakKey` normalised to a list: array or comma-separated string, case and
// spaces ignored, unknown keys dropped. If none remain, fall back to the
// default ( ctrl ).
const breakKeys = computed<IBreakKey[]>( () => {

	const raw  = props.breakKey;
	const list = ( Array.isArray( raw ) ? raw : String( raw ?? '' ).split( ',' ) )
		.map( key => String( key ).trim().toLowerCase() )
		.filter( isBreakKey );

	return list.length ? [ ...new Set( list ) ] : [ 'ctrl' ];

} );

function onKeydown ( e: KeyboardEvent ): void {

	if ( e.key !== 'Enter' ) return;

	// With a modifier held (e.g. Ctrl+Enter) the browser inserts no newline by
	// itself, so it's done manually.
	const byModifier = breakKeys.value.some( key => key !== 'enter' && BREAK_MODIFIERS[ key ]( e ) );

	if ( byModifier ) {

		e.preventDefault();
		insertAtCaret( '\n' );
		return;

	}

	// 'enter' in the list: plain Enter is a newline too — the browser's own.
	if ( breakKeys.value.includes( 'enter' ) ) return;

	// plain Enter without the configured combo => submit
	e.preventDefault();
	emit( 'submit', state.value );

}

function insertAtCaret ( text: string ): void {

	const ta = control.value;
	if ( !ta ) return;

	const start = ta.selectionStart ?? state.value.length;
	const end = ta.selectionEnd ?? state.value.length;
	const before = String( state.value ).slice( 0, start );
	const after  = String( state.value ).slice( end );

	state.value = before + text + after;

	nextTick( () => {

		if ( !ta ) return;
		const pos = start + text.length;
		ta.selectionStart = ta.selectionEnd = pos;
		autoResize();

	} );

}

function onFocus (): void {

	if ( !isEnabled.value ) return;
	isFocused.value = true;
	emit( 'focus', true );

}

function onBlur (): void {

	if ( !isEnabled.value ) return;
	isFocused.value = false;
	emit( 'blur', true );

}

function onChange (): void {

	if ( isEnabled.value ) emit( 'change', state.value );

}

function onInput (): void {

	if ( isEnabled.value ) emit( 'input', state.value );

}

function onMouseenter (): void {

	if ( !isEnabled.value ) return;
	isHovered.value = true;
	emit( 'mouseenter', true );

}

function onMouseleave (): void {

	if ( !isEnabled.value ) return;
	isHovered.value = false;
	emit( 'mouseleave', false );

}

function onClick ( e: Event ): void {

	if ( isEnabled.value ) emit( 'click', e );

}

const focus: () => void = () => {

	// Check `disabled` inside nextTick: the typical call comes right after the
	// owner clears its busy flag, and synchronously the prop is still stale.
	nextTick( () => {

		if ( isDisabled.value ) return;

		control.value?.focus();

	} );

};

const blur: () => void = () => {

	control.value?.blur();

};

function onSelectionchange (): void {

	if ( !isEnabled.value ) return;

	const ta = control.value;
	if ( !ta ) return;

	emit( 'selectionchange', {
		selectionStart: ta.selectionStart,
		selectionEnd: ta.selectionEnd,
		value: state.value,
	} );

}

defineExpose( { focus, blur, control } );

watch( state, ( v ) => {

	emit( 'changeValue', v );
	nextTick( autoResize );

} );

onMounted( () => {

	autoResize();

	// The browser honours `autofocus` only on initial document load; a component
	// mounted later ( always the case in an SPA ) must focus itself.
	if ( props.autofocus ) focus();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-textarea {

	background-color: v-bind( colorToString );

	border: 2px solid var( --ui-neutral-200 );

	border-radius: v-bind( rounded );

	min-height: 3.2rem;

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

	&__container {

		// Unlike a single-line <input>, a <textarea> does not vertically center
		// its own content, so center the auto-height control here to keep the
		// resting appearance identical to ui-input.
		align-items: center;

	}

	&__control {

		display: block;

		line-height: 1.4;

		color: v-bind( textColor );

		resize: none;

		// Scrollbar look is global ( styles/_scrollbar.scss ). Don't set
		// scrollbar-width here: in Chromium it would disable ::-webkit-scrollbar.

		&::placeholder {

			color: transparent;

		}

	}

	&__placeholder {

		color: v-bind( textColor );
		opacity: 0.7;

	}

}

</style>

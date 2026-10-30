<template>

	<div v-bind="mainAttrs">

		<input
			v-for="i in indices"
			:key="i"
			:ref="el => setRef(el, i)"
			class="ui-input-pin__box"
			type="text"
			inputmode="numeric"
			maxlength="2"
			:value="digits[i]"
			autocomplete="one-time-code"
			@input="onInput(i, $event)"
			@keydown="onKeydown(i, $event)"
			@paste.prevent="onPaste(i, $event)"
			@focus="onFocus(i, $event)"
		/>

	</div>

</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme?: 'auto' | 'light' | 'dark';
	namespace?: string;
	modelValue?: string;
	length?: number;
	color?: string;
	rounded?: string | number;
	height?: string | number;
	width?: string | number;
}

defineOptions( { name: 'UiInputPin' } );

const props = withDefaults( defineProps<IProps>(), {

	theme: 'auto',
	namespace: '',
	modelValue: '',
	length: 4,
	color: 'input',
	rounded: 12,
	height: '3.2rem',
	width: '3.2rem',
} );

const emit = defineEmits<{
	'update:modelValue': [ value: string ];
	'complete': [ value: string ];
}>();

const { parseValue, parseColor } = useFormat();

// ── Layout ────────────────────────────────────────────────────────────────────

const safeLength = computed( () => Math.max( 1, Math.floor( props.length ?? 4 ) ) );

const indices = computed( () => Array.from( { length: safeLength.value }, ( _, i ) => i ) );

// ── Digits ────────────────────────────────────────────────────────────────────

const digits = computed( () =>
	indices.value.map( i => ( props.modelValue ?? '' )[ i ] ?? '' )
);

function updateModel( arr: string[] ): void {
	const next = arr.join( '' );
	emit( 'update:modelValue', next );
	if ( next.length === safeLength.value ) emit( 'complete', next );
}

// ── Refs ──────────────────────────────────────────────────────────────────────

const boxRefs = ref<HTMLInputElement[]>( [] );

function setRef( el: unknown, i: number ): void {
	if ( el instanceof HTMLInputElement ) boxRefs.value[ i ] = el;
}

function focusBox( i: number ): void {
	const el = boxRefs.value[ i ];
	if ( !el ) return;
	el.focus();
	el.select();
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function onFocus( i: number, e: FocusEvent ): void {
	( e.target as HTMLInputElement ).select();
}

function onInput( i: number, e: Event ): void {
	const raw = ( e.target as HTMLInputElement ).value.replace( /\D/g, '' );
	const digit = raw.slice( -1 );  // keep only last character (handles replace-while-filled)

	const arr = digits.value.slice();
	arr[ i ] = digit;
	updateModel( arr );

	if ( digit && i < safeLength.value - 1 ) {
		nextTick( () => focusBox( i + 1 ) );
	}
}

function onKeydown( i: number, e: KeyboardEvent ): void {
	if ( e.key === 'Backspace' ) {
		if ( !digits.value[ i ] ) {
			// Box is already empty — move focus to previous
			e.preventDefault();
			if ( i > 0 ) focusBox( i - 1 );
		}
		// Otherwise let the browser clear the box, onInput will fire
		return;
	}

	if ( e.key === 'Delete' ) return;

	if ( e.key === 'ArrowLeft' ) {
		e.preventDefault();
		if ( i > 0 ) focusBox( i - 1 );
		return;
	}

	if ( e.key === 'ArrowRight' ) {
		e.preventDefault();
		if ( i < safeLength.value - 1 ) focusBox( i + 1 );
		return;
	}

	// Block any key that is not a digit or a control key
	if ( e.key.length === 1 && !/\d/.test( e.key ) ) {
		e.preventDefault();
	}
}

function onPaste( i: number, e: ClipboardEvent ): void {
	const text = e.clipboardData?.getData( 'text' ) ?? '';
	const pasted = text.replace( /\D/g, '' );
	if ( !pasted ) return;

	const arr = digits.value.slice();
	let j = 0;
	for ( let k = i; k < safeLength.value && j < pasted.length; k++, j++ ) {
		arr[ k ] = pasted[ j ] ?? '';
	}
	updateModel( arr );

	const nextFocus = Math.min( i + pasted.length, safeLength.value - 1 );
	nextTick( () => focusBox( nextFocus ) );
}

// ── Styling ───────────────────────────────────────────────────────────────────

const colorVar    = computed( () => useCSSVar( props.color, props.theme ) );
const bgColor     = computed( () => parseColor( colorVar.value || props.color ).toString() );
const textColor   = computed( () => parseColor( bgColor.value ).contrast().toString() );
const borderColor = computed( () => parseColor( useCSSVar( 'neutral-200', props.theme ) || '#d6cfe5' ).toString() );
const focusColor  = computed( () => parseColor( useCSSVar( 'brand', props.theme ) || '#7c5cff' ).toString() );
const boxHeight   = computed( () => parseValue( props.height ).toString() );
const boxWidth    = computed( () => parseValue( props.width ).toString() );
const boxRounded  = computed( () => parseValue( props.rounded ).toString() );

const { block } = useBem( 'UiInputPin' );

const mainClass = computed( () => block.mix( props.namespace ?? '' ).classify() );

const mainAttrs = computed( () => ( { class: mainClass.value } ) );
</script>

<style scoped>
.ui-input-pin {
	display: inline-flex;
	flex-direction: row;
	gap: 10px;
}

.ui-input-pin__box {
	display: flex;
	align-items: center;
	justify-content: center;
	width: v-bind( boxWidth );
	height: v-bind( boxHeight );
	border-radius: v-bind( boxRounded );
	border: 2px solid v-bind( borderColor );
	background-color: v-bind( bgColor );
	color: v-bind( textColor );
	font-size: 20px;
	font-weight: 600;
	font-family: inherit;
	text-align: center;
	outline: none;
	transition: border-color 150ms, box-shadow 150ms;
	box-sizing: border-box;
	caret-color: transparent;
}

.ui-input-pin__box:focus {
	border-color: v-bind( focusColor );
	box-shadow: 0 0 0 3px color-mix(in srgb, v-bind( focusColor ) 18%, transparent);
}
</style>

<template>

	<div v-bind="mainAttrs">

		<ui-input
			v-bind="$attrs"
			:model-value="displayValue"
			:maxlength="displayMaxLength"
			@update:model-value="handleUpdate"
			@keydown="handleKeydown"
			@paste="handlePaste"
		>

			<template #prepend>
				<slot name="prepend">
					<span
						v-if="autoCountry"
						:class="`fi fi-${autoCountry}`"
						class="ui-input-phone__flag"
					/>
				</slot>
			</template>

			<template v-if="slots.append" #append>
				<slot name="append" />
			</template>

		</ui-input>

	</div>

</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import { useBem } from '@/composables/useBem';
import { detectCountryByPhone } from '@/composables/usePhoneCountry';

interface IFormatPart {
	type: 'digit' | 'fixed' | 'sep';
	char: string;
}

interface IProps {

	theme?: 'auto' | 'light' | 'dark';
	namespace?: string;
	modelValue?: string;
	/**
	 * Mask string where:
	 *   x       = user-input digit slot
	 *   0–9     = fixed digit (always shown, cursor skips over it)
	 *   any other char = separator inserted automatically
	 * Default: full Russian number  +7 xxx xxx xx xx
	 */
	format?: string;
}

defineOptions( { name: 'UiInputPhone', inheritAttrs: false } );

const props = withDefaults( defineProps<IProps>(), {

	theme: 'auto',
	namespace: '',
	modelValue: '',
	format: 'x_xxx_xxx_xx_xx',
} );

const emit = defineEmits<{
	'update:modelValue': [ value: string ];
}>();

const slots = useSlots();

// ─── Format parsing ──────────────────────────────────────────────────────────

const formatParts = computed<IFormatPart[]>( () =>
	[ ...( props.format ?? '' ) ].map( ch => {
		if ( ch === 'x' ) return { type: 'digit', char: 'x' };
		if ( /\d/.test( ch ) ) return { type: 'fixed', char: ch };
		return { type: 'sep', char: ' ' };
	} )
);

const maxDigits = computed( () =>
	formatParts.value.filter( p => p.type === 'digit' ).length
);

// ─── Display value ───────────────────────────────────────────────────────────

/**
 * Builds the formatted string (without leading '+') from raw user digits.
 *
 * Rules:
 *  - fixed parts are always emitted
 *  - sep parts are emitted alongside surrounding content
 *  - digit parts consume one user digit; if none left, stop
 *  - after the loop the result is trimmed to the last user-digit position
 *    (removes any trailing fixed/sep that accumulated before the first
 *    unmatched digit slot)
 *  - if no user digits at all, the leading fixed/sep sequence
 *    (everything before the first 'digit' slot) is returned trimmed
 */
function applyFormat( rawDigits: string ): string {
	let result = '';
	let di = 0;
	let lastUserPos = -1;

	for ( const part of formatParts.value ) {
		if ( part.type === 'digit' ) {
			if ( di >= rawDigits.length ) break;
			result += rawDigits[ di++ ];
			lastUserPos = result.length - 1;
		} else if ( part.type === 'fixed' ) {
			result += part.char;
		} else {
			result += ' ';
		}
	}

	if ( lastUserPos >= 0 ) {
		return result.slice( 0, lastUserPos + 1 );
	}

	// No user digits yet — show leading fixed/sep up to the first digit slot.
	let leading = '';
	for ( const part of formatParts.value ) {
		if ( part.type === 'digit' ) break;
		leading += part.type === 'fixed' ? part.char : ' ';
	}
	return leading.trimEnd();
}

const displayValue = computed( () => {
	const digits = ( props.modelValue ?? '' ).replace( /\D/g, '' );
	const formatted = applyFormat( digits );
	return formatted ? '+' + formatted : '';
} );

const displayMaxLength = computed( () => {
	const dummy = '0'.repeat( maxDigits.value );
	const f = applyFormat( dummy );
	return f ? ( '+' + f ).length : 20;
} );

// ─── Country flag ─────────────────────────────────────────────────────────────

/**
 * Digits the format hardcodes before the first user slot — i.e. the country
 * code when it's baked into the mask (the "7" in "7_xxx_xxx_xx_xx"). The
 * modelValue only carries the digits the user types, so these are missing from
 * it and must be prepended before country detection. When the country code is a
 * user slot instead (e.g. "x_xxx_…") this is empty and detection runs on the
 * modelValue as-is.
 */
const fixedPrefixDigits = computed<string>( () => {
	let out = '';
	for ( const part of formatParts.value ) {
		if ( part.type === 'digit' ) break;
		if ( part.type === 'fixed' ) out += part.char;
	}
	return out;
} );

const autoCountry = computed( () =>
	detectCountryByPhone(
		fixedPrefixDigits.value + ( props.modelValue ?? '' ).replace( /\D/g, '' ),
	)
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the format part that occupies display position `displayPos`
 * (0 = the '+' sign itself → null; 1 = first formatted char = formatParts[0]).
 */
function partAtDisplayPos( displayPos: number ): IFormatPart | null {
	if ( displayPos <= 0 ) return null;
	return formatParts.value[ displayPos - 1 ] ?? null;
}

/**
 * Counts user-input digit slots in the range [fromDisplayPos, toDisplayPos).
 */
function userDigitsInRange( fromDisplayPos: number, toDisplayPos: number ): number {
	let n = 0;
	for ( let dp = fromDisplayPos; dp < toDisplayPos; dp++ ) {
		if ( partAtDisplayPos( dp )?.type === 'digit' ) n++;
	}
	return n;
}

/**
 * Extracts only the user-typed digits from a display value string.
 * Fixed digits are identified by position in the format and skipped.
 */
function extractUserDigits( displayVal: string ): string {
	const allDigits = displayVal.replace( /^\+/, '' ).replace( /[^0-9]/g, '' );
	let result = '';
	let idx = 0;
	for ( const part of formatParts.value ) {
		if ( part.type === 'sep' ) continue;
		if ( idx >= allDigits.length ) break;
		if ( part.type === 'fixed' ) {
			if ( allDigits[ idx ] === part.char ) idx++;
			// mismatch: user deleted the fixed digit — don't consume, it'll be restored
		} else {
			result += allDigits[ idx++ ];
		}
	}
	return result;
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function handleUpdate( newVal: unknown ): void {
	const str = typeof newVal === 'string' ? newVal : '';
	const digits = extractUserDigits( str ).slice( 0, maxDigits.value );
	emit( 'update:modelValue', digits );
}

function handleKeydown( e: KeyboardEvent ): void {
	const input = e.target as HTMLInputElement;
	if ( input.tagName !== 'INPUT' ) return;

	const pos = input.selectionStart ?? 0;

	// ── Reject any printable non-digit keystroke ────────────────────────────
	// A single-char `key` with no modifier is an actual character insertion
	// (letters, spaces, punctuation). Anything but a digit is dropped here so it
	// never reaches the DOM — the controlled-value re-extraction can't revert it
	// when the filtered result is unchanged. Shortcuts (Ctrl/Cmd+V, Ctrl+A, …)
	// and navigation keys (Backspace, Arrow*, Tab, Enter) are left alone.
	if (
		e.key.length === 1 &&
		!e.ctrlKey && !e.metaKey && !e.altKey &&
		!/\d/.test( e.key )
	) {
		e.preventDefault();
		return;
	}

	// ── Backspace / Delete handling ─────────────────────────────────────────
	const isBack = e.key === 'Backspace';
	const isDel  = e.key === 'Delete';

	if ( isBack || isDel ) {
		const targetPos = isBack ? pos - 1 : pos;  // display position being deleted
		if ( targetPos < 0 ) return;

		// Can't delete the leading '+'.
		if ( targetPos === 0 ) { e.preventDefault(); return; }

		const part = partAtDisplayPos( targetPos );
		if ( !part ) return;

		if ( part.type === 'fixed' ) {
			// Fixed digit — not deletable.
			e.preventDefault();
			return;
		}

		if ( part.type === 'sep' ) {
			// Separator — skip it and remove the nearest user digit instead.
			e.preventDefault();
			const raw = ( props.modelValue ?? '' ).replace( /\D/g, '' );
			if ( isBack ) {
				// Delete the last user digit before this separator.
				const userBefore = userDigitsInRange( 1, targetPos );
				if ( userBefore > 0 ) {
					emit( 'update:modelValue', raw.slice( 0, userBefore - 1 ) + raw.slice( userBefore ) );
				}
			} else {
				// Delete the first user digit after this separator.
				const userBefore = userDigitsInRange( 1, targetPos + 1 );
				if ( userBefore < raw.length ) {
					emit( 'update:modelValue', raw.slice( 0, userBefore ) + raw.slice( userBefore + 1 ) );
				}
			}
		}
		// user digit: let the browser handle it normally; handleUpdate will re-extract
	}
}

// ─── BEM ─────────────────────────────────────────────────────────────────────

/**
 * Paste handler: keep only the digits from the clipboard and splice them into
 * the raw number at the caret, replacing any selected range. Done manually
 * (preventDefault) so non-digits never land in the DOM — a clipboard string
 * with no digits would otherwise leave its letters visible, since the unchanged
 * model can't trigger a re-render to wipe them.
 */
function handlePaste( e: ClipboardEvent ): void {
	e.preventDefault();

	const pasted = ( e.clipboardData?.getData( 'text' ) ?? '' ).replace( /\D/g, '' );
	if ( !pasted ) return;

	const input = e.target as HTMLInputElement;
	const raw   = ( props.modelValue ?? '' ).replace( /\D/g, '' );

	// Map the display selection (caret over the formatted string) onto user-digit
	// indices so the paste lands at the caret and replaces any highlighted digits.
	const selStart = input.selectionStart ?? raw.length;
	const selEnd   = input.selectionEnd ?? selStart;
	const startIdx = userDigitsInRange( 1, selStart );
	const endIdx   = userDigitsInRange( 1, selEnd );

	const next = ( raw.slice( 0, startIdx ) + pasted + raw.slice( endIdx ) )
		.slice( 0, maxDigits.value );

	emit( 'update:modelValue', next );
}

const { block } = useBem( 'UiInputPhone' );
const mainClass  = computed( () => block.mix( props.namespace ?? '' ).classify() );
const mainAttrs  = computed( () => ( { class: mainClass.value } ) );
</script>

<style scoped>
.ui-input-phone__flag {
	font-size: 18px;
	line-height: 1;
	flex-shrink: 0;
}
</style>

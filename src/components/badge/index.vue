<template>

	<span v-bind="rootAttrs">

		<template v-if="!dot">

			<slot>{{ displayValue }}</slot>

		</template>

	</span>

</template>

<script lang="ts" setup>
import { useSlots, computed } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

defineOptions( {

	name: 'UiBadge',

} );

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	content: string | number;
	color: string;
	textColor: string;
	size: string | number;
	max: number;
	dot: boolean;
	floating: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	content: '',
	color: 'brand',
	textColor: '',
	size: 20,
	max: 0,
	dot: false,
	floating: false,

} );

const {

	parseColor,
	parseValue,

} = useFormat();

const slots = useSlots();

const emit = defineEmits( [ 'click' ] );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

// Resolve the fill: a CSS var name ( e.g. 'brand' ) if one exists for the active
// / forced theme, otherwise the raw value as given.
const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );
const background = computed( () => color.value.toString() );

// Text defaults to the fill's contrast colour ( white on brand ). An explicit
// text-color prop overrides it, resolved the same var-or-raw way as the fill.
const textColor = computed( () => {

	if ( props.textColor ) {

		const varValue = useCSSVar( props.textColor, props.theme );
		return parseColor( varValue ? varValue : props.textColor ).toString();

	}

	return color.value.contrast().toString();

} );

// A dot renders as a fixed square rounded to a circle; a labelled badge grows
// with its content, so it needs a min-width and side padding to stay a pill.
const sizeValue = computed( () => parseValue( props.size ) );
const sizeNumber = computed( () => {

	const num = Number( sizeValue.value.value );
	return Number.isFinite( num ) ? num : 20;

} );

const size = computed( () => sizeValue.value.toString() );
const minWidth = computed( () => size.value );
const radius = computed( () => `${ sizeNumber.value / 2 }px` );
const fontSize = computed( () => `${ Math.max( 10, Math.round( sizeNumber.value * 0.55 ) ) }px` );
const padding = computed( () => props.dot ? '0' : '0 6px' );

// Numeric content past `max` is shown as "max+" ( e.g. 99+ ). A slot, when
// present, wins over content entirely.
const displayValue = computed( () => {

	if ( slots.default ) return '';

	const raw = props.content;
	if ( raw === '' || raw === null || raw === undefined ) return '';

	const num = Number( raw );
	if ( props.max > 0 && Number.isFinite( num ) && num > props.max ) {

		return `${ props.max }+`;

	}

	return String( raw );

} );

const { block } = useBem( 'UiBadge' );

const rootClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'dot', props.dot )
			.m( 'floating', props.floating )
			.classify();

} );

const rootAttrs = computed( () => ( {

	class: rootClass.value,

	onClick,

} ) );

function onClick ( e: Event ): void {

	emit( 'click', e );

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-badge {

	height: v-bind( size );
	min-width: v-bind( minWidth );
	padding: v-bind( padding );
	border-radius: v-bind( radius );

	background: v-bind( background );
	color: v-bind( textColor );

	font-size: v-bind( fontSize );

}

</style>

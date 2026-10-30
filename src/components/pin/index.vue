<template>

	<div v-bind="mainAttrs" :style="positionStyle">

		<slot />

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

type TDirection =
	| 'left-top'    | 'center-top'    | 'right-top'
	| 'left-center' | 'center'        | 'right-center'
	| 'left-bottom' | 'center-bottom' | 'right-bottom';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	absolute:  boolean;
	direction: TDirection;
	offset:    string | number;
	top:       string | number;
	right:     string | number;
	bottom:    string | number;
	left:      string | number;

};

defineOptions( {

	name: 'UiPin',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	absolute:  false,
	direction: 'center',
	offset:    0,

} );

const { parseValue } = useFormat();

const namespace = computed( () => props.namespace );
const absolute  = computed( () => !!props.absolute );
const direction = computed<TDirection>( () => props.direction );

interface ISides {
	top:    string;
	right:  string;
	bottom: string;
	left:   string;
}

function parseOffset ( input: string | number ): ISides {

	if ( typeof input === 'number' ) {

		const v = parseValue( input ).toString();
		return { top: v, right: v, bottom: v, left: v };

	}

	const tokens = String( input ).trim().split( /\s+/ ).filter( Boolean );
	const parsed = tokens.map( ( t ) => parseValue( t ).toString() );

	// Each case below only reads indices its own `length` guarantees, so the
	// '0px' fallback is unreachable — it exists to satisfy the indexed access.
	const at = ( i: number ): string => parsed[ i ] ?? '0px';

	switch ( parsed.length ) {
		case 0:  return { top: '0px',    right: '0px',    bottom: '0px',    left: '0px'    };
		case 1:  return { top: at( 0 ),  right: at( 0 ),  bottom: at( 0 ),  left: at( 0 )  };
		case 2:  return { top: at( 0 ),  right: at( 1 ),  bottom: at( 0 ),  left: at( 1 )  };
		case 3:  return { top: at( 0 ),  right: at( 1 ),  bottom: at( 2 ),  left: at( 1 )  };
		default: return { top: at( 0 ),  right: at( 1 ),  bottom: at( 2 ),  left: at( 3 )  };
	}

}

const offsetSides = computed<ISides>( () => parseOffset( props.offset ) );

const sides = computed<ISides>( () => {

	const o = offsetSides.value;

	return {
		top:    props.top    !== undefined ? parseValue( props.top    ).toString() : o.top,
		right:  props.right  !== undefined ? parseValue( props.right  ).toString() : o.right,
		bottom: props.bottom !== undefined ? parseValue( props.bottom ).toString() : o.bottom,
		left:   props.left   !== undefined ? parseValue( props.left   ).toString() : o.left,
	};

} );

// ── Direction → anchors ────────────────────────────────────────────────────

type THorizontal = 'left' | 'center' | 'right';
type TVertical   = 'top'  | 'center' | 'bottom';

const anchors = computed<{ h: THorizontal; v: TVertical }>( () => {

	if ( direction.value === 'center' ) return { h: 'center', v: 'center' };

	const [ a, b ] = direction.value.split( '-' );
	return { h: a as THorizontal, v: b as TVertical };

} );

const positionStyle = computed<Record<string, string>>( () => {

	const { h, v } = anchors.value;
	const s        = sides.value;

	const style: Record<string, string> = {
		position: absolute.value ? 'absolute' : 'fixed',
	};

	// Horizontal anchor
	if ( h === 'left' ) {
		style.left  = s.left;
		style.right = 'auto';
	} else if ( h === 'right' ) {
		style.right = s.right;
		style.left  = 'auto';
	} else {
		style.left  = '50%';
		style.right = 'auto';
	}

	// Vertical anchor
	if ( v === 'top' ) {
		style.top    = s.top;
		style.bottom = 'auto';
	} else if ( v === 'bottom' ) {
		style.bottom = s.bottom;
		style.top    = 'auto';
	} else {
		style.top    = '50%';
		style.bottom = 'auto';
	}

	// Center anchors shift via transform (pin's own bounding box).
	const tx: string[] = [];
	if ( h === 'center' ) tx.push( 'translateX(-50%)' );
	if ( v === 'center' ) tx.push( 'translateY(-50%)' );
	if ( tx.length ) style.transform = tx.join( ' ' );

	return style;

} );

// ── BEM ────────────────────────────────────────────────────────────────────

const { block } = useBem( 'UiPin' );

const mainClass = computed( () => {

	return block
		.mix( namespace.value )
		.m( 'absolute', absolute.value )
		.m( 'direction', direction.value )
		.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-pin {

	display: inline-block;

}
</style>

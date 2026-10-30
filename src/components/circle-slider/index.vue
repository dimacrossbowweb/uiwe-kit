<template>

    <div

        ref="root"
        v-bind="rootAttrs"

    >

        <div v-bind="trackAttrs"></div>

        <div v-bind="thumbAttrs"></div>

        <div v-bind="contentAttrs">

            <slot :angle="angle">{{ angle }}&deg;</slot>

        </div>

    </div>

</template>

<script lang="ts" setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
} from 'vue';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
	color: string;
    borderColor: string;
	disabled: boolean;
	size: string | number;
    thickness: string | number;
    thumb: string | number;
    step: number;

};

defineOptions( {

    name: 'UiCircleSlider',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
	color: 'brand',
    borderColor: 'neutral',
	disabled: false,
	size: 120,
    thickness: 3,
    thumb: 18,
    step: 1,

} );

const root = ref<HTMLElement>();

const value = defineModel<number>( { default: 0 } );

const focused = ref<boolean>( false );

const { parseValue, parseColor } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );
const disabled = computed( () => !!props?.disabled );

const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );
const borderColor = computed( () => parseColor( borderColorVar?.value ? borderColorVar.value : props.borderColor ).toString() );

const sizeNum = computed( () => +props?.size );
const thumbNum = computed( () => +props?.thumb );
const step = computed( () => +props?.step || 1 );

const size = computed( () => parseValue( sizeNum.value ).toString() );
const thickness = computed( () => parseValue( props?.thickness ).toString() );
const thumb = computed( () => parseValue( thumbNum.value ).toString() );

// Angle normalized into the [ 0, 360 ) range.
const angle = computed( () => ( ( value.value % 360 ) + 360 ) % 360 );

// Radius the thumb centre travels along ( the outline centreline ).
const radius = computed( () => ( sizeNum.value - ( +props?.thickness || 0 ) ) / 2 );

// Thumb centre position, with 0deg at the top and growing clockwise.
const thumbLeft = computed( () => {

    const rad: number = ( angle.value - 90 ) * Math.PI / 180;

    return `${ sizeNum.value / 2 + radius.value * Math.cos( rad ) }px`;

} );

const thumbTop = computed( () => {

    const rad: number = ( angle.value - 90 ) * Math.PI / 180;

    return `${ sizeNum.value / 2 + radius.value * Math.sin( rad ) }px`;

} );

const { block, element } = useBem( 'UiCircleSlider' );

const rootClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'disabled', disabled.value )
            .classify();

} );

const rootAttrs = computed( () => ( {

    'class': rootClass.value,

} ) );

const trackClass = computed( () => {

    return element( 'track' )
            .mix( namespace.value )
            .classify();

} );

const trackAttrs = computed( () => ( {

    'class': trackClass.value,

} ) );

const thumbClass = computed( () => {

    return element( 'thumb' )
            .mix( namespace.value )
            .m( 'focused', focused.value )
            .classify();

} );

const thumbAttrs = computed( () => ( {

    'class': thumbClass.value,

} ) );

const contentClass = computed( () => {

    return element( 'content' )
            .mix( namespace.value )
            .classify();

} );

const contentAttrs = computed( () => ( {

    'class': contentClass.value,

} ) );

onMounted( () => {

    if ( root.value instanceof HTMLElement ) {

        root.value.addEventListener( 'mousedown', onMouseDown );

    }

} );

onBeforeUnmount( () => {

    document.removeEventListener( 'mousemove', onMouseMove );
    document.removeEventListener( 'mouseup', onMouseUp );

    root.value?.removeEventListener( 'mousedown', onMouseDown );

} );

function onMouseDown ( e: MouseEvent ) {

    document.addEventListener( 'mousemove', onMouseMove );
    document.addEventListener( 'mouseup', onMouseUp );

    calculateAngle( e );

    focused.value = true;

}

function onMouseMove ( e: MouseEvent ) {

    calculateAngle( e );

}

function onMouseUp () {

    document.removeEventListener( 'mousemove', onMouseMove );
    document.removeEventListener( 'mouseup', onMouseUp );

    focused.value = false;

}

function calculateAngle ( e: MouseEvent ) {

    if ( !( root.value instanceof HTMLElement ) ) return;

    const { left, top, width, height } = root.value.getBoundingClientRect();

    const cx: number = left + width / 2;
    const cy: number = top + height / 2;

    const dx: number = e.clientX - cx;
    const dy: number = e.clientY - cy;

    // atan2 gives 0 at the right growing clockwise; shift by 90deg so 0 sits at the top.
    let deg: number = Math.atan2( dy, dx ) * 180 / Math.PI + 90;

    if ( deg < 0 ) deg += 360;

    const snapped: number = Math.round( deg / step.value ) * step.value % 360;

    // The model stays unwrapped ( it can run past 360 or below 0 ): we only ever
    // add the shortest signed step from the current angle to the pointer one.
    // Clamping to [ 0, 360 ) here would make a drag across the top seam emit
    // 359 -> 0, and a consumer animating the value would spin a full turn back.
    const delta: number = ( ( snapped - angle.value + 540 ) % 360 ) - 180;

    value.value += delta;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-circle-slider {

    width: v-bind( size );
    height: v-bind( size );

    &__track {

        border: v-bind( thickness ) solid v-bind( borderColor );

    }

    &__thumb {

        left: v-bind( thumbLeft );
        top: v-bind( thumbTop );

        width: v-bind( thumb );
        height: v-bind( thumb );

        background-color: #eeeeee;

        border: 3px solid v-bind( color );

        box-shadow: 0 0 15px #000000;

        &_focused {

            box-shadow: 0 0 15px v-bind( color );

            filter: brightness( 150% );

        }

    }

}

</style>

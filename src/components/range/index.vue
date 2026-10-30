<template>

    <div
    
        ref="range"
        v-bind="mainAttrs"
        
    >

        <div v-bind="trackAttrs">

            <div v-bind="indicatorAttrs">

            </div>

            <div v-bind="railAttrs">

                <div
                
                    v-bind="thumbAttrs"
                    
                ></div>

<!-- 
                <ui-tooltip :title="value">

                    <template #activator="{ setRef, onShow, onHide }">

                        <div
                        
                            v-bind="thumbAttrs"
                            :ref="setRef"
                            @mousedown="onShow"
                            @mouseup="onHide"
                            
                        ></div>

                    </template>

                </ui-tooltip> -->

            </div>
            
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
	disabled: boolean;
	width: string | number;
    height: string | number;
    min: string | number;
    max: string | number;
    step: string | number;
    size: string | number;
    vertical: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
	color: 'brand',
	disabled: false,
	width: '100%',
    height: 6,
    min: 0,
    max: 100,
    step: 1,
    size: 18,
    vertical: false,

} );

const range = ref<HTMLElement>();

const value = defineModel( { default: 0 } );

const focused = ref<boolean>( false );

const { parseValue, parseColor } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );
const disabled = computed( () => !!props?.disabled );
const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );
const min = computed( () => +props?.min );
const max = computed( () => +props?.max );
const size = computed( () => parseValue( props?.size ).toString() );

const percent = computed( () => {

    const normalizedValue: number = Math.min( Math.max( value.value, min.value ), max.value );

    const val: number = ( ( normalizedValue - min.value ) / ( max.value - min.value ) ) * 100;

    return `${ Math.round( val * 100 ) / 100 }%`;
});

const { block, element } = useBem( 'UiRange' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'disabled', disabled.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

const trackClass = computed( () => {

    return element( 'track' )
            .mix( namespace.value )
            .classify();

} );

const trackAttrs = computed( () => ( {

    'class': trackClass.value,

} ) );

const indicatorClass = computed( () => {

    return element( 'indicator' )
            .mix( namespace.value )
            .m( 'focused', focused.value )
            .classify();

} );

const indicatorAttrs = computed( () => ( {

    'class': indicatorClass.value,

} ) );

const railClass = computed( () => {

    return element( 'rail' )
            .mix( namespace.value )
            .classify();

} );

const railAttrs = computed( () => ( {

    'class': railClass.value,

} ) );

const thumbClass = computed( () => {

    return element( 'thumb' )
            .mix( namespace.value )
            .classify();

} );

const thumbAttrs = computed( () => ( {

    'class': thumbClass.value,

} ) );

onMounted( () => {

    if ( range.value instanceof HTMLElement ) {

        range.value.addEventListener( 'mousedown', onMouseDown );

    }

} );

onBeforeUnmount( () => {

    document.removeEventListener( 'mousemove', onMouseMove );
    document.removeEventListener( 'mouseup', onMouseUp );

    range.value?.removeEventListener( 'mousedown', onMouseDown );

} );

function onMouseDown ( e: MouseEvent ) {

    document.addEventListener( 'mousemove', onMouseMove );
    document.addEventListener( 'mouseup', onMouseUp );

    calculateIndicator( e );

    focused.value = true;

}

function onMouseMove ( e: MouseEvent ) {

    calculateIndicator( e );

}

function onMouseUp ( e: MouseEvent ) {

    document.removeEventListener( 'mousemove', onMouseMove );
    range.value?.removeEventListener( 'mouseup', onMouseUp );

    focused.value = false;

}

function calculateIndicator ( e: MouseEvent ) {

    if ( !range.value ) return;

    const { left, width } = range.value.getBoundingClientRect();

    const x: number = Math.min( left + width, Math.max( left, e.clientX ) );

    value.value = ( x - left ) / width * ( max.value - min.value ) + min.value;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-range {

    width: v-bind( width );
    height: v-bind( height );

    &__track {

        padding: 0 v-bind( size ) 0 0;

    }

    &__indicator {

        background-color: v-bind( color );

        width: v-bind( percent );
        height: v-bind( height );

        border-radius: 4px 0 0 4px;

        box-shadow: none;

        filter: none;

        &_focused {

            box-shadow: 0 0 10px v-bind( color );

            filter: brightness( 150% );

        }

    }

        &__rail {

            position: relative;
            width: 100%;
            height: 100%;

            box-sizing: border-box;

        }

        &__thumb {

            position: absolute;

            margin: auto;
            top: 0;
            bottom: 0;
    
            left: v-bind( percent );

            cursor: pointer;

            background-color: #eeeeee;

            box-shadow: 0 0 15px #000000;

            transition: transform .3s,
                        box-shadow .3s;

            border-radius: 100%;

            box-sizing: border-box;

            width: v-bind( size );
            height: v-bind( size );

            border: 3px solid v-bind( color );

        }

}

</style>

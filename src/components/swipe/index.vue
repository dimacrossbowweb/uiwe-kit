<template>

    <div
    
        v-bind="mainAttrs"
        ref="swipe"
        aria-label="Swiper"
        
    >

        <div v-bind="trackAttrs">

            <ul v-bind="listAttrs">

                <div

                    v-for=" ( item, i ) in items "
                    :key="i"
                    
                    v-bind="itemAttrs( i )"
                    
                >
                
                    <keep-alive>

                        <component :is="item" />

                    </keep-alive>
                
                </div>

            </ul>

        </div>

    </div>

</template>

<script lang="ts" setup>
import Splide from '@splidejs/splide';
import {
    ref,
    useSlots,
    computed,
    onMounted,
    onUnmounted,
    watchEffect,
    watch,
} from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useMobile } from '@/composables/useMobile';

// Splide's stylesheet is NOT imported here, matching how this library
// handles its own CSS (`import 'uiwekit/styles.css'`). A component-level CSS
// import also makes the module unloadable outside a bundler — plain Node
// cannot `require` a .css file — which broke SSR and `require('uiwekit/carousel')`.
//
// Import the theme you want once, in your app entry:
//   import '@splidejs/splide/css';           // default theme
//   import '@splidejs/splide/css/core';      // structural styles only

interface IProps {

    theme: 'auto' | 'light' | 'dark';

    namespace: string;
    width: string | number;
    height: string | number;
    minWidth: string | number;
    maxWidth: string | number;
    minHeight: string | number;
    maxHeight: string | number;
    noWheelSwipe: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

    theme: 'auto',

    namespace: '',
    width: 'auto',
    height: 'auto',
    minWidth: 'auto',
    maxWidth: 'auto',
    minHeight: 'auto',
    maxHeight: 'auto',
    noWheelSwipe: false,

} );

const value = defineModel( { default: 0 } );

const swipe = ref<HTMLElement | null>( null );

const swipeCtx = ref<Splide | null>( null );

const slots = useSlots();

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );
const minWidth = computed( () => parseValue( props?.minWidth ).toString() );
const maxWidth = computed( () => parseValue( props?.maxWidth ).toString() );
const minHeight = computed( () => parseValue( props?.minHeight ).toString() );
const maxHeight = computed( () => parseValue( props?.maxHeight ).toString() );

const items = computed( () => slots.default?.() || [] );

const { isMobile } = useMobile();

const { block, element } = useBem( 'UiSwipe' );

const mainClass = computed( () => {

    return block
                .mix( namespace.value )
                .mix( 'splide' )
                .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,
    'role': 'group',

} ) );

const trackClass = computed( () => {

    return element( 'track' )
                .mix( namespace.value )
                .mix( 'splide' )
                .classify();

} );

const trackAttrs = computed( () => ( {

    'class': trackClass.value,

} ) );

const listClass = computed( () => {

    return element( 'list' )
                .mix( namespace.value )
                .mix( 'splide' )
                .classify();

} );

const listAttrs = computed( () => ( {

    'class': listClass.value,

} ) );

const itemClass = computed( () => ( index: number ) => {

    return element( 'slide' )
                .mix( namespace.value )
                .mix( 'splide' )
                .m( 'active', index === value.value )
                .classify();

} );

const itemAttrs = computed( () => ( index: number ) => ( {

    'class': itemClass.value( index ),

} ) );

onMounted( () => {

    if ( !swipe.value ) return;

    const ctx = new Splide(

        swipe.value,

        {

            autoWidth: false,
            perPage: 1,
            gap: '4px',
            drag: isMobile.value,
            arrows: false,
            pagination: false,
            wheel: !props.noWheelSwipe,

        }

    ).mount();

    swipeCtx.value = ctx;

    ctx.on( 'move', ( newIndex: number ) => {

        value.value = newIndex;

    } );

    watchEffect( () => {

        ctx.go( value.value );

    } );

} );

watch( isMobile, () => {

    if ( !swipeCtx.value ) return;

    swipeCtx.value.options = {
        
        drag: isMobile.value
        
    };

    swipeCtx.value.refresh();

} )

onUnmounted( () => {

    swipeCtx.value?.destroy();

} );

</script>
  
<style lang="scss">
@use './styles.scss';

.ui-swipe {

    width: v-bind( width );
    height: v-bind( height );
    min-width: v-bind( minWidth );
    max-width: v-bind( maxWidth );
    min-height: v-bind( minHeight );
    max-height: v-bind( maxHeight );

}

</style>

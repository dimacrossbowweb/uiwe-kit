<template>

    <div
        ref="wrapper"
        v-bind="mainAttrs"
        @wheel="onWheel"
        @mousedown="onEdgeMouseDown"
        @mousemove="onEdgeMouseMove"
        @mouseleave="onEdgeMouseLeave"
        @touchstart="onContentTouchStart"
        @touchmove="onContentTouchMove"
        @touchend="onContentTouchEnd"
        @touchcancel="onContentTouchEnd"
    >

        <div
            ref="container"
            v-bind="containerAttrs"
        >

            <slot></slot>

        </div>

        <div
            v-if="hasScrollY"
            ref="trackY"
            v-bind="trackYAttrs"
            @mousedown="onTrackMouseDown( 'y', $event )"
        >
            <div
                ref="thumbY"
                v-bind="thumbYAttrs"
                @mousedown.stop="onThumbMouseDown( 'y', $event )"
                @touchstart.stop="onThumbTouchStart( 'y', $event )"
            ></div>
        </div>

        <div
            v-if="hasScrollX"
            ref="trackX"
            v-bind="trackXAttrs"
            @mousedown="onTrackMouseDown( 'x', $event )"
        >
            <div
                ref="thumbX"
                v-bind="thumbXAttrs"
                @mousedown.stop="onThumbMouseDown( 'x', $event )"
                @touchstart.stop="onThumbTouchStart( 'x', $event )"
            ></div>
        </div>

    </div>

</template>

<script lang="ts" setup>
import {
    ref,
    reactive,
    computed,
    watch,
    watchEffect,
    provide,
    onBeforeUnmount,
} from 'vue';
import { useElementSize } from '@vueuse/core';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { edgeFadeStyle, type TEdgeFadeSide } from '@/global/utils/edgeFade';

type TAxis = 'x' | 'y';
type TEdge = 'top' | 'right' | 'bottom' | 'left';

interface IEdgePayload {
    side:      TEdge;
    // Distance (px) from the cursor to that edge, within the trigger band.
    distance:  number;
    // 0..1 auto-scroll strength: 1 at the very edge, 0 at the band's inner
    // boundary (closer to the edge → faster).
    intensity: number;
};

interface IProps {

	theme: 'auto' | 'light' | 'dark';
    namespace: string;
    width:     string | number;
    height:    string | number;
    scrollX:   boolean;
    scrollY:   boolean;
    step:      number;
    duration:  number;
    // Auto-scroll when the left mouse button is held and the cursor sits inside
    // the edge band. Off by default so ordinary lists are unaffected.
    edgeScroll: boolean;
    // Width (px) of the edge band that triggers edge events / auto-scroll.
    edgeSize:   number;
    // Max auto-scroll speed in px/second (reached at the very edge).
    edgeSpeed:  number;
    // Fade the top / bottom of the viewport over this many px — only where more
    // content lies past the edge ( see styles/_edge-fade.scss ). 0 — off.
    fadeEdges:  number;
    // Which edges to fade: both, top only or bottom only.
    fadeSide:   TEdgeFadeSide;
};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',
    namespace: '',
    width:     'auto',
    height:    'auto',
    scrollX:   false,
    scrollY:   true,
    step:      60,
    duration:  250,
    edgeScroll: false,
    edgeSize:   60,
    edgeSpeed:  1200,
    fadeEdges:  0,
    fadeSide:   'both',
} );

const emit = defineEmits<{
    'edge-top':    [ payload: IEdgePayload ];
    'edge-right':  [ payload: IEdgePayload ];
    'edge-bottom': [ payload: IEdgePayload ];
    'edge-left':   [ payload: IEdgePayload ];
}>();

const wrapper   = ref<HTMLElement | null>( null );
const container = ref<HTMLElement | null>( null );
const trackY    = ref<HTMLElement | null>( null );
const thumbY    = ref<HTMLElement | null>( null );
const trackX    = ref<HTMLElement | null>( null );
const thumbX    = ref<HTMLElement | null>( null );

const { width: wrapperW, height: wrapperH } = useElementSize( wrapper );
const { width: containerW, height: containerH } = useElementSize( container );

const { parseValue } = useFormat();
const { block, element } = useBem( 'UiScroll' );

const namespace = computed( () => props.namespace ?? '' );
const widthCss  = computed( () => parseValue( props.width ).toString() );
const heightCss = computed( () => parseValue( props.height ).toString() );

const scrollX = ref<number>( 0 );
const scrollY = ref<number>( 0 );

const smooth = ref<boolean>( false );

const overflowX = computed( () => containerW.value > wrapperW.value + 0.5 );
const overflowY = computed( () => containerH.value > wrapperH.value + 0.5 );

const maxX = computed( () => Math.max( 0, containerW.value - wrapperW.value ) );
const maxY = computed( () => Math.max( 0, containerH.value - wrapperH.value ) );

const hasScrollX = computed( () => props.scrollX && overflowX.value );
const hasScrollY = computed( () => props.scrollY && overflowY.value );

function clamp( v: number, min: number, max: number ): number {

    return Math.max( min, Math.min( max, v ) );

}

const thumbYHeight = computed( () => {

    if ( containerH.value <= 0 || !overflowY.value ) return 0;

    return Math.max( 24, wrapperH.value * ( wrapperH.value / containerH.value ) );

} );

const thumbXWidth = computed( () => {

    if ( containerW.value <= 0 || !overflowX.value ) return 0;

    return Math.max( 24, wrapperW.value * ( wrapperW.value / containerW.value ) );

} );

const thumbYTop = computed( () => {

    if ( maxY.value <= 0 ) return 0;

    return scrollY.value / maxY.value * ( wrapperH.value - thumbYHeight.value );

} );

const thumbXLeft = computed( () => {

    if ( maxX.value <= 0 ) return 0;

    return scrollX.value / maxX.value * ( wrapperW.value - thumbXWidth.value );

} );

const transitionStyle = computed( () => smooth.value ? `transform ${ props.duration }ms ease` : 'none' );

function onWheel( e: WheelEvent ): void {

    let consumed = false;

    if ( props.scrollY && overflowY.value && e.deltaY !== 0 ) {

        const next = clamp( scrollY.value + Math.sign( e.deltaY ) * props.step, 0, maxY.value );

        if ( next !== scrollY.value ) {

            smooth.value = false;
            scrollY.value = next;
            consumed = true;

        }

    }

    if ( props.scrollX && overflowX.value && e.deltaX !== 0 ) {

        const next = clamp( scrollX.value + Math.sign( e.deltaX ) * props.step, 0, maxX.value );

        if ( next !== scrollX.value ) {

            smooth.value = false;
            scrollX.value = next;
            consumed = true;

        }

    }

    if ( props.scrollX && !props.scrollY && overflowX.value && e.deltaY !== 0 && e.deltaX === 0 ) {

        const next = clamp( scrollX.value + Math.sign( e.deltaY ) * props.step, 0, maxX.value );

        if ( next !== scrollX.value ) {

            smooth.value = false;
            scrollX.value = next;
            consumed = true;

        }

    }

    if ( consumed ) e.preventDefault();

}

const drag = reactive( {

    axis:        null as ( null | TAxis ),
    startClient: 0,
    startScroll: 0,

} );

function onThumbMouseDown( axis: TAxis, e: MouseEvent ): void {

    startThumbDrag( axis, axis === 'y' ? e.clientY : e.clientX );

    document.addEventListener( 'mousemove', onDocMouseMove );
    document.addEventListener( 'mouseup',   onDocMouseUp );

    e.preventDefault();

}

function onThumbTouchStart( axis: TAxis, e: TouchEvent ): void {

    if ( e.touches.length === 0 ) return;

    const t = e.touches[ 0 ]!;

    startThumbDrag( axis, axis === 'y' ? t.clientY : t.clientX );

    document.addEventListener( 'touchmove',   onDocTouchMove, { passive: false } );
    document.addEventListener( 'touchend',    onDocTouchEnd );
    document.addEventListener( 'touchcancel', onDocTouchEnd );

}

function startThumbDrag( axis: TAxis, client: number ): void {

    smooth.value      = false;
    drag.axis         = axis;
    drag.startClient  = client;
    drag.startScroll  = axis === 'y' ? scrollY.value : scrollX.value;

}

function onDocMouseMove( e: MouseEvent ): void {

    if ( !drag.axis ) return;

    applyThumbDrag( drag.axis === 'y' ? e.clientY : e.clientX );

}

function onDocTouchMove( e: TouchEvent ): void {

    if ( !drag.axis || e.touches.length === 0 ) return;

    const t = e.touches[ 0 ]!;

    applyThumbDrag( drag.axis === 'y' ? t.clientY : t.clientX );

    e.preventDefault();

}

function applyThumbDrag( client: number ): void {

    if ( drag.axis === 'y' ) {

        const trackLen = wrapperH.value - thumbYHeight.value;

        if ( trackLen <= 0 ) return;

        const delta = client - drag.startClient;
        const ratio = delta / trackLen;

        scrollY.value = clamp( drag.startScroll + ratio * maxY.value, 0, maxY.value );

    }

    if ( drag.axis === 'x' ) {

        const trackLen = wrapperW.value - thumbXWidth.value;

        if ( trackLen <= 0 ) return;

        const delta = client - drag.startClient;
        const ratio = delta / trackLen;

        scrollX.value = clamp( drag.startScroll + ratio * maxX.value, 0, maxX.value );

    }

}

function onDocMouseUp(): void {

    drag.axis = null;

    document.removeEventListener( 'mousemove', onDocMouseMove );
    document.removeEventListener( 'mouseup',   onDocMouseUp );

}

function onDocTouchEnd(): void {

    drag.axis = null;

    document.removeEventListener( 'touchmove',   onDocTouchMove );
    document.removeEventListener( 'touchend',    onDocTouchEnd );
    document.removeEventListener( 'touchcancel', onDocTouchEnd );

}

function onTrackMouseDown( axis: TAxis, e: MouseEvent ): void {

    const track = axis === 'y' ? trackY.value : trackX.value;

    if ( !track ) return;

    const rect = track.getBoundingClientRect();

    if ( axis === 'y' ) {

        const trackLen = wrapperH.value - thumbYHeight.value;

        if ( trackLen <= 0 ) return;

        const target = e.clientY - rect.top - thumbYHeight.value / 2;
        const ratio  = clamp( target / trackLen, 0, 1 );

        smooth.value  = true;
        scrollY.value = ratio * maxY.value;

    } else {

        const trackLen = wrapperW.value - thumbXWidth.value;

        if ( trackLen <= 0 ) return;

        const target = e.clientX - rect.left - thumbXWidth.value / 2;
        const ratio  = clamp( target / trackLen, 0, 1 );

        smooth.value  = true;
        scrollX.value = ratio * maxX.value;

    }

}

const touch = reactive( {

    active:        false,
    startX:        0,
    startY:        0,
    startScrollX:  0,
    startScrollY:  0,

} );

function onContentTouchStart( e: TouchEvent ): void {

    if ( e.touches.length !== 1 ) return;

    const target = e.target as HTMLElement;

    if ( target?.closest?.( '.ui-scroll__thumb' ) ) return;

    const t = e.touches[ 0 ]!;

    touch.active       = true;
    touch.startX       = t.clientX;
    touch.startY       = t.clientY;
    touch.startScrollX = scrollX.value;
    touch.startScrollY = scrollY.value;

    smooth.value = false;

}

function onContentTouchMove( e: TouchEvent ): void {

    if ( !touch.active || e.touches.length === 0 ) return;

    const t = e.touches[ 0 ]!;

    let consumed = false;

    if ( props.scrollY && overflowY.value ) {

        scrollY.value = clamp( touch.startScrollY - ( t.clientY - touch.startY ), 0, maxY.value );
        consumed = true;

    }

    if ( props.scrollX && overflowX.value ) {

        scrollX.value = clamp( touch.startScrollX - ( t.clientX - touch.startX ), 0, maxX.value );
        consumed = true;

    }

    if ( consumed && e.cancelable ) e.preventDefault();

}

function onContentTouchEnd(): void {

    touch.active = false;

}

// ── Edge auto-scroll ─────────────────────────────────────────────────────────
// When enabled (`edgeScroll`), holding the left mouse button while the cursor
// enters the band near an edge scrolls the viewport that way — the classic
// "drag past the edge to keep scrolling" behaviour (text/drag selection, DnD).
// Speed grows the closer the cursor is to the edge. Independently, crossing into
// each band emits `edge-top/right/bottom/left` once, so callers can react.

// Cursor position relative to the wrapper's top-left (clamped to its box).
const edgePointer = { x: 0, y: 0 };

let edgePressing = false;          // left button currently held
let edgeRaf      = 0;              // active requestAnimationFrame id (0 = none)
let edgeLastTs   = 0;              // last frame timestamp for dt integration

// Which bands the cursor is currently inside — to fire the edge-* events only
// on the outside→inside transition (enter), not every mousemove.
const edgeActive: Record<TEdge, boolean> = { top: false, right: false, bottom: false, left: false };

// Which bands may auto-scroll during the current press. A band the press
// started in stays disarmed until the cursor leaves it inward or overshoots
// past the edge — so a plain click / starting a text selection near an edge
// doesn't make the content run away under the cursor.
const edgeArmed: Record<TEdge, boolean> = { top: false, right: false, bottom: false, left: false };

/** 1 at the very edge → 0 at the band's inner boundary. Flip the return to
 *  `d / size` for the inverse "faster the deeper you go" law. */
function edgeFactor( dist: number ): number {

    const size = Math.max( 1, props.edgeSize );
    return 1 - clamp( dist, 0, size ) / size;

}

function emitEdge( side: TEdge, distance: number ): void {

    const payload: IEdgePayload = { side, distance, intensity: edgeFactor( distance ) };

    if ( side === 'top' )         emit( 'edge-top', payload );
    else if ( side === 'right' )  emit( 'edge-right', payload );
    else if ( side === 'bottom' ) emit( 'edge-bottom', payload );
    else                          emit( 'edge-left', payload );

}

function clearEdges(): void {

    edgeActive.top = edgeActive.right = edgeActive.bottom = edgeActive.left = false;

}

function detectEdges(): void {

    const size = Math.max( 1, props.edgeSize );

    // Only sides whose axis can actually scroll are eligible.
    const now: Record<TEdge, boolean> = {
        top:    hasScrollY.value && edgePointer.y <= size,
        bottom: hasScrollY.value && wrapperH.value - edgePointer.y <= size,
        left:   hasScrollX.value && edgePointer.x <= size,
        right:  hasScrollX.value && wrapperW.value - edgePointer.x <= size,
    };

    const dist: Record<TEdge, number> = {
        top:    edgePointer.y,
        bottom: wrapperH.value - edgePointer.y,
        left:   edgePointer.x,
        right:  wrapperW.value - edgePointer.x,
    };

    ( [ 'top', 'right', 'bottom', 'left' ] as TEdge[] ).forEach( side => {

        if ( now[ side ] && !edgeActive[ side ] ) emitEdge( side, dist[ side ] );
        edgeActive[ side ] = now[ side ];

    } );

}

function updateEdgePointer( clientX: number, clientY: number ): void {

    const el = wrapper.value;
    if ( !el ) return;

    const rect = el.getBoundingClientRect();

    edgePointer.x = clamp( clientX - rect.left, 0, rect.width );
    edgePointer.y = clamp( clientY - rect.top,  0, rect.height );

    detectEdges();

    if ( !edgePressing ) return;

    // Arm a band once the cursor is outside it, or dragged beyond its edge.
    if ( !edgeActive.top    || clientY < rect.top )    edgeArmed.top    = true;
    if ( !edgeActive.bottom || clientY > rect.bottom ) edgeArmed.bottom = true;
    if ( !edgeActive.left   || clientX < rect.left )   edgeArmed.left   = true;
    if ( !edgeActive.right  || clientX > rect.right )  edgeArmed.right  = true;

}

function edgeTick( ts: number ): void {

    if ( !edgePressing ) { edgeRaf = 0; return; }

    const dt = edgeLastTs ? ( ts - edgeLastTs ) / 1000 : 0;
    edgeLastTs = ts;

    const size  = props.edgeSize;
    const speed = props.edgeSpeed;

    let vx = 0;
    let vy = 0;

    if ( hasScrollY.value ) {

        const dTop    = edgePointer.y;
        const dBottom = wrapperH.value - edgePointer.y;

        if ( dTop <= size )         vy = edgeArmed.top    ? -speed * edgeFactor( dTop )    : 0;
        else if ( dBottom <= size ) vy = edgeArmed.bottom ?  speed * edgeFactor( dBottom ) : 0;

    }

    if ( hasScrollX.value ) {

        const dLeft  = edgePointer.x;
        const dRight = wrapperW.value - edgePointer.x;

        if ( dLeft <= size )        vx = edgeArmed.left  ? -speed * edgeFactor( dLeft )  : 0;
        else if ( dRight <= size )  vx = edgeArmed.right ?  speed * edgeFactor( dRight ) : 0;

    }

    if ( vy !== 0 || vx !== 0 ) {

        smooth.value = false;
        if ( vy !== 0 ) scrollY.value = clamp( scrollY.value + vy * dt, 0, maxY.value );
        if ( vx !== 0 ) scrollX.value = clamp( scrollX.value + vx * dt, 0, maxX.value );

    }

    edgeRaf = requestAnimationFrame( edgeTick );

}

function onEdgeMouseDown( e: MouseEvent ): void {

    if ( !props.edgeScroll || e.button !== 0 ) return;

    // Don't hijack scrollbar interactions — those run their own drag.
    const t = e.target as HTMLElement | null;
    if ( t?.closest?.( '.ui-scroll__track' ) || t?.closest?.( '.ui-scroll__thumb' ) ) return;

    updateEdgePointer( e.clientX, e.clientY );

    // Bands the press landed in start disarmed (see edgeArmed).
    ( [ 'top', 'right', 'bottom', 'left' ] as TEdge[] ).forEach( side => {
        edgeArmed[ side ] = !edgeActive[ side ];
    } );

    edgePressing = true;
    edgeLastTs   = 0;

    // Track outside the wrapper too, so overshooting past the edge keeps scrolling.
    document.addEventListener( 'mousemove', onEdgeDocMouseMove );
    document.addEventListener( 'mouseup',   onEdgeDocMouseUp );

    if ( !edgeRaf ) edgeRaf = requestAnimationFrame( edgeTick );

}

function onEdgeMouseMove( e: MouseEvent ): void {

    // While pressing, the document listener drives the pointer (covers overshoot).
    if ( !props.edgeScroll || edgePressing ) return;

    updateEdgePointer( e.clientX, e.clientY );

}

function onEdgeMouseLeave(): void {

    if ( !props.edgeScroll || edgePressing ) return;

    clearEdges();

}

function onEdgeDocMouseMove( e: MouseEvent ): void {

    updateEdgePointer( e.clientX, e.clientY );

}

function onEdgeDocMouseUp(): void {

    edgePressing = false;
    edgeLastTs   = 0;

    if ( edgeRaf ) { cancelAnimationFrame( edgeRaf ); edgeRaf = 0; }

    document.removeEventListener( 'mousemove', onEdgeDocMouseMove );
    document.removeEventListener( 'mouseup',   onEdgeDocMouseUp );

    clearEdges();

}

interface IScrollToOptions {

    x?:      number;
    y?:      number;
    smooth?: boolean;
    // When false, the target is only floored at 0 and NOT capped at maxX/maxY.
    // Used when anchoring after content is prepended but the size observer
    // hasn't recomputed maxX/maxY yet — clamping there would snap us short.
    clampMax?: boolean;

};

function scrollTo( opts: IScrollToOptions = {} ): void {

    smooth.value = !!opts.smooth;

    const capMax = opts.clampMax !== false;

    if ( typeof opts.x === 'number' ) {

        scrollX.value = capMax ? clamp( opts.x, 0, maxX.value ) : Math.max( 0, opts.x );

    }

    if ( typeof opts.y === 'number' ) {

        scrollY.value = capMax ? clamp( opts.y, 0, maxY.value ) : Math.max( 0, opts.y );

    }

}

function scrollToEnd( axis: TAxis = 'y', smoothMove: boolean = false ): void {

    smooth.value = smoothMove;

    if ( axis === 'y' ) scrollY.value = maxY.value;
    if ( axis === 'x' ) scrollX.value = maxX.value;

}

const state = reactive( {

    scrollX:    0,
    scrollY:    0,
    maxX:       0,
    maxY:       0,
    wrapperW:   0,
    wrapperH:   0,
    containerW: 0,
    containerH: 0,

} );

watchEffect( () => {

    state.scrollX    = scrollX.value;
    state.scrollY    = scrollY.value;
    state.maxX       = maxX.value;
    state.maxY       = maxY.value;
    state.wrapperW   = wrapperW.value;
    state.wrapperH   = wrapperH.value;
    state.containerW = containerW.value;
    state.containerH = containerH.value;

    // Dispatch a DOM event so descendants in any component scope (including
    // slot content scoped to ancestor components, where provide/inject can't
    // reach this) can react to scroll/size changes — used e.g. for emulating
    // `position: sticky` since the wrapper is overflow:hidden + transform.
    const el = wrapper.value;
    if ( el ) {

        el.dispatchEvent( new CustomEvent( 'ui-scroll', {

            detail: {

                scrollX:    state.scrollX,
                scrollY:    state.scrollY,
                wrapperW:   state.wrapperW,
                wrapperH:   state.wrapperH,
                containerW: state.containerW,
                containerH: state.containerH,

            },

        } ) );

    }

} );

defineExpose( {

    scrollTo,
    scrollToEnd,
    state,
    scrollX,
    scrollY,
    maxX,
    maxY,
    // The transform-driven content node. Bind it as a marquee/overlay's
    // `container-ref` so a `position:absolute` overlay shares the moving
    // content's coordinate system (the transform is its containing block).
    wrapper,
    container,

} );

provide( 'uiScroll', {

    scrollX,
    scrollY,
    maxX,
    maxY,
    wrapperW,
    wrapperH,
    containerW,
    containerH,
    scrollTo,
    scrollToEnd,
    wrapper,
    container,

} );

watch( [ maxX, maxY ], () => {

    scrollX.value = clamp( scrollX.value, 0, maxX.value );
    scrollY.value = clamp( scrollY.value, 0, maxY.value );

} );

onBeforeUnmount( () => {

    document.removeEventListener( 'mousemove',   onDocMouseMove );
    document.removeEventListener( 'mouseup',     onDocMouseUp );
    document.removeEventListener( 'touchmove',   onDocTouchMove );
    document.removeEventListener( 'touchend',    onDocTouchEnd );
    document.removeEventListener( 'touchcancel', onDocTouchEnd );

    document.removeEventListener( 'mousemove',   onEdgeDocMouseMove );
    document.removeEventListener( 'mouseup',     onEdgeDocMouseUp );
    if ( edgeRaf ) cancelAnimationFrame( edgeRaf );

} );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'scroll-x', props.scrollX )
            .m( 'scroll-y', props.scrollY )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': [ mainClass.value, { 'edge-fade': props.fadeEdges > 0 } ],
    'style': props.fadeEdges > 0 ? edgeFadeStyle( scrollY.value, maxY.value, props.fadeEdges, props.fadeSide ) : undefined,

} ) );

const containerClass = computed( () => {

    return element( 'container' )
            .mix( namespace.value )
            .classify();

} );

const containerAttrs = computed( () => ( {

    'class': containerClass.value,
    'style': {

        'transform':  `translate3d(${ -scrollX.value }px, ${ -scrollY.value }px, 0)`,
        'transition': transitionStyle.value,
        'width':      props.scrollX ? 'max-content' : '100%',
        'height':     props.scrollY ? 'auto' : '100%',

    },

} ) );

const trackYClass = computed( () => {

    return element( 'track' )
            .mix( namespace.value )
            .m( 'vertical' )
            .m( 'with-x', hasScrollX.value )
            .classify();

} );

const trackYAttrs = computed( () => ( {

    'class': trackYClass.value,

} ) );

const thumbYClass = computed( () => {

    return element( 'thumb' )
            .mix( namespace.value )
            .m( 'vertical' )
            .m( 'active', drag.axis === 'y' )
            .classify();

} );

const thumbYAttrs = computed( () => ( {

    'class': thumbYClass.value,
    'style': {

        'height':     `${ thumbYHeight.value }px`,
        'transform':  `translateY(${ thumbYTop.value }px)`,
        'transition': transitionStyle.value,

    },

} ) );

const trackXClass = computed( () => {

    return element( 'track' )
            .mix( namespace.value )
            .m( 'horizontal' )
            .m( 'with-y', hasScrollY.value )
            .classify();

} );

const trackXAttrs = computed( () => ( {

    'class': trackXClass.value,

} ) );

const thumbXClass = computed( () => {

    return element( 'thumb' )
            .mix( namespace.value )
            .m( 'horizontal' )
            .m( 'active', drag.axis === 'x' )
            .classify();

} );

const thumbXAttrs = computed( () => ( {

    'class': thumbXClass.value,
    'style': {

        'width':      `${ thumbXWidth.value }px`,
        'transform':  `translateX(${ thumbXLeft.value }px)`,
        'transition': transitionStyle.value,

    },

} ) );

</script>

<style lang="scss" scoped>
@use './styles';
@use '@/styles/variables' as vars;

// Bar geometry and colours are shared with the native scrollbars
// ( styles/_scrollbar.scss ), so the custom scroll looks the same.
.ui-scroll {

    width: v-bind( widthCss );
    height: v-bind( heightCss );
    overflow: hidden;
    position: relative;

    &__container {

        display: flex;
        flex-direction: column;
        min-height: 100%;
        min-width: 100%;
        flex-shrink: 0;
        will-change: transform;

    }

    &__track {

        position: absolute;
        background: var( --ui-scrollbar-track );
        opacity: 0;
        transition: opacity 0.2s, background 0.2s;

        &_vertical {

            top: 0;
            right: 0;
            bottom: 0;
            width: vars.$scrollbar-size;

            &_with-x {

                bottom: vars.$scrollbar-size;

            }

        }

        &_horizontal {

            left: 0;
            right: 0;
            bottom: 0;
            height: vars.$scrollbar-size;

            &_with-y {

                right: vars.$scrollbar-size;

            }

        }

    }

    &:hover .ui-scroll__track,
    .ui-scroll__thumb_active {

        opacity: 1;

    }

    &__thumb {

        position: absolute;
        background: var( --ui-scrollbar-thumb );
        border-radius: vars.$scrollbar-radius;
        cursor: pointer;
        will-change: transform;
        transition: background 0.2s;

        &:hover,
        &_active {

            background: var( --ui-scrollbar-thumb-hover );

        }

        &_vertical {

            top: 0;
            left: vars.$scrollbar-inset;
            right: vars.$scrollbar-inset;

        }

        &_horizontal {

            left: 0;
            top: vars.$scrollbar-inset;
            bottom: vars.$scrollbar-inset;

        }

    }

    &:hover &__track {

        opacity: 1;

    }

}
</style>

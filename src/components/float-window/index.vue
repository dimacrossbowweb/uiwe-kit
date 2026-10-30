<template>

    <ui-card

        ref="card"
        v-bind="mainAttrs"

    >

        <slot
        
            name="content"
            v-bind="{ isDragable: drag.isDragable }"
        
        ></slot>

        <ui-resize-corners

            v-if="resizable"
            :ratio="ratio"
            :min-height="minHeight"
            :max-width="maxSize.width"
            :max-height="maxSize.height"
            @resize="onResize"
            @end="onResizeEnd"

        />

    </ui-card>

</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core';
import { useElementSize } from '@vueuse/core';
import {
    reactive,
    ref,
    useTemplateRef,
    computed,
    onMounted,
    onBeforeUnmount,
    type ComponentPublicInstance,
} from 'vue';
import { useBem } from '@/composables/useBem';
import { parseAspectRatio, type ISize } from '@/global/utils/resizeByCorner';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    width: string | number;
    height: string | number;
    offset: string | number;
    // `true` → position:fixed, snaps to the viewport edges. `false` (default) →
    // position:absolute, snaps to the nearest positioned ancestor's edges.
    fixed: boolean;
    // Optional CSS aspect-ratio (e.g. '3 / 4', 1.5). Omitted → not applied, so
    // the box is sized by width/height alone.
    aspectRatio: string | number;
    // Resize with the mouse by the corners ( proportionally, with `aspectRatio` ).
    resizable: boolean;
    // Smallest height while resizing, px.
    minHeight: number;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
    width: 'auto',
    height: 'auto',
    offset: 0,
    fixed: false,
    aspectRatio: undefined,
    resizable: false,
    minHeight: 80,

} );

// The ref sits on <ui-card>, so it holds the component instance — the actual
// DOM node (UiCard's single root) is its `$el`.
const card = useTemplateRef<ComponentPublicInstance>( 'card' );
const el = computed<HTMLElement | null>( () => ( card.value?.$el as HTMLElement | undefined ) ?? null );

// The element position:absolute snaps to lives here — resolved after mount.
const parentEl = ref<HTMLElement | null>( null );


const namespace = computed( () => props?.namespace ?? '' );
const offset = computed( () => isNaN( +props?.offset ) ? 0 : +props.offset );

// CSS position mode + a matching aspect-ratio value (undefined → not emitted).
const positionType = computed( () => props?.fixed ? 'fixed' : 'absolute' );
const aspectRatio = computed<string | undefined>( () => {
    const v = props?.aspectRatio;
    return ( v === undefined || v === null || v === '' ) ? undefined : String( v );
} );

const { width: windowWidth, height: windowHeight } = useWindowSize();
const { width: elementWidth, height: elementHeight } = useElementSize( el );
const { width: parentWidth, height: parentHeight } = useElementSize( parentEl );

// The box we snap inside: the viewport when `fixed`, otherwise the parent.
const containerWidth  = computed( () => props?.fixed ? windowWidth.value  : parentWidth.value );
const containerHeight = computed( () => props?.fixed ? windowHeight.value : parentHeight.value );

const drag = reactive( {

    offsetX: 0,
    offsetY: 0,
    // Viewport coords of the positioning origin — 0 when fixed, else the
    // parent's top-left — captured at drag start to map pointer → local coords.
    originX: 0,
    originY: 0,
    x: 0,
    y: 0,
    isDragable: false,

} );

const stickyX = computed( () => {

    if ( containerWidth.value / 2 > ( elementWidth.value / 2 + drag.x ) ) {

        return offset.value;

    }

    return containerWidth.value - elementWidth.value - offset.value;

} );

const stickyY = computed( () => {

    if ( containerHeight.value / 2 > ( elementHeight.value / 2 + drag.y ) ) {

        return offset.value;

    }

    return containerHeight.value - elementHeight.value - offset.value;

} );

const positionX = computed( () => {

    if ( drag.isDragable ) {

        return drag.x;

    }

    return stickyX.value;

} );

const positionY = computed( () => {

    if ( drag.isDragable ) {

        return drag.y;

    }

    return stickyY.value;

} );

// ── Corner resize ───────────────────────────────────────────────────────────
//
// Once the user sets a size, the window keeps that height in px ( aspect-ratio
// gives the width ) instead of the width / height props. Snapping to a
// container corner works as before: it is computed from the actual size.

const ratio = computed<number | undefined>( () => parseAspectRatio( props.aspectRatio ) );

// Size set with the mouse; null — size from the props.
const resized = ref<ISize | null>( null );
const resizing = ref<boolean>( false );

// The window is no larger than the container minus the offset on both sides.
const maxSize = computed( () => ( {
    width:  Math.max( 0, containerWidth.value  - offset.value * 2 ),
    height: Math.max( 0, containerHeight.value - offset.value * 2 ),
} ) );

// When the container shrinks, the window shrinks with it proportionally, staying inside.
const fitted = computed<ISize | null>( () => {

    const s = resized.value;
    if ( !s ) return null;

    const scale = Math.min( 1, maxSize.value.width / s.width, maxSize.value.height / s.height );

    return { width: s.width * scale, height: s.height * scale };

} );

const height = computed<string | number>( () => fitted.value ? `${ fitted.value.height }px` : props.height );

// With a ratio set, aspect-ratio derives the width from the height.
const width = computed<string | number>( () =>
    fitted.value && !ratio.value ? `${ fitted.value.width }px` : props.width,
);

function onResize ( size: ISize ): void {

    resizing.value = true;
    resized.value = size;

}

function onResizeEnd (): void {

    resizing.value = false;

}

const style = computed( () => {

    const s: Record<string, string> = {
        'left': `${ positionX.value }px`,
        'top': `${ positionY.value }px`,
    };

    // Only emit aspect-ratio when a value was passed, so the default box stays
    // sized purely by width/height.
    if ( aspectRatio.value ) s[ 'aspect-ratio' ] = aspectRatio.value;

    return s;

} );

const { block } = useBem( 'UiFloatWindow' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'released', !drag.isDragable && !resizing.value )
            .classify();

} );

// Outer attrs (class, elevation, …) reach <ui-card> through normal fallthrough,
// which merges class/style instead of overwriting ours. position / width /
// height go in as props: UiCard/UiSheet set them from their own props via
// scoped CSS, which would otherwise fight ours (UiCard defaults to static).
const mainAttrs = computed( () => ( {

    'class': mainClass.value,
    'style': style.value,
    'theme': props.theme,
    'position': positionType.value,
    'width': width.value,
    'height': height.value,

} ) );

onMounted( () => {

    // When not fixed we snap inside the containing block of our absolute
    // positioning — the offsetParent (fall back to the DOM parent).
    parentEl.value = ( el.value?.offsetParent as HTMLElement | null ) ?? el.value?.parentElement ?? null;

    el.value?.addEventListener( 'mousedown', onDragStart );
    el.value?.addEventListener( 'touchstart', onDragStart );

} );

onBeforeUnmount( () => {

    el.value?.removeEventListener( 'mousedown', onDragStart );
    document.removeEventListener( 'mouseup', onDragEnd );
    document.removeEventListener( 'mousemove', onDragMove );

    el.value?.removeEventListener( 'touchstart', onDragStart );
    document.removeEventListener( 'touchend', onDragEnd );
    document.removeEventListener( 'touchmove', onDragMove );

} );


function onDragStart ( e: MouseEvent | TouchEvent ) {

    const target = e.currentTarget as HTMLElement;

    const rect = target.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if (e.type === 'touchstart') {
        const touchEvent = e as TouchEvent;
        const touch = touchEvent.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        const mouseEvent = e as MouseEvent;
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
    }

    drag.offsetX = clientX - rect.left;
    drag.offsetY = clientY - rect.top;

    // Origin to translate viewport pointer coords into the position reference:
    // the viewport itself when fixed, otherwise the parent's top-left.
    const parentRect = props?.fixed ? null : parentEl.value?.getBoundingClientRect();
    drag.originX = parentRect?.left ?? 0;
    drag.originY = parentRect?.top ?? 0;

    drag.x = clientX - drag.offsetX - drag.originX;
    drag.y = clientY - drag.offsetY - drag.originY;

    drag.isDragable = true;

    document.addEventListener( 'mouseup', onDragEnd );
    document.addEventListener( 'mousemove', onDragMove );

    document.addEventListener( 'touchend', onDragEnd );
    document.addEventListener( 'touchmove', onDragMove );

}

function onDragEnd () {

    drag.isDragable = false;

    drag.x = stickyX.value;
    drag.y = stickyY.value;

    document.removeEventListener( 'mouseup', onDragEnd );
    document.removeEventListener( 'mousemove', onDragMove );

    document.removeEventListener( 'touchend', onDragEnd );
    document.removeEventListener( 'touchmove', onDragMove );

}

function onDragMove ( e: MouseEvent | TouchEvent ) {

    let clientX: number;
    let clientY: number;

    if (e.type === 'touchmove') {
        const touchEvent = e as TouchEvent;
        const touch = touchEvent.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        const mouseEvent = e as MouseEvent;
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
    }

    drag.x = clientX - drag.offsetX - drag.originX;
    drag.y = clientY - drag.offsetY - drag.originY;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-float-window {

    // position / width / height are passed to <ui-card> as props.

    margin: v-bind( offset );

}

</style>

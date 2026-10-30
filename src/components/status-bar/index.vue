<template>

    <div v-bind="mainAttrs">

        <div v-if="$slots.header" v-bind="headerAttrs">

            <slot name="header" v-bind="slotProps"></slot>

        </div>

        <div v-bind="statusAttrs"></div>

        <div v-if="$slots.footer" v-bind="footerAttrs">

            <slot name="footer" v-bind="slotProps"></slot>

        </div>

    </div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

/**
 * One band of the scale. `start` / `end` are read on the same axis as the bar's
 * own start / end — the band whose range covers the model value is the current
 * status, and its `color` paints the filled part of the bar.
 *
 * `color` is a theme token ( 'success', 'negative' ) or any CSS colour that
 * useFormat's parseColor understands ( hex, rgb, hsl, HTML colour names ).
 */
export interface IStatus {

    start: string | number;
    end: string | number;
    color: string;
    text: string;

}

export interface IProps {

    theme: 'auto' | 'light' | 'dark';

    namespace: string;
    width: string | number;
    height: string | number;
    statuses: IStatus[];
    start: string | number;
    end: string | number;

};

defineOptions( {

    name: 'UiStatusBar',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

    theme: 'auto',

    namespace: '',
    width: '100%',
    height: 2,
    statuses: () => [],
    start: 0,
    end: 100,

} );

const value = defineModel<number>( { default: 0 } );

const namespace = computed( () => props?.namespace ?? '' );

const { parseValue, parseColor } = useFormat();

const width = computed( () => parseValue( props?.width ) );
const height = computed( () => parseValue( props?.height ) );

const status = computed( () => props?.statuses ?? [] );

const start = computed( () => +props.start );
const end = computed( () => +props.end );

const { block, element } = useBem( 'UiStatusBar' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,
    'style': {

        'width': width.value.toString(),

    },

} ) );

// Where the model value sits between start and end, clamped so a value outside
// the scale still yields a drawable bar.
const percent = computed( () => {

    const span = end.value - start.value;

    if ( !Number.isFinite( span ) || span <= 0 ) return 0;

    const ratio = ( value.value - start.value ) / span;

    return Math.min( 100, Math.max( 0, ratio * 100 ) );

} );

/**
 * The band the value currently falls into. Ranges are inclusive on both ends, so
 * the first match wins where two bands meet on a boundary. A value outside every
 * band leaves this null and the bar renders as a bare track.
 */
const current = computed<( IStatus | null )>( () => {

    return status.value.find( ( item: IStatus ) => {

        return value.value >= +item.start && value.value <= +item.end;

    } ) ?? null;

} );

// Empty when no band matches — the fill then has nothing to paint and the CSS
// track shows through on its own. A token name resolves through the theme
// ( honouring a forced `theme` ); anything else is parsed as a literal colour.
const color = computed( () => {

    if ( !current.value ) return '';

    const raw = current.value.color;
    const varValue = useCSSVar( raw, props.theme );

    return parseColor( varValue ? varValue : raw ).toString();

} );

const text = computed( () => current.value?.text ?? '' );

// Handed to both slots so a caption can label the value it is describing without
// re-deriving which band is active.
const slotProps = computed( () => ( {

    'status': current.value,
    'value': value.value,
    'percent': percent.value,
    'color': color.value,
    'text': text.value,

} ) );

const headerClass = computed( () => {

    return element( 'header' ).classify();

} );

const headerAttrs = computed( () => ( {

    'class': headerClass.value,

} ) );

const statusClass = computed( () => {

    return element( 'status' ).classify();

} );

// The filled part is a hard-stop gradient rather than a nested element: the bar
// is a single div, and layering the fill over the CSS track keeps it that way.
const statusAttrs = computed( () => ( {

    'class': statusClass.value,
    'style': {

        'height': height.value.toString(),
        'background-image': color.value
            ? `linear-gradient( to right, ${ color.value } 0%, ${ color.value } ${ percent.value }%, transparent ${ percent.value }%, transparent 100% )`
            : 'none',

    },

} ) );

const footerClass = computed( () => {

    return element( 'footer' ).classify();

} );

const footerAttrs = computed( () => ( {

    'class': footerClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-status-bar {

    display: flex;
    flex-direction: column;
    gap: 4px;

    padding: 0;

    &__header,
    &__footer {

        display: flex;
        align-items: center;

        font-size: 12px;
        line-height: 1;
        color: var( --ui-text-secondary );

    }

    // Unfilled remainder of the scale. The filled part is painted over it by the
    // inline background-image, so this stays a flat colour.
    &__status {

        width: 100%;
        border-radius: 999px;
        background-color: var( --ui-neutral-200 );

    }

}
</style>

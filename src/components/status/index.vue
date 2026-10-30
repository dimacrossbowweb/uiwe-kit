<template>

    <div v-bind="mainAttrs"></div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

/**
 * A small round presence / state marker ( online dot and the like ). `color` and
 * `borderColor` accept a theme token ( 'success', 'neutral' ) or any CSS colour.
 */
export interface IProps {

    theme: 'auto' | 'light' | 'dark';

    namespace: string;
    size: string | number;
    color: string;
    bordered: string | number;
    borderColor: string;

};

defineOptions( {

    name: 'UiStatus',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

    theme: 'auto',

    namespace: '',
    size: 12,
    color: 'success',
    bordered: 0,
    borderColor: 'neutral',

} );

const { parseValue, parseColor } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const size = computed( () => parseValue( props?.size ).toString() );
const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props?.color ).toString() );
const bordered = computed( () => parseValue( props?.bordered ).toString() );
const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );
const borderColor = computed( () => parseColor( borderColorVar?.value ? borderColorVar.value : props?.borderColor ).toString() );
const border = computed( () => `${ bordered.value } solid ${ borderColor.value }` );

const { block } = useBem( 'UiStatus' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-status {

    position: relative;
    display: inline-block;

    background-color: v-bind( color );

    width: v-bind( size );
    height: v-bind( size );

    border: v-bind( border );
    border-radius: 50%;

    box-sizing: border-box;

}

</style>

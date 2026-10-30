<template>

    <div

        ref="root"
        v-bind="mainAttrs"

    >

        <slot v-bind="{ isOver: isOverDropZone, files }"></slot>

    </div>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDropZone } from '@vueuse/core';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

type DataTypesValidator = ( types: readonly string[] ) => boolean;

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    width: string | number;
    height: string | number;
    absolute: boolean;
    fixed: boolean;

    // Allowed MIME types; omit to accept anything. A predicate is also accepted
    // for custom rules (e.g. extension-based). Passed straight to useDropZone.
    dataTypes: readonly string[] | DataTypesValidator;
    multiple: boolean;
    disabled: boolean;
    preventDefaultForUnhandled: boolean;

};

defineOptions( {

    name: 'UiDropZone',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
    width: 'auto',
    height: 'auto',
    absolute: false,
    fixed: false,
    dataTypes: undefined,
    multiple: true,
    disabled: false,
    preventDefaultForUnhandled: false,

} );

const emit = defineEmits<{

    drop:  [ files: File[] | null, event: DragEvent ];
    enter: [ files: File[] | null, event: DragEvent ];
    leave: [ files: File[] | null, event: DragEvent ];
    over:  [ files: File[] | null, event: DragEvent ];

}>();

const namespace = computed( () => props?.namespace ?? '' );

const { parseValue } = useFormat();

const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );
const absolute = computed( () => !!props?.absolute );
const fixed = computed( () => !!props?.fixed );
const disabled = computed( () => !!props?.disabled );

const root = ref<HTMLElement | null>( null );

// A null target while disabled keeps useDropZone from binding listeners, and
// the getter re-binds reactively when `disabled` flips.
const { isOverDropZone, files } = useDropZone(

    () => ( disabled.value ? null : root.value ),

    {

        dataTypes: props.dataTypes,
        multiple: props.multiple,
        preventDefaultForUnhandled: props.preventDefaultForUnhandled,

        onDrop:  ( f, e ) => emit( 'drop', f, e ),
        onEnter: ( f, e ) => emit( 'enter', f, e ),
        onLeave: ( f, e ) => emit( 'leave', f, e ),
        onOver:  ( f, e ) => emit( 'over', f, e ),

    },

);

const { block } = useBem( 'UiDropZone' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'absolute', absolute.value )
            .m( 'fixed', fixed.value )
            .m( 'over', isOverDropZone.value )
            .m( 'disabled', disabled.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

defineExpose( {

    isOverDropZone,
    files,

} );

</script>

<style lang="scss" scoped>
.ui-drop-zone {

    width: v-bind( width );
    height: v-bind( height );

    transition: background-color .2s ease-in-out, outline-color .2s ease-in-out;

    &_absolute {

        position: absolute;
        left: 0;
        top: 0;

    }

    &_fixed {

        position: fixed;
        left: 0;
        top: 0;

    }

    // Active drag-over state. Kept subtle and overridable — consumers usually
    // render their own overlay via the slot's `isOver` scope.
    &_over {

        outline: 2px dashed var( --ui-brand );
        outline-offset: -2px;
        background-color: var( --ui-brand-100, rgba( 0, 0, 0, .04 ) );

    }

}

</style>

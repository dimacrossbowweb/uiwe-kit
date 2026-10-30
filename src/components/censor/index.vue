<template>

    <div v-bind="mainAttrs">

        <slot></slot>

    </div>

</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

    namespace: string;

};

defineOptions( {

    name: 'UiCensor',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

    namespace: '',

} );

const attrs = useAttrs();

const namespace = computed( () => props?.namespace ?? '' );

const { block } = useBem( 'UiCensor' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

    ...attrs,

} ) );

</script>

<style lang="scss" scoped>

</style>

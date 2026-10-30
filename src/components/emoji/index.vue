<template>
    
    <em-emoji v-bind="mainAttrs"></em-emoji>

</template>

<script lang="ts" setup>
import { computed, useAttrs, onMounted, } from 'vue';
import { useBem } from '@/composables/useBem';
import data from '@emoji-mart/data'
import { init } from 'emoji-mart';

onMounted( () => {

    init( { data } );

} );

const attrs = useAttrs();

const { block } = useBem( 'UiEmoji' );

const mainClass = computed( () => {

    return block.classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

    ...attrs,

} ) );

</script>

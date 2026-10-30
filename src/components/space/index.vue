<template>

	<div v-bind:class="mainClass">

		<slot/>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

defineOptions( {

	name: 'UiSpace',

} );

const { block } = useBem( 'UiSpace' );

const mainClass = computed( () => {

	return block.classify();

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

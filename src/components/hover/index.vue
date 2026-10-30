<template>

	<div

		v-bind:class="mainClass"
		@mouseenter="onHover"
		@mouseleave="onBlur"

	>
		<slot v-bind:hover="isHovered" />
	
	</div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useBem } from '@/composables/useBem';

defineOptions( {

	name: 'UiHover',

} );

const emit = defineEmits ( [ 'hover', 'blur' ] );

const isHovered = ref<boolean>( false );

const { block } = useBem( 'UiHover' );

const mainClass = computed( () => {

	return block.classify();

} );

/**
** 
**/
function onHover ( e: Event ): void {

	isHovered.value = true;

	emit( 'hover', e );

};

/**
** 
**/
function onBlur ( e: Event ): void {

	isHovered.value = false;

	emit( 'blur', e );

};

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

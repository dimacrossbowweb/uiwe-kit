<template>

	<div
		ref="root"
		:class="itemClass"
		:data-side="placement?.side ?? 'center'"
		:style="style"
	>

		<ui-toast
			:theme="theme"
			:text="toast.text"
			:icon="toast.icon"
			:type="toast.type"
		/>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed, onMounted, type CSSProperties } from 'vue';
import { placeToast, type IToast, type IToastPlacement } from '@/composables/useToast';
import { useBem } from '@/composables/useBem';
import UiToast from '../index.vue';

defineOptions( {

	name: 'UiToastLayerItem',

} );

const props = withDefaults( defineProps<{

	toast: IToast;
	theme?: 'auto' | 'light' | 'dark';
	gap?: number;
	margin?: number;

}>(), {

	theme: 'auto',
	gap: 8,
	margin: 12,

} );

const root      = ref<HTMLElement | null>( null );
const placement = ref<IToastPlacement | null>( null );

const itemClass = computed( () => useBem( 'UiToastLayer' ).element( 'item' ).classify() );

// The toast's size is only known after render ( it depends on the text ), so
// placement is computed on mount and the toast stays invisible until then —
// otherwise it would flash in the top-left corner. Measure and place happen
// within one frame.
onMounted( () => {

	const el = root.value;
	if ( !el ) return;

	placement.value = placeToast(
		props.toast.anchor,
		{ width: el.offsetWidth, height: el.offsetHeight },
		{ width: window.innerWidth, height: window.innerHeight },
		{ gap: props.gap, margin: props.margin },
	);

} );

const style = computed<CSSProperties>( () => placement.value
	? { left: `${ placement.value.x }px`, top: `${ placement.value.y }px` }
	: { left: '0px', top: '0px', visibility: 'hidden' },
);
</script>

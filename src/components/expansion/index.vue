<template>

	<div

		ref="panel"
		v-bind="mainAttrs"

	>

		<div

			ref="content"
			v-bind="contentAttrs"

		>

			<div

				ref="inner"
				v-bind="innerAttrs"

			>

				<slot></slot>

			</div>

		</div>

	</div>

</template>

<script lang="ts" setup>
import {

	ref,
	computed,
	onMounted,
	onBeforeUnmount,
	watchEffect,
	nextTick,

} from 'vue';

import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';
	namespace: string;
	row: boolean;
};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	row: false,

});

const value = defineModel({ default: false });
const panel = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const inner = ref<HTMLElement | null>(null);
const {

	block,
	element,

} = useBem('UiExpansion');

const namespace = computed(() => props?.namespace ?? '');
const row = computed(() => !!props?.row);
const size = ref<string | number>(0);
const directionField = computed(() => row.value ? 'width' : 'height');
const scrollField = computed(() => row.value ? 'scrollWidth' : 'scrollHeight');

// Read the natural content size off the *unconstrained* inner wrapper and push
// it onto `size`. The animated box is `content`; once it's pinned to a fixed
// px its own scrollHeight/box no longer tracks the real content, but `inner`
// always lays out at its natural size, so it stays an honest ruler.
function measure(): void {

	if ( !value.value ) return;

	if ( inner.value ) {

		size.value = inner.value[ scrollField.value ] + 'px';

	}

}

let observer: ResizeObserver | null = null;

onMounted( () => {

	watchEffect( async () => {

		if ( value.value ) {

			await nextTick();

			measure();

		} else {

			size.value = 0;

		}

	} );

	// Keep an open panel sized to its content as that content changes — async
	// media loading, teleported children arriving, text reflow. The previous
	// one-shot measure ran once on open and clipped anything that grew after.
	if ( inner.value && typeof ResizeObserver !== 'undefined' ) {

		observer = new ResizeObserver( () => measure() );
		observer.observe( inner.value );

	}

} );

onBeforeUnmount( () => {

	observer?.disconnect();
	observer = null;

} );

const mainClass = computed( () => {

	return block
		.mix( namespace.value )
		.classify();

});

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const contentClass = computed( () => {

	return element( 'content' )
		.mix( namespace.value )
		.classify();

});

const contentAttrs = computed( () => ( {

	'class': contentClass.value,
	'style': {

		[ `${ directionField.value }` ]: size.value,

	}

} ) );

const innerClass = computed( () => {

	return element( 'inner' )
		.mix( namespace.value )
		.classify();

});

const innerAttrs = computed( () => ( {

	'class': innerClass.value,
	'style': {

		// In row mode the wrapper must shrink-wrap its width so the ruler reads
		// the content's natural width, not the parent's full width.
		'display': row.value ? 'inline-block' : 'block',

	}

} ) );

</script>

<style lang="scss" scoped>
.ui-expansion {

	display: inline-block;

	position: relative;

	box-sizing: border-box;

	overflow: hidden;

	&__content {

		transition: .4s ease-in-out;

		box-sizing: border-box;

		display: block;

		overflow: hidden;

	}

	&__inner {

		box-sizing: border-box;

	}

}

</style>

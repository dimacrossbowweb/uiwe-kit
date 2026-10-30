<template>

  	<Splide

		v-bind="mainAttrs"
    	ref="splideRef"
		@splide:mounted="onMounted"
		@splide:moved="onMoved"

	>

		<SplideSlide

			v-for="(item, i) in items"
      		:key="item?.id ?? i"

    	>

			<slot

        		name="slide"
        		v-bind="{ item, i }"

      		></slot>

		</SplideSlide>

	</Splide>

</template>

<script lang="ts" setup>
/**
 * Splide wrapper.
 *
 *  - `v-model` — index of the current slide: changing the model moves to the
 *    slide, and scrolling ( drag, wheel ) updates the model. The `moved` event
 *    fires once the slider has arrived at a slide ( after the animation ).
 *  - `vertical` — slides move top to bottom ( Splide `direction: 'ttb'` ).
 *    A vertical Splide needs a track height — set it with the `height` prop;
 *    exactly one slide is shown.
 */
import { computed, ref, watch, nextTick } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
// Splide's stylesheet is NOT imported here, matching how this library
// handles its own CSS (`import 'uiwekit/styles.css'`). A component-level CSS
// import also makes the module unloadable outside a bundler — plain Node
// cannot `require` a .css file — which broke SSR and `require('uiwekit/carousel')`.
//
// Import the theme you want once, in your app entry:
//   import '@splidejs/vue-splide/css';           // default theme
//   import '@splidejs/vue-splide/css/core';      // structural styles only
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	width: string | number;
	height: string | number;
	items: any[];
	options: Record<string, any>;
	vertical: boolean;

}

const props = withDefaults(defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	width: 'auto',
	height: 'auto',
	vertical: false,

  	options: () => ( {

    	autoWidth: true,
    	perPage: 3,
    	gap: '4px',
    	drag: 'free',
    	arrows: false,
    	pagination: false,
    	wheel: true,

  	} ),

} );

const emit = defineEmits<{ moved: [ index: number ] }>();

const value = defineModel<number>( {

	default: 0,

} );

// Template ref to the <Splide> component. Its `.splide` is the core instance.
const splideRef = ref<{ splide?: any } | null>( null );

const core = (): any => ( splideRef.value as any )?.splide;

const { parseValue } = useFormat();
const namespace = computed(() => props?.namespace ?? '');
const width = computed(() => parseValue(props?.width).toString() );
const height = computed(() => parseValue(props?.height).toString() );
const items = computed(() => props?.items ?? []);
const isVertical = computed( () => !!props.vertical );

// Vertical mode on top of the consumer's options: direction, one slide per
// view and the track height — without it a vertical Splide does not lay out.
// The start slide is read once, at creation: Splide watches its options, and a
// reactive `start` would re-apply them on every move.
const startIndex = value.value;

const options = computed( () => {

	const base: Record<string, any> = { start: startIndex, ...( props?.options ?? {} ) };

	if ( !isVertical.value ) return base;

	return {

		...base,

		direction: 'ttb',
		height: height.value !== 'auto' ? height.value : base.height,
		perPage: 1,
		autoWidth: false,
		autoHeight: false,

	};

} );

const { block } = useBem( 'UiSlider' );
const mainClass = computed(() => {

	return block
		.mix(namespace.value)
		.m( 'vertical', isVertical.value )
		.classify();

});

const mainAttrs = computed( () => ( {

	'class': mainClass.value,
	'options': options.value,

} ) );

// A model change moves to the slide. After nextTick: the target slide may have
// just been added, and Splide refreshes its slides only after render — before
// that go() would be capped by the old slide count.
watch( value, ( index ) => {

	nextTick( () => {

		const splide = core();

		if ( splide && splide.index !== index ) splide.go( index );

	} );

} );

function onMounted (): void {

	const splide = core();

	if ( splide && splide.index !== value.value ) splide.go( value.value );

}

function onMoved ( _splide: unknown, index: number ): void {

	if ( value.value !== index ) value.value = index;

	emit( 'moved', index );

}

// Temporarily toggle Splide's own pointer-drag. Used when an inner drag (e.g.
// attachment reorder) takes over the gesture so the track doesn't scroll too.
function setDragEnabled( enabled: boolean ): void {

	try { core()?.Components?.Drag?.disable( !enabled ); } catch { /* noop */ }

}

defineExpose( { setDragEnabled } );

</script>

<style lang="scss">
.ui-slider {

	width: v-bind(width);
	height: v-bind(height);
	padding: 0 !important;

  	.splide__list {

		padding: 10px 0;
		box-sizing: border-box;

  	}

  	.splide__slide {

    	box-sizing: border-box;

  	}

	// A vertical slider is a stack of full-track-height panels: list padding
	// would shift slides relative to the track window.
	&_vertical {

		.splide__list {

			padding: 0;

		}

		.splide__slide {

			display: flex;
			align-items: center;

		}

	}

}

</style>

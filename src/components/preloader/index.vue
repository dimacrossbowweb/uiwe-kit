<template>
	
	<svg v-bind="mainAttrs">

		<defs>

			<clipPath :id="`${ id }-cut-off`">

				<rect
					x="0"
					y="0"
					:width="size"
					:height="size" />

			</clipPath>

			<linearGradient :id="`${ id }-gradient`">

				<stop
					offset="0"
					:stop-color="color"></stop>

				<stop
					offset="75%"
					:stop-color="color"
					stop-opacity="0"
				></stop>

			</linearGradient>

		</defs>

		<circle

			class="ui-preloader__spinner"

			:cx="centerX"
			:cy="centerY"
			:r="radius"
			:stroke="`url(#${ id }-gradient)`"
			:stroke-width="strokeWidth"
			fill="none"
			:clip-path="`url(#${ id }-cut-off)`"

		/>

	</svg>

</template>

<script lang="ts" setup>
import { computed, useId } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

const sizes: Record<string, number> = {

	'small': 24,
	'normal': 36,
	'large': 48

};

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	size: string | number;
	strokeWidth: string | number;
	color: string;

};

defineOptions( {

	name: 'UiPreloader',

} );

const props = withDefaults ( defineProps<Partial<IProps>> (), {

	theme: 'auto',

	namespace: '',
	size: 28,
	strokeWidth: 2,
	color: 'primary'

} );

const { parseColor } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

// Stable per-instance id for the SVG gradient. The previous computed(uuidv4)
// minted a fresh id on every re-evaluation, which could desync the fill
// reference from the gradient it points at.
const id = useId();

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );
const size = computed( (): number => {

	if ( typeof props.size === 'string' ) {

		const named = sizes[ props.size ];
		if ( named !== undefined ) return named;

	}

	return +props.size;

} );

const strokeWidth = computed( () => +props.strokeWidth );

const radius = computed( () => size.value / 2 );

const centerX = computed( (): number => ( size.value + strokeWidth.value ) / 2 );

const centerY = computed( (): number => ( size.value + strokeWidth.value ) / 2 );

const viewBox = computed( (): string => `0 0 ${ size.value + strokeWidth.value } ${ size.value + strokeWidth.value }` );

const { block } = useBem( 'UiPreloader' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	'viewBox': viewBox.value,
	'width': size.value,
	'height': size.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-preloader {

	&__spinner {

		transform-box: fill-box;
		transform-origin: center;
		animation: ui-preloader-rotate 1s linear infinite;

	}

}

@keyframes ui-preloader-rotate {

	to {
		transform: rotate( 360deg );
	}

}
</style>

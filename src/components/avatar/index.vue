<template>

	<div
	
		v-bind:class="mainClass"
		ref="container"
		@click="onClick"

	>

		<div v-if="isStatus" v-bind="statusAttrs" ref="status" >

			<slot name="status" />

		</div>

		<template v-if="isImage">

			<!--
			-- While the image loads it is transparent and the `preloader` slot
			-- spins on top. Without the slot the image simply appears once loaded.
			-->
			<img

				v-bind:class="avatarImageClass"
				:style="imageStyle"

				:src="src"
				:alt="name"

				@load="onImageLoad"
				@error="onImageError"

			/>

			<div v-if="isPreloading" v-bind:class="preloaderClass">

				<slot name="preloader" :size="preloaderSize" :color="textColor" />

			</div>

		</template>

		<template v-else>
	
			<svg

				v-bind:class="avatarImageClass"

				viewBox="0 0 100 100"
				
			>

				<!--
				-- Volumetric fill under the initials: a diagonal from the colour to
				-- its darker shade plus a sheen from the top-left corner. Ids are
				-- unique per instance — a shared one would make every avatar use
				-- the first one's gradient, i.e. someone else's colour.
				-->
				<defs v-if="shading">

					<linearGradient

						:id="bodyGradientId"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"

					>

						<stop offset="0%" :stop-color="color" />
						<stop offset="100%" :stop-color="shadedColor" />

					</linearGradient>

					<!--
					-- The sheen is pinned to the corner with the radius reaching the
					-- far side: `radial-gradient( circle at top left, …, transparent
					-- 60% )` expressed in SVG units.
					-->
					<radialGradient

						:id="sheenGradientId"
						cx="0%"
						cy="0%"
						r="85%"

					>

						<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
						<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />

					</radialGradient>

				</defs>

				<circle

					v-bind:class="circleClass"
					cx="50"
					cy="50"
					r="50"

				/>

				<circle

					v-if="shading"
					v-bind:class="sheenClass"
					cx="50"
					cy="50"
					r="50"

				/>

				<text

					v-bind:class="textClass"
					x="50%" 
					y="50%" 
					alignment-baseline="middle" 
					text-anchor="middle"
					font-size="30"
					font-weight="600" 
					dy=".1em" 
					dominant-baseline="middle" 
				
				>
				
					{{ name }}
				
				</text>

			</svg>

		</template>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed, watch, useId, useSlots, onMounted, onBeforeUnmount, useTemplateRef, nextTick } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';
import { useAvatar } from '@/composables/useAvatar';
import type { IProps } from './props.type';

const sizes: Record<string, number> = {

	'small': 24,
	'normal': 36,
	'large': 48

};

defineOptions( {

	name: 'UiAvatar',

} );

const props = withDefaults( defineProps<IProps>(), {

	theme: 'auto',

	namespace: '',
	name: '',
	size: 36,
	bordered: 0,
	borderColor: 'brand-600',
	color: 'brand',
	shading: false,
	statusGap: 3,

} );

const slots = useSlots();

const {
	
	parseColor,
	parseValue,

} = useFormat();

const namespace = computed( () => props.namespace );
const name = computed( () => useAvatar().reduction( props.name ) );
const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props?.color ).toString() );
const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );
const borderColor = computed( () => parseColor( borderColorVar?.value ? borderColorVar.value : props?.borderColor ).toString() );
const size = computed( () => {

	if ( typeof props.size === 'string' && props.size in sizes ) {

		return parseValue( sizes[ props.size ]! ).toString();

	}
	
	return parseValue( props.size ).toString();

} );
const bordered = computed( () => parseValue( props?.bordered ).toString() );
const textColor = computed( () => parseColor( color?.value ).contrast().toString() || useCSSVar( 'text-color', props.theme ) );

// Gradients live in <defs> and are referenced by id. Unique per instance: ids
// are document-wide, so a shared one would paint every avatar with the first
// one's gradient.
const uid = useId();

const bodyGradientId = computed( () => `ui-avatar-body-${ uid }` );
const sheenGradientId = computed( () => `ui-avatar-sheen-${ uid }` );

// Far end of the diagonal: the same colour mixed with black.
const shadedColor = computed( () => `color-mix( in srgb, ${ color.value } 78%, black )` );

// Circle fill: a gradient with `shading`, a flat colour otherwise. Set via CSS,
// not the `fill` attribute — a presentation attribute loses to any class rule.
const circleFill = computed( () => props.shading ? `url(#${ bodyGradientId.value })` : color.value );

const sheenFill = computed( () => `url(#${ sheenGradientId.value })` );

const isStatus = computed( () => !!slots.status );

// State of the `src` image. Reset on every address change: the new image loads
// again and the previous error does not apply to it.
const imageLoading = ref<boolean>( false );
const imageFailed = ref<boolean>( false );

watch( () => props.src, ( src ) => {

	imageLoading.value = !!src;
	imageFailed.value = false;

}, { immediate: true } );

// A broken image falls back to the initials, as if no `src` was passed,
// instead of showing the browser's broken-image icon.
const isImage = computed( () => !!props.src && !imageFailed.value );
const isPreloading = computed( () => imageLoading.value && !!slots.preloader );

const imageStyle = computed( () => isPreloading.value ? { opacity: 0 } : undefined );

// The spinner is a bit over half the avatar: readable at both 24px and 48px.
const preloaderSize = computed( () => Math.round( parseFloat( size.value ) * 0.55 ) );

function onImageLoad (): void {

	imageLoading.value = false;

}

function onImageError (): void {

	imageLoading.value = false;
	imageFailed.value = true;

}
const borderStatus = computed( () => props.borderStatus );
const container = useTemplateRef<HTMLElement | null> ( 'container' );
const status = useTemplateRef<HTMLElement | null> ( 'status' );
const statusSize = ref<number>( 0 );
const indent = ref<number>( 0 );
const avatarSize = ref<number>( 0 );

const statusGap = computed<number>( () => Math.max( 0, parseFloat( String( props.statusGap ) ) || 0 ) );

// Cut-out under the status: a round hole in the image mask, `statusGap` wider
// than the status itself, so the ring around it is transparent on any
// background. Centred on the slot ( right/bottom = indent ). No mask until the
// status has been measured.
const cutoutMask = computed<string>( () => {

	if ( !isStatus.value || !statusGap.value || !statusSize.value || !avatarSize.value ) return 'none';

	const center = avatarSize.value - indent.value - statusSize.value / 2;
	const radius = statusSize.value / 2 + statusGap.value;

	// Half a pixel of transition — an anti-aliased edge instead of steps.
	return `radial-gradient( circle at ${ center }px ${ center }px, transparent ${ radius }px, #000 ${ radius + 0.5 }px )`;

} );

const borderStyle = computed( () => `${ bordered.value } solid ${ borderColor.value }` );

const emit = defineEmits( [
	
	'click',

] );

const { block, element } = useBem( 'UiAvatar' );

const mainClass = computed( () => {

	return block
		.mix( namespace.value )
		.m( 'status', isStatus.value )
		.classify();

} );

const avatarImageClass = computed( () => {

	return element( 'image' ).classify();

} );

const preloaderClass = computed( () => {

	return element( 'preloader' ).classify();

} );

const circleClass = computed( () => {

	return element( 'circle' ).classify();

} );

const sheenClass = computed( () => {

	return element( 'sheen' ).classify();

} );

const textClass = computed( () => {

	return element( 'text' ).classify();

} );

const statusAttrs = computed( () => {

	return {
		class: element( 'status' ).mix( namespace.value ).classify(),
		style: {
			border: borderStatus.value,
			width: statusSize.value + 'px',
			height: statusSize.value + 'px',
			'border-radius': statusSize.value + 'px',
			right: indent.value + 'px',
			bottom: indent.value + 'px',
		}
	}
} );

function onClick (): void {

	emit( 'click' );

}

let observerContainer: ResizeObserver | null = null;

onMounted( () => {

	observerContainer = new ResizeObserver(entries => {
		if (isStatus.value)
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				const r = Math.max(width, height) / 2;
				avatarSize.value = r * 2;
				statusSize.value = Math.round( r / 2 );

				nextTick( () => { requestAnimationFrame( () => {

					// The ring may have unmounted between the observer firing
					// and this frame running.
					if ( !status.value ) return;

					const k = Math.sqrt( r * r / 2);
					indent.value = Math.floor(  r - k ) - (  status.value.offsetHeight / 2 );

				}) });

			}
	})

	if ( container.value ) observerContainer.observe(container.value)

} );

onBeforeUnmount( () => {

} );

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-avatar {

	display: flex;
	justify-content: center;
	align-items: center;

	width: v-bind( size );
	height: v-bind( size );

	background-color: v-bind( color );

	aspect-ratio: 1/1;

	position: relative;

	padding: 0!important;

	border: v-bind( borderStyle );

	border-radius: 50%;

	&__circle {

		fill: v-bind( circleFill );

	}

	// Sheen over the fill. A separate class, not `__circle`: that one has its
	// own `fill`, which would override the sheen gradient.
	&__sheen {

		fill: v-bind( sheenFill );

		pointer-events: none;

	}

	&__image {

		width: 100%;
		height: 100%;
		aspect-ratio: 1/1;
		object-fit: cover;

		// outline does not scale, so the border is an inset box-shadow.
		box-shadow: inset 0 0 0 v-bind( bordered ) v-bind( borderColor );
		border-radius: 50%;

	}

	&__preloader {

		position: absolute;
		inset: 0;

		display: flex;
		justify-content: center;
		align-items: center;

		pointer-events: none;

	}

	&__text {

		width: 100%;
		height: 100%;

		fill: v-bind( textColor );

	}

	&__status {

		overflow: hidden;
		position: absolute;
		z-index: 1;

		// Slot content ( e.g. ui-status ) fills the whole allotted circle.
		display: flex;

		> :deep( * ) {

			width: 100%;
			height: 100%;

		}

	}

	// With a status the fill moves from the root to ::before: a cut-out mask on
	// the root would also clip the status, and the root background would show
	// through the image cut-out. isolate keeps the z-index -1 ::before under the
	// content but above the parent's background.
	&_status {

		isolation: isolate;
		background-color: transparent;

		&::before {

			content: '';

			position: absolute;
			inset: 0;
			z-index: -1;

			border-radius: 50%;
			background-color: v-bind( color );

			-webkit-mask-image: v-bind( cutoutMask );
					mask-image: v-bind( cutoutMask );

		}

	}

	&_status &__image {

		-webkit-mask-image: v-bind( cutoutMask );
				mask-image: v-bind( cutoutMask );

	}

}

</style>
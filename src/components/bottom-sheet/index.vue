<template>

	<slot

		name="activator"
		:setRef="setActivatorRef"
		:on-show="onShow"
		:on-hide="onHide"
		:value="value"
		
	></slot>

	<ui-transition
		
		v-model="value"

		@on-after-leave="onHidingEnd"

		v-bind:on-enter="showHandler"
		v-bind:on-leave="hideHandler"

		:duration="700"

	>

		<div
		
			ref="sheet"
			v-bind="mainAttrs"

		>

			<template v-if="!!slots.overlay">

				<div
				
					ref="overlay"
					v-bind="overlayAttrs"
					
				>

					<slot name="overlay"></slot>

				</div>

			</template>
	
			<div
			
				ref="content"
				v-bind="contentAttrs"
				@touchstart.passive="onTouchStart"
				@touchmove="onTouchMove"
				@touchend.passive="onTouchEnd"

				:style="{

					'height': height,

				}"
				
			>

				<div v-bind="rollerAttrs">

					<div v-bind="rollAttrs"></div>

				</div>

				<slot
				
					name="content"
					v-bind="{ on, options }"
					
				></slot>

			</div>

		</div>

	</ui-transition>

</template>

<script lang="ts" setup>
import gsap from 'gsap';
import {
	ref,
	onMounted,
	useTemplateRef,
	computed,
	useSlots,
	watch,
} from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useWindowSize } from '@vueuse/core';
import { useElementSize } from '@vueuse/core';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useEscapeLayer } from '@/composables/useEscapeLayer';
import { useCheckpoints } from '@/composables/useCheckpoints/checkpoints';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	height: string | number;
	minHeight: string | number;
	maxHeight: string | number;
	fixed: boolean;
	zIndex: string | number;
	/** Closes on Esc ( via the shared layer stack ). */
	escapable: boolean;

	onEnter: ( ctx: any ) => {},
	onLeave: ( ctx: any ) => {},

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	height: 500,
	minHeight: 'auto',
	maxHeight: 'auto',
	fixed: false,
	escapable: true,

} );

const slots = useSlots();

const value = defineModel( { default: false } );

useEscapeLayer( value, () => { value.value = false; }, { enabled: () => props.escapable } );

const currentHeight = ref<number>(0);

const startY = ref<number>(0);
const startHeight = ref<number>(0);
const isDragging = ref<boolean>(false);

const scrollY = ref<number>(0);

const emit = defineEmits( [ 'close' ] );

const { parseValue } = useFormat();

const { block, element } = useBem( 'UiBottomSheet' );

const activator = ref<HTMLElement | null>( null );
const sheet = useTemplateRef<HTMLElement | null>( 'sheet' );
const overlay = useTemplateRef<HTMLElement | null>( 'overlay' );
const content = useTemplateRef<HTMLElement | null>( 'content' );

const setActivatorRef = (el: HTMLElement | null) => {

	activator.value = el;

};

const { width: sheetWidth, height: sheetHeight } = useElementSize( sheet );

const namespace = computed( () => props?.namespace ?? '' );
const minHeight = computed( () => parseValue( props?.minHeight )?.toString() ?? 'auto' );
// const maxHeight = computed( () => parseValue( props?.maxHeight )?.toString() ?? 'auto' );

const fixed = computed( () => !!props?.fixed );
const zIndex = computed( () => props?.zIndex ?? 80 );

const showHandler = computed( () => props?.onEnter ?? onEnter );
const hideHandler = computed( () => props?.onLeave ?? onLeave );

onMounted(() => {

	currentHeight.value = +props.height;
  
});

const isTopReached = computed( () => currentHeight.value === sheetHeight.value );

const height = computed( () => `${ currentHeight.value }px` );

watch( value, () => {

	if ( value ) {

		currentHeight.value = +props.height;

	}

} );

const { height: windowHeight } = useWindowSize();

const { has: hasCheckpoint } = useCheckpoints( currentHeight, {

	'small': [ -Infinity, 100 ],
	'medium': [ 100, computed( () => windowHeight.value - 100 ) ],
	'large': [ computed( () => windowHeight.value - 100 ), Infinity ]

} );

const on = computed( () => ( {

	'close': onClose, 

} ) );

const options = computed( () => ( {

	'small': hasCheckpoint.value( 'small' ),
	'large': hasCheckpoint.value( 'large' ),
	'medium': hasCheckpoint.value( 'medium' ),

} ) );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'fixed', fixed.value )
			.classify();


} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const overlayClass = computed( () => {

	return element( 'overlay' )
			.mix( namespace.value )
			.classify();


} );

const overlayAttrs = computed( () => ( {

	'class': overlayClass.value,

} ) );

const contentClass = computed( () => {

	return element( 'content' )
			.mix( namespace.value )
			.m( 'up', isTopReached.value )
			.classify();


} );

const contentAttrs = computed( () => ( {

	'class': contentClass.value,

} ) );

const rollerClass = computed( () => {

	return element( 'roller' )
			.mix( namespace.value )
			.classify();


} );

const rollerAttrs = computed( () => ( {

	'class': rollerClass.value,

} ) );

const rollClass = computed( () => {

	return element( 'roll' )
			.mix( namespace.value )
			.m( 'up', isTopReached.value )
			.classify();


} );

const rollAttrs = computed( () => ( {

	'class': rollClass.value,

} ) );

function onEnter (): void {

	// An unfinished disappear must not play out over the appear ( and vice versa ).
	gsap.killTweensOf( content.value );

	gsap.fromTo(
		
		content.value,
		
		{
			
			opacity: 0,
			y: currentHeight.value
		
		},
		
		{
			
			opacity: 1,
			y: 0, 
			duration: 0.3, 
		
		}
	
	);

}

function onLeave (): void {

	gsap.killTweensOf( content.value );

	gsap.to(
		
		content.value,
		
		{
			
			opacity: 0,
			y: '100dvh', 
			duration: 0.3, 
		
		}
	
	);

}

function onClose (): void {

	value.value = false;

}

function onHidingEnd (): void {

	emit( 'close' );

}

function onTouchStart(e: TouchEvent) {

	if (!content.value) return;

	isDragging.value = true;

	const touch = e.touches[0];
	if ( !touch ) return;

	startY.value = touch.clientY;
	startHeight.value = currentHeight.value;

	content.value.style.transition = 'none';

}

function onTouchMove(e: TouchEvent) {

	e.preventDefault();

	if (!isDragging.value || !content.value || scrollY.value > 0) return;

	const touch = e.touches[0];
	if ( !touch ) return;

	const deltaY = startY.value - touch.clientY; // upward = positive deltaY
	let newHeight = startHeight.value + deltaY;

	currentHeight.value = sheetHeight.value <= newHeight ? sheetHeight.value : newHeight;
	content.value.style.height = `${newHeight}px`;
}

function onTouchEnd(e: TouchEvent) {

	if ( !isDragging.value || !content.value ) return;

	isDragging.value = false;
	content.value.style.transition = '';

	const changedTouch = e.changedTouches[0];
	if ( !changedTouch ) return;

	const deltaY = startY.value - changedTouch.clientY;
	const velocity = deltaY / ( Date.now() - ( e.timeStamp || Date.now() ) );
	const threshold = 100;

	snapToCheckpoint();

}

function snapToCheckpoint() {

	if ( hasCheckpoint.value( 'small' ) ) {

		onClose();

	}

	if ( hasCheckpoint.value( 'medium' ) ) {

		currentHeight.value = +props.height;

	}

	if ( hasCheckpoint.value( 'large' ) ) {

		currentHeight.value = windowHeight.value;

	}

}

function onShow(): void {

	value.value = true;

}

function onHide(): void {

	value.value = false;

}

onClickOutside(
	
	content,
	() => {

		value.value = false;

	},

);

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-bottom-sheet {

	z-index: v-bind( zIndex );

	&__content {

		min-height: v-bind( minHeight );
		max-height: 100%;

		transition: height .2s;

		overflow-y: auto;
  		overscroll-behavior-y: none;

	}

}

</style>

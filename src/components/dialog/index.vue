<template>

	<ui-transition
		
		v-model="value"

		@on-after-leave="onHidingEnd"

		v-bind:on-enter="showHandler"
		v-bind:on-leave="hideHandler"

		:duration="700"

	>
    
		<div
		
			v-bind="mainAttrs"
			ref="dialog"
			
		>

			<template v-if="!!slot.overlay">

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

			>

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
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useEscapeLayer } from '@/composables/useEscapeLayer';
import {

	ref,
	useTemplateRef,
	computed,
	useSlots,

} from 'vue';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    absolute: boolean;
    zIndex: string | number;
    width: string | number;
    height: string | number;
    /** Closes on Esc ( via the shared layer stack ). */
    escapable: boolean;

	onShow: ( ctx: any ) => {},
	onHide: ( ctx: any ) => {},

};

defineOptions( {

	name: 'UiDialog',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    absolute: false,
    zIndex: 80,
    width: '100%',
    height: '100%',
    escapable: true,

} );

const { parseValue } = useFormat();

const emit = defineEmits( [ 'close' ] );

const slot = useSlots();

const dialog = useTemplateRef<HTMLElement | null>( 'dialog' );
const overlay = useTemplateRef<HTMLElement | null>( 'overlay' );
const content = useTemplateRef<HTMLElement | null>( 'content' );

const value = defineModel( { default: false } );

useEscapeLayer( value, () => { value.value = false; }, { enabled: () => props.escapable } );

const namespace = computed( () => props?.namespace ?? '' );
const absolute = computed( () => !!props?.absolute );
const zIndex = computed( () => props?.zIndex ?? 80 );
const width = computed( () => parseValue( props?.width ?? '100%' ).toString() );
const height = computed( () => parseValue( props?.height ?? '100%' ).toString() );

const zoom = ref<boolean>( false );

const { block, element } = useBem( 'UiDialog' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'absolute', absolute.value )
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

    'class': overlayClass.value

} ) );

const contentClass = computed( () => {

    return element( 'content' )
            .mix( namespace.value )
            .m( 'zoom', zoom.value )
            .classify();

} );

const contentAttrs = computed( () => ( {

	'class': contentClass.value,

} ) );

const on = computed( () => ( {

	'close': onClose,
	'zoom': onZoom,

} ) );

const options = computed( () => ( {

	'zoomIn': zoom.value,

} ) );

const showHandler = computed( () => props?.onShow ?? onShow );
const hideHandler = computed( () => props?.onHide ?? onHide );

/**
 * What animates is not the root ( its ui-transition settles that itself ) but
 * the overlay and the content inside. Their unfinished tweens are killed here:
 * otherwise closing during the appear animation played the appear out on top
 * of the disappear.
 */
function settle (): void {

	gsap.killTweensOf( [ overlay.value, content.value ].filter( Boolean ) );

}

function onShow (): void {

	settle();

	gsap.fromTo(
		
		overlay.value,
		
		{
			opacity: 0,
		
		},
		
		{

			opacity: 1,
			duration: 0.4,

		}
	
	);

	gsap.fromTo(
		
		content.value,
		
		{
			
			opacity: 0,
			scale: 0.9

		},

		{

			opacity: 1,
			scale: 1,
			duration: 0.25,
			ease: 'power2.out'
		
		}
	
	);

}

function onHide (): void {

	settle();

	gsap.to(

		overlay.value,

		{

			opacity: 0,
			backdropFilter: 'blur(0)',
			duration: 0.4,

		}

	);

	// A single pass. This used to be a timeline with `repeat: 2, repeatDelay: 1`:
	// every repeat restarted from the initial state and the window popped up again.
	gsap.to( content.value, { opacity: 0, scale: 0.9, duration: 0.2, ease: 'power2.in' } );

}

function onClose (): void {

	value.value = false;

}

function onZoom (): void {

	zoom.value = !zoom.value;

	if ( zoom.value ) {

		gsap.to(
            
            content.value,
            {
                width: '100%',
                height: '100%',
                duration: 0.3,
                ease: 'power2.inOut'
            }
        
        );

	}

	if ( !zoom.value ) {

		gsap.to(
            
            content.value,
            {
                width: 'auto',
                height: 'auto',
                duration: 0.3,
                ease: 'power2.inOut'
            }

        );

	}

}

function onHidingEnd (): void {

	emit( 'close' );

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-dialog {

	z-index: v-bind( zIndex );

	&__content {

		width: v-bind( width );
		height: v-bind( height );

	}

}

</style>

<template>

	<div v-bind="mainAttrs">

		<template v-if="show">

			<div
			
				ref="container"
				v-bind="containerAttrs"
			
			>
			
				<slot></slot>

			</div>

		</template>

	</div>

</template>

<script lang="ts" setup>
import {
	
	useTemplateRef,
	ref,
	computed,
	// defineModel,
	watch,
	onMounted,
	nextTick,

} from 'vue';
import gsap from 'gsap';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	/** Imperative visibility. When provided, it overrides the v-model entirely. */
	display: boolean;

	/** Legacy fallback for both durationStart / durationEnd when those are not set. */
	duration: string | number;

	/** Animation duration on show / hide (ms). */
	durationStart: string | number;
	durationEnd: string | number;

	/** Delay before the show / hide animation begins (ms). */
	delayStart: string | number;
	delayEnd: string | number;

	onEnter: ( el: HTMLElement, duration: number ) => any;
	onLeave: ( el: HTMLElement, duration: number ) => any;

};

const emit = defineEmits( [ 
	
	'on-before-enter',
	'on-after-leave',

] );

defineOptions( {

	name: 'UiTransition',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	// Explicit `undefined` default: without it, Vue's Boolean prop casting
	// coerces an absent `display` to `false`, which would make `state` ignore
	// the v-model entirely (e.g. ui-window would never open).
	display: undefined,

} );

const value = defineModel( { default: false } );

// `display`, when passed, takes precedence over the v-model so the parent can
// drive the transition imperatively without binding a model.
const state = computed( () => props.display !== undefined ? !!props.display : value.value );

const { block, element } = useBem( 'UiTransition' );

const container = useTemplateRef<any>( 'container' );
const show = ref<boolean>( false );
const animCtx = ref<any>( null );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const { parseDuration } = useFormat();

const durationStart = computed( () => parseDuration( props.durationStart ?? props.duration, 400 ).ms );
const durationEnd = computed( () => parseDuration( props.durationEnd ?? props.duration, 400 ).ms );

const delayStart = computed( () => parseDuration( props.delayStart, 0 ).ms );
const delayEnd = computed( () => parseDuration( props.delayEnd, 0 ).ms );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

} ) );

const containerClass = computed( () => {

	return element( 'container' )
			.mix( namespace.value )
			.classify();

} );

const containerAttrs = computed( () => ( {

	class: containerClass.value,

} ) );

watch( state, () => {

	if ( state.value ) {

		manipulate( true );

	}

	else {

		manipulate( false );

	}

} );

onMounted((): void => {

	nextTick((): void => {

		manipulate( state.value );

	});

});

// Number of the current show / hide cycle. Showing is async ( it waits for
// nextTick so the content can render ), and a close arriving in that gap must
// cancel it — otherwise a late onEnter started the appear on top of an already
// running disappear and the window popped up again.
let cycle = 0;

/**
 * Stop animations still running on the element: a quick close during the
 * appear ( and vice versa ) otherwise leaves two tweens pulling the same
 * properties in opposite directions, and the longer one wins once the shorter
 * finishes.
 */
function settle ( item: Element ): void {

	gsap.killTweensOf( item );

}

async function manipulate ( value: boolean ): Promise<any> {

	// Cancel any pending delay / hide timer from a previous cycle.
	clearTimeout( animCtx.value );

	const current = ++cycle;

	if ( value ) {

		// The whole show — mounting included — is deferred by delayStart so the
		// element is NOT drawn during the delay. It mounts and immediately starts
		// from its hidden state (onEnter's gsap.set runs in a microtask, before
		// the browser paints), so there is no flash of the fully-visible element.
		const enter = async (): Promise<void> => {

			show.value = true;

			await nextTick();

			// Closed ( or reopened ) while waiting for render — this show is stale.
			if ( current !== cycle ) return;

			emit( 'on-before-enter' );

			container.value && Array.from(container.value.children).forEach( ( item: any ) => {

				settle( item );
				typeof props?.onEnter === 'function' && props.onEnter( item, durationStart.value );

			} );

		};

		if ( delayStart.value > 0 ) {

			animCtx.value = setTimeout( enter, delayStart.value );

		} else {

			await enter();

		}

	} else {

		const leave = (): void => {

			container.value && Array.from(container.value.children).forEach( ( item: any ) => {

				settle( item );
				typeof props?.onLeave === 'function' && props.onLeave( item, durationEnd.value );

			} );

			animCtx.value = setTimeout((): void => {

				show.value = false;

				emit( 'on-after-leave' );

			}, durationEnd.value);

		};

		if ( delayEnd.value > 0 ) {

			animCtx.value = setTimeout( leave, delayEnd.value );

		} else {

			leave();

		}

	}

}

</script>

<style lang="scss" scoped>
.ui-transition {

	display: contents;

	&__container {

		display: contents;

	}

}

</style>

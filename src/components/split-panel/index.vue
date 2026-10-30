<template>

	<div
		v-bind="containerAttrs"
		ref="container"
	>

		<div v-bind="startAttrs">
			<slot name="start" :section="activeSection" />
		</div>

		<div v-bind="dividerAttrs" ref="divider">
			<slot name="divider" :section="activeSection" />
		</div>

		<div v-bind="endAttrs" >
			<slot name="end" :section="activeSection" />
		</div>

	</div>

</template>

<script lang="ts" setup>

	import { ref, computed, useTemplateRef, onMounted, onBeforeUnmount, watch, type CSSProperties } from 'vue';
	import { useBem } from '@/composables/useBem';
	import { useCheckpoints } from '@/composables/useCheckpoints/checkpoints';
	import type { IProps, ISplitSection } from './props.type';

	const props = withDefaults( defineProps<Partial<IProps>>(), {

		theme: 'auto',

		namespace: '',
		orientation: null,
		reverse: false,
		vertical: false,
		cursor: null,
		min: 0,
		max: 1,
		sections: null,

	} );

	const namespace = computed( () => props.namespace ?? '' );
	const orientation = computed( () => {
		if (props.orientation !== null)
			return props.orientation === 'v' ? 'v' : 'h'
		return !!props.vertical ? 'v' : 'h';
	} );
	const reverse = computed( () => !!props.reverse );
	const cursor = computed( () => !!props.cursor ? props.cursor : null );
	const min = computed( () => {
		const min = Number(props.min);
		const max = Number(props.max);
		if (min > max || min < 0) return 0;
		if (min > 1) return 1;
		return min
	} );
	const max = computed( () => {
		const min = Number(props.min);
		const max = Number(props.max);
		if (min > max || max > 1) return 1;
		if (max < 0) return 0;
		return max
	} );
	const { block, element } = useBem( 'UiSplitPanel' );

	const containerAttrs = computed( () => ( {
		class: block.mix( namespace.value ).classify(),
		style: {
			'flex-direction': `${ orientation.value === 'h' ? 'row' : 'column' }${ reverse.value ? '-reverse' : ''}` 
		} as CSSProperties
	} ) );

	const startAttrs = computed( () => ( {
		class: element('start').mix( namespace.value ).classify(),
		style: {
			width: orientation.value === 'h' ? `${startSize.value}%` : '100%',
			height: orientation.value === 'h' ? '100%' : `${startSize.value}%`,
		} as CSSProperties
	} ) );

	const endAttrs = computed( () => ( {
		class: element('end').mix( namespace.value ).classify(),
		style: {
			width: orientation.value === 'h' ? `${endSize.value}%` : '100%',
			height: orientation.value === 'h' ? '100%' : `${endSize.value}%`,
		} as CSSProperties
	} ) );

	const dividerAttrs = computed( () => ( {
		class: element('divider').mix( namespace.value ).classify(),
		style: {
			width: orientation.value === 'h' ? '0px' : '100%',
			height: orientation.value === 'h' ? '100%' : '0px',
		} as CSSProperties
	} ) );

	const position = defineModel<number>( { default: 0.5 } );

	const startSize = computed( () => Math.round(100 * position.value) );

	const endSize = computed( () => 100 - startSize.value );

	const containerSize = ref<number>( 0 );

	// --- Drag sections ------------------------------------------------------
	// `position` is the *applied* fraction (what gets rendered). When `sections`
	// are supplied, the raw pointer fraction is run through a piecewise transfer
	// function so each px band can either follow the cursor (`fluid`) or pin the
	// panel to a fixed width (`fixed`, a dead-zone) until the cursor crosses out.
	type TSectionEntry = { name: string; section: ISplitSection };

	const sectionEntries = computed<TSectionEntry[]>( () =>
		Object.entries( props.sections ?? {} ).map( ( [ name, section ] ) => ( { name, section } ) )
	);
	const hasSections = computed( () => sectionEntries.value.length > 0 );

	// Which section owns this px value of the `start` panel (half-open ranges).
	const pickSection = ( px: number ): TSectionEntry | null => {
		for ( const entry of sectionEntries.value ) {
			const [ from, to ] = entry.section.range;
			if ( px >= from && ( to === Infinity || px < to ) ) return entry;
		}
		return sectionEntries.value[ sectionEntries.value.length - 1 ] ?? null;
	};

	const clampFraction = ( value: number ) => Math.min( Math.max( value, min.value ), max.value );

	// raw pointer fraction → applied fraction.
	const resolve = ( raw: number ): number => {

		if ( !hasSections.value || containerSize.value <= 0 ) return clampFraction( raw );

		const rawPx = raw * containerSize.value;
		const entry = pickSection( rawPx );

		if ( !entry ) return clampFraction( raw );

		if ( entry.section.mode === 'fixed' && entry.section.at != null )
			return entry.section.at / containerSize.value;

		// fluid: follow the cursor, bounded by the min/max fraction.
		const minPx = min.value * containerSize.value;
		const maxPx = max.value * containerSize.value;
		return Math.min( Math.max( rawPx, minPx ), maxPx ) / containerSize.value;

	};

	// Active section reported to slots, derived from the *applied* width.
	const appliedPx = computed( () => position.value * containerSize.value );
	const checkpointRanges = Object.fromEntries(
		Object.entries( props.sections ?? {} ).map( ( [ name, section ] ) => [ name, section.range ] )
	);
	const { state: sectionState } = useCheckpoints( appliedPx, checkpointRanges );
	const activeSection = computed<string | null>(
		() => {
			if ( !hasSections.value ) return null;
			// Before the container is measured, appliedPx is 0 and would resolve to
			// the smallest ('rail') section — flashing the panel collapsed on first
			// paint. Report no section until a real width is known.
			if ( containerSize.value <= 0 ) return null;
			return sectionState.value[ 0 ] ?? null;
		}
	);

	defineExpose( { activeSection } );

	const container = useTemplateRef<HTMLElement | null> ( 'container' );
	const divider = useTemplateRef<HTMLElement | null> ( 'divider' );
	// Typed as HTMLElement (not Element) so `pointerdown` resolves through
	// HTMLElementEventMap and the listener keeps its PointerEvent signature.
	const dividerActivator = ref<HTMLElement | null>( null );

	const startPosition = {val: 0, x: 0, y: 0}

	const cursorStyle = ref<HTMLStyleElement | null> (null);

	const clearGlobalCursor = () => {

		if (!!cursorStyle.value) {
			document.head.removeChild( cursorStyle.value );
			cursorStyle.value = null;
		}

	}

	const setGlobalCursor = ( ) => {

		clearGlobalCursor();

		if (!!cursor.value) {

			cursorStyle.value = document.createElement('style');
			cursorStyle.value.textContent = `* { cursor: ${cursor.value} !important; }`;
			document.head.appendChild(cursorStyle.value);
		
		}

	}

	const onMouseMove = (e: MouseEvent | TouchEvent ) => {

		let x = 0;
		let y = 0;

		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			const touch = e.touches[0];
			if (!touch) return;
			x = touch.clientX;
			y = touch.clientY;
		}

		const direction = reverse.value ? -1 : 1;

		const raw = orientation.value === 'h'
			? startPosition.val + ( (x - startPosition.x) * direction / containerSize.value )
			: startPosition.val + ( (y - startPosition.y) * direction / containerSize.value );

		position.value = resolve( raw );

	}

	const onMouseUp = () => {

		document.body.style.removeProperty('pointer-events');
		document.body.style.removeProperty('user-select');

		clearGlobalCursor();

		document.removeEventListener( 'mouseup', onMouseUp );
		document.removeEventListener( 'mousemove', onMouseMove );
		document.removeEventListener( 'touchend', onMouseUp );
		document.removeEventListener( 'touchmove', onMouseMove );

	}

	const onMouseDown = (e: PointerEvent) => {

		document.body.style.pointerEvents = 'none';
		document.body.style.userSelect = 'none';

		startPosition.val = position.value;
		startPosition.x = e.clientX;
		startPosition.y = e.clientY;

		if (e.pointerType === 'touch') {

			document.addEventListener( 'touchend', onMouseUp, { passive: true } );
			document.addEventListener( 'touchmove', onMouseMove, { passive: true } );

		} else {

			document.addEventListener( 'mouseup', onMouseUp, { passive: true } );
			document.addEventListener( 'mousemove', onMouseMove, { passive: true } );

		}

		setGlobalCursor();

	}

	let observerDivider: MutationObserver | null = null;
	let observerContainer: ResizeObserver | null = null;

	// const stopDraggable = (e: DragEvent) => { e.preventDefault(); }

	onMounted(() => {

		if ( !container.value || !divider.value ) return;

		// Measure synchronously on mount so `activeSection` resolves to the right
		// band before the first paint, instead of waiting for the ResizeObserver's
		// async first callback (which would briefly leave the panel collapsed).
		const rect = container.value.getBoundingClientRect();
		containerSize.value = orientation.value === 'h' ? rect.width : rect.height;

		observerDivider = new MutationObserver(() => {
			const next = ( divider.value?.children[0] ?? null ) as HTMLElement | null;
			if ( dividerActivator.value !== next ) {

				if ( dividerActivator.value )
					dividerActivator.value.removeEventListener( 'pointerdown', onMouseDown );

				dividerActivator.value = next;
				if (dividerActivator.value) {
					dividerActivator.value.addEventListener( 'pointerdown', onMouseDown );
				}

			}
		});

		observerDivider.observe(divider.value, { childList: true });

		observerContainer = new ResizeObserver(entries => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				const next = orientation.value === 'h' ? width : height;

				// Keep the `start` panel's pixel width constant across container
				// resizes (the `end` panel absorbs the change) instead of letting
				// the fraction scale the panel with the window. Skip the very first
				// measure (containerSize 0) and degenerate sizes.
				if ( containerSize.value > 0 && next > 0 && position.value > 0 ) {

					let frac = ( position.value * containerSize.value ) / next;

					if ( frac > max.value ) frac = max.value;
					if ( !hasSections.value && frac < min.value ) frac = min.value;

					position.value = frac;

				}

				containerSize.value = next;
			}
		})

		observerContainer.observe(container.value)

		dividerActivator.value = ( divider.value.children[0] ?? null ) as HTMLElement | null;
		if (dividerActivator.value) {
			dividerActivator.value.addEventListener( 'pointerdown', onMouseDown );
		}

		// divider.value.addEventListener('dragstart', stopDraggable);

		if (!hasSections.value) {
			if (min.value > position.value)
				position.value = min.value;

			if (max.value < position.value)
				position.value = max.value;
		}

	});

	onBeforeUnmount(() => {
	
		observerDivider?.disconnect();
		observerContainer?.disconnect();

		if (dividerActivator.value) {
			dividerActivator.value.removeEventListener( 'pointerdown', onMouseDown );
		}

		// divider.value.removeEventListener('dragstart', stopDraggable);
	
	});

	watch( position, () => {

		if (hasSections.value) return;

		if (position.value < min.value)
			position.value = min.value;
		else if (position.value > max.value)
			position.value = max.value;

	} );

	watch( min, () => {

		if (hasSections.value) return;

		if (min.value > position.value)
			position.value = min.value;

	} );

	watch( max, () => {

		if (hasSections.value) return;

		if (max.value < position.value)
			position.value = max.value;

	} );

</script>

<style lang="scss" scoped>

.ui-split-panel {

	position: relative;
	width: 100%;
	height: 100%;
	display: flex;

	&__start, &__end {
		overflow: hidden;
		position: relative;
	}

	&__divider {
		position: relative;
		z-index: 1;
	}

}

</style>
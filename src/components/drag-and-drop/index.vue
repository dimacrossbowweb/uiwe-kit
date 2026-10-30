<template>

	<div
		v-bind="dragAndDropElementMain"
		ref="dragAndDropElement"
	>

		<slot />

	</div>

</template>

<script lang="ts" setup>

	import { ref, computed, useTemplateRef, createApp, onBeforeUnmount } from 'vue';
	import type { App } from 'vue';
	import { useBem } from '@/composables/useBem';
	import type { IProps } from './index.types';
	import dragProxy from './drag-proxy'

	const props = withDefaults( defineProps<Partial<IProps>>(), {

		theme: 'auto',

		namespace: '',
		areaName: '',
		delay: 0,
		cursor: () => ({ startMoved: 'move', outsideZone: 'not-allowed'	}),
		mobileStyles: () => ( {} ),
		payload: () => ( {} ),
		activators: () => ( [] ),
		disabled: false,
		cloneParent: null,
		lockHorizontal: false,
		lockVertical: false,
		eventStart: () => {},
		eventMove: () => {},
		eventStop: () => {},

	} );

	const delay = computed( () => {
		const num = parseInt(String(props.delay));
		return  Number.isNaN(num) || num < 0 ? 0 : num;
	} );
	const disabled = computed( () => ( typeof props.disabled === 'boolean' && props.disabled ) 
		|| ( typeof props.disabled === 'string' && props.disabled.toLowerCase() !== 'false' ) );

	const directionX = computed( () => !(( typeof props.lockHorizontal === 'boolean' && props.lockHorizontal ) 
		|| ( typeof props.lockHorizontal === 'string' && props.lockHorizontal.toLowerCase() !== 'false' )) );
	
	const directionY = computed( () => !(( typeof props.lockVertical === 'boolean' && props.lockVertical ) 
		|| ( typeof props.lockVertical === 'string' && props.lockVertical.toLowerCase() !== 'false' )) );

	const payloadToStr = computed( () => {
		let result = "{}";
		try { result = JSON.stringify(props.payload) } catch {};
		return result;
	});
	const cloneParent = computed( () => {

		if (!!props.cloneParent) return props.cloneParent
		const parent = dragSource.value?.parentElement;
		return !!parent ? parent : document.body;

	});

	const timer = ref<ReturnType<typeof setTimeout> | null> ( null );
	const dragSource = useTemplateRef<HTMLElement | null> ( 'dragAndDropElement' );
	let dragProxyApp: App<Element> | null = null

	// Long-press start point. If the pointer travels past this threshold before
	// the press delay elapses, the gesture is treated as a scroll/swipe (handed
	// to ancestors like the slider) and the pending drag is cancelled.
	const MOVE_CANCEL_THRESHOLD = 8;
	let startX = 0;
	let startY = 0;

	function clientOf( e: MouseEvent | TouchEvent ): { x: number; y: number } {
		if (e instanceof MouseEvent) return { x: e.clientX, y: e.clientY };
		const t = e.touches[0] ?? e.changedTouches[0];
		return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 };
	}

	// Cancel a pending (not-yet-engaged) long-press and detach the move watcher.
	function cancelPending() {
		if (timer.value) {
			clearTimeout( timer.value );
			timer.value = null;
		}
		document.removeEventListener( 'pointermove', onMoveBeforeDrag );
	}

	function onMoveBeforeDrag( e: PointerEvent ) {
		const { x, y } = clientOf( e );
		if (Math.abs(x - startX) > MOVE_CANCEL_THRESHOLD || Math.abs(y - startY) > MOVE_CANCEL_THRESHOLD)
			cancelPending();
	}

	function onUpElement (e: MouseEvent | TouchEvent) {

		cancelPending();

		if (e instanceof MouseEvent)
			document.removeEventListener( 'mouseup', onUpElement );
		else
			document.removeEventListener( 'pointerup', onUpElement );

	}

	function onDownElement( e: PointerEvent ) {

		// NOTE: deliberately NOT stopping propagation here. Ancestors (e.g. the
		// slider) keep their own pointer gesture until the long-press actually
		// engages, so a quick swipe scrolls instead of starting a drag.

		startX = e.clientX;
		startY = e.clientY;

		if (e.pointerType === 'touch')
			document.addEventListener( 'pointerup', onUpElement );
		else
			document.addEventListener( 'mouseup', onUpElement );

		document.addEventListener( 'pointermove', onMoveBeforeDrag );

		let activator = true;
		if (props.activators.length) {
			activator = false;
			document.elementsFromPoint(e.clientX, e.clientY).forEach( element => {
				if (element instanceof HTMLElement && props.activators.includes(element))
					activator = true;
			} );
		}

		if (activator && !disabled.value) {

			const mobile = dragSource.value ? dragSource.value.cloneNode(true) as HTMLElement : null;

			timer.value = setTimeout( () => {

				// Long-press engaged: stop watching for the scroll-cancel move.
				document.removeEventListener( 'pointermove', onMoveBeforeDrag );

				if (mobile && dragSource.value) {

					mobile.style.position = 'fixed';
					mobile.style.pointerEvents = 'none';

					const rect = dragSource.value.getBoundingClientRect();
					mobile.style.left = `${rect.x || rect.left}px`;
					mobile.style.top = `${rect.y || rect.top}px`;

					// Lock the clone's box to the source's rendered size. Without
					// this a source sized via height/width:100% would re-resolve
					// against the viewport once it's position:fixed and stretch.
					mobile.style.width = `${rect.width}px`;
					mobile.style.height = `${rect.height}px`;
					mobile.style.boxSizing = 'border-box';

					cloneParent.value.appendChild(mobile);

					mobile.focus();

					for (const prop in props.mobileStyles) {
						const value = props.mobileStyles[prop];
						if (value !== undefined) mobile.style[prop] = value;
					}

					dragProxyApp = createApp( dragProxy, {

						startPosition: {
							e: e,
							x: e.clientX - (rect.x || rect.left),
							y: e.clientY - (rect.y || rect.top)
						},
						mobile,
						cloneParent: cloneParent.value,
						cursor: props.cursor,
						directionX: directionX.value,
						directionY: directionY.value,
						eventStart: props.eventStart,
						eventMove: props.eventMove,
						eventStop: props.eventStop,
						srcRef: dragSource.value,
					
					});

					dragProxyApp.mount( document.createElement('div') );

				}

			}, delay.value);

		}

	}

	const { block } = useBem( 'UiDragAndDrop' );
	const dragAndDropElementMain = computed( () => {

		const result = {
			class: block.mix( props.namespace ).classify(),
			'area-name-element': props.areaName,
			'drag-and-drop-element': payloadToStr.value,
			onDragstart: (e: Event) => e.preventDefault(),
			onDrop: (e: Event) => e.preventDefault(),
			onSelectstart: (e: Event) => e.preventDefault(),
			onPointerdown: onDownElement,
		}

		return result;

	} );

	onBeforeUnmount(() => {

		document.removeEventListener( 'mouseup', onUpElement );
		document.removeEventListener( 'touchend', onUpElement );
		document.removeEventListener( 'pointerup', onUpElement );
		document.removeEventListener( 'pointermove', onMoveBeforeDrag );
		if (timer.value) clearTimeout( timer.value );

	});

</script>

<style lang="scss" scoped>

.ui-drag-and-drop {

	touch-action: none;

}

</style>
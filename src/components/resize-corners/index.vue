<template>

	<div
		v-for="corner in CORNERS"
		:key="corner"
		class="ui-resize-corners__handle"
		:class="`ui-resize-corners__handle_${ corner }`"
		@pointerdown="onStart( $event, corner )"
		@pointermove="onMove"
		@pointerup="onEnd"
		@pointercancel="onEnd"
		@touchstart.stop
		@dblclick.stop
	></div>

</template>

<script lang="ts" setup>
import { resizeByCorner, type ISize, type TCorner } from '@/global/utils/resizeByCorner'

/**
 * Corner handles for proportionally resizing a window with the mouse. Place it
 * inside the window ( which must be `position: relative | absolute | fixed` ):
 * invisible handles with a resize cursor appear in the corners. The component
 * does not set the size itself — it reports the new size and the window applies
 * it as it sees fit ( and, when the left / top corner is dragged, shifts itself
 * so the opposite corner stays put ).
 */

defineOptions( {

	name: 'UiResizeCorners',

} )

interface IProps {
	// Width / height. Unset — the window's ratio when the resize starts.
	ratio?: number
	minHeight: number
	maxWidth: number
	maxHeight: number
	// Handle size, px.
	size: number
}

const props = withDefaults( defineProps<Partial<IProps>>(), {
	ratio:     undefined,
	minHeight: 80,
	maxWidth:  Infinity,
	maxHeight: Infinity,
	size:      14,
} )

const emit = defineEmits<{
	// Drag started: the window's start size and the corner.
	( e: 'start', size: ISize, corner: TCorner ): void
	// New size; `start` is the initial size so the window can shift itself.
	( e: 'resize', size: ISize, start: ISize, corner: TCorner ): void
	( e: 'end' ): void
}>()

const CORNERS: TCorner[] = [ 'tl', 'tr', 'bl', 'br' ]

let active: TCorner | null = null
let start: ISize = { width: 0, height: 0 }
// Ratio locked for the duration of one resize.
let lockedRatio = 1
let originX = 0
let originY = 0

function onStart( e: PointerEvent, corner: TCorner ): void {

	if ( e.button !== 0 ) return

	// preventDefault also suppresses compat mousedown: the window won't start dragging.
	e.preventDefault()
	e.stopPropagation()

	const handle = e.currentTarget as HTMLElement
	// The window is whatever contains the handles.
	const rect = handle.parentElement?.getBoundingClientRect()
	if ( !rect ) return

	active  = corner
	start   = { width: rect.width, height: rect.height }
	lockedRatio = props.ratio ?? ( rect.width / rect.height || 1 )
	originX = e.clientX
	originY = e.clientY

	// The cursor may outrun the window — the events are still ours.
	handle.setPointerCapture( e.pointerId )

	emit( 'start', start, corner )

}

function onMove( e: PointerEvent ): void {

	if ( !active ) return

	const size = resizeByCorner( start, e.clientX - originX, e.clientY - originY, active, lockedRatio, {
		minHeight: props.minHeight,
		maxWidth:  props.maxWidth,
		maxHeight: props.maxHeight,
	} )

	emit( 'resize', size, start, active )

}

function onEnd( e: PointerEvent ): void {

	if ( !active ) return

	active = null
	;( e.currentTarget as HTMLElement ).releasePointerCapture?.( e.pointerId )

	emit( 'end' )

}
</script>

<style lang="scss" scoped>
.ui-resize-corners__handle {

	position: absolute;
	z-index: 20;

	width: calc( v-bind( size ) * 1px );
	height: calc( v-bind( size ) * 1px );

	touch-action: none;

	&_tl { top: 0;    left: 0;  cursor: nwse-resize; }
	&_br { bottom: 0; right: 0; cursor: nwse-resize; }
	&_tr { top: 0;    right: 0; cursor: nesw-resize; }
	&_bl { bottom: 0; left: 0;  cursor: nesw-resize; }

}
</style>

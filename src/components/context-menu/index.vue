<template>

	<Teleport v-if="hasBeenShown" to="body">

		<ui-transition

			v-model="value"

			v-bind:on-enter="animation.onEnter"
			v-bind:on-leave="animation.onLeave"

			:duration="300"

		>

			<div
				ref="context"
				v-bind="mainAttrs"
				:style="positionStyle"
			>

				<slot v-bind="{ on }"></slot>

			</div>

		</ui-transition>

	</Teleport>

</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useWindowSize, useElementBounding, onClickOutside } from '@vueuse/core'
import { useBem } from '@/composables/useBem'
import { useFormat } from '@/composables/useFormat'
import { useEscapeLayer } from '@/composables/useEscapeLayer'
import { getAnimation, animationWaiting, type TAnimation } from '../menu/animations/animation'

interface IProps {

	theme: 'auto' | 'light' | 'dark';
	namespace: string
	x:         string | number
	y:         string | number
	offset:    string | number
	fixed:     boolean
	zIndex:    string | number
	animation: TAnimation
	/** Closes on Esc ( via the shared layer stack ). */
	escapable: boolean
}

defineOptions( {

	name: 'UiContextMenu',
	inheritAttrs: false,

} )

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	x:         0,
	y:         0,
	offset:    0,
	fixed:     false,
	zIndex:    1000,
	animation: 'slide',
	escapable: true,

} )

const value = defineModel<boolean>( { default: false } )

useEscapeLayer( value, () => { value.value = false }, { enabled: () => props.escapable } )

// Lazy-mount the Teleport on first open, same trick as ui-menu — avoids
// littering <body> with empty wrappers if the menu is never invoked.
const hasBeenShown = ref<boolean>( false )

watch( value, ( v ) => { if ( v ) hasBeenShown.value = true } )

const { parseValue } = useFormat()

const { width: windowWidth, height: windowHeight } = useWindowSize()

const context = ref<HTMLElement | null>( null )
const { width: contextWidth, height: contextHeight } = useElementBounding( context )

// Submenus ( ui-submenu ) are teleported to body and so read as "outside" the
// menu; without this exception a click on a submenu item would close the menu
// before the item fires.
onClickOutside( context, () => { value.value = false }, { ignore: [ '.ui-submenu__card' ] } )

// ── Offset (CSS-margin-like) ────────────────────────────────────────────────

interface ISides {
	top:    number
	right:  number
	bottom: number
	left:   number
}

function toNumber ( v: string | number ): number {

	if ( typeof v === 'number' ) return v
	const parsed = parseFloat( parseValue( v ).toString() )
	return Number.isNaN( parsed ) ? 0 : parsed

}

function parseOffset ( input: string | number ): ISides {

	if ( typeof input === 'number' ) {
		return { top: input, right: input, bottom: input, left: input }
	}

	const tokens = String( input ).trim().split( /\s+/ ).filter( Boolean )
	const parsed = tokens.map( toNumber )

	// Each case below only reads indices its own `length` guarantees, so the
	// 0 fallback is unreachable — it exists to satisfy the indexed access.
	const at = ( i: number ): number => parsed[i] ?? 0

	switch ( parsed.length ) {
		case 0:  return { top: 0,         right: 0,         bottom: 0,         left: 0         }
		case 1:  return { top: at( 0 ), right: at( 0 ), bottom: at( 0 ), left: at( 0 ) }
		case 2:  return { top: at( 0 ), right: at( 1 ), bottom: at( 0 ), left: at( 1 ) }
		case 3:  return { top: at( 0 ), right: at( 1 ), bottom: at( 2 ), left: at( 1 ) }
		default: return { top: at( 0 ), right: at( 1 ), bottom: at( 2 ), left: at( 3 ) }
	}

}

// ── Computed position ──────────────────────────────────────────────────────

const offsetSides = computed<ISides>( () => parseOffset( props.offset ) )

// Placement uses the tallest height seen while shown. The menu may shrink on
// its own ( e.g. collapsing items while a nested list is expanded ), and
// re-placing by the live height would flip a flipped menu back to the cursor —
// it would jump right under the pointer. Growth is still re-placed: a menu that
// no longer fits must move off the edge. A new open or a new point resets it.
const placementHeight = ref<number>( 0 )

watch( contextHeight, ( h ) => { if ( h > placementHeight.value ) placementHeight.value = h } )
watch( [ value, () => props.x, () => props.y ], () => { placementHeight.value = contextHeight.value || 0 } )

const cursorX = computed<number>( () => toNumber( props.x ) )
const cursorY = computed<number>( () => toNumber( props.y ) )

// Anchor menu's top-left at (x + offset.left, y + offset.top). If that placement
// would overflow the right/bottom edge, flip the menu to the opposite side
// of the cursor (mirror around x/y with the corresponding offset).
const placement = computed<{ left: number; top: number }>( () => {

	const o   = offsetSides.value
	const w   = contextWidth.value  || 0
	const h   = placementHeight.value
	const win = { w: windowWidth.value, h: windowHeight.value }

	let left = cursorX.value + o.left
	let top  = cursorY.value + o.top

	if ( left + w > win.w ) {
		left = cursorX.value - w - o.right
	}
	if ( top + h > win.h ) {
		top = cursorY.value - h - o.bottom
	}

	if ( left < 0 ) left = 0
	if ( top  < 0 ) top  = 0

	return { left, top }

} )

const positionStyle = computed<Record<string, string>>( () => ( {

	position: props.fixed ? 'fixed' : 'absolute',
	left:     `${ placement.value.left }px`,
	top:      `${ placement.value.top  }px`,

} ) )

// ── Animation (reused from ui-menu) ────────────────────────────────────────

const animation = computed( () => animationWaiting(
	getAnimation( props.animation )( { direction: 'bottom-start' } ),
) )

// ── BEM ────────────────────────────────────────────────────────────────────

const namespace = computed( () => props.namespace ?? '' )

const { block } = useBem( 'UiContextMenu' )

const mainClass = computed( () => block.mix( namespace.value ).classify() )

const mainAttrs = computed( () => ( { 'class': mainClass.value } ) )

const on = computed( () => ( { close: () => { value.value = false } } ) )

const zIndex = computed( () => String( props.zIndex ) )

</script>

<style lang="scss" scoped>
.ui-context-menu {

	z-index: v-bind( zIndex );
	max-width: 100dvw;
	max-height: 100dvh;
	box-sizing: border-box;

}
</style>

<template>

	<!--
	-- Toast layer: mount once per app. Renders the toasts raised by showToast()
	-- ( see composables/useToast ), each next to its own anchor ( see placeToast ).
	-- The layer is transparent to the mouse, so clicks and scrolling underneath
	-- keep working.
	-->
	<Teleport to="body" :disabled="!teleport">

		<div v-bind="mainAttrs">

			<TransitionGroup name="ui-toast-layer">

				<ui-toast-layer-item
					v-for="toast in toasts"
					:key="toast.id"
					:toast="toast"
					:theme="theme"
					:gap="gap"
					:margin="margin"
				/>

			</TransitionGroup>

		</div>

	</Teleport>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useToasts } from '@/composables/useToast';
import { useBem } from '@/composables/useBem';
import UiToastLayerItem from './item.vue';

/**
 * Renders toasts raised anywhere via `showToast()` / `showCopyToast()`.
 *
 * ```vue
 * <!-- App.vue — once -->
 * <ui-toast-layer />
 * ```
 * ```ts
 * import { showToast } from 'uiwekit'
 * showToast( { text: 'Saved', type: 'success', anchor: buttonEl } )
 * ```
 */
interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	/** Stacking order of the layer. Default sits above dialogs and menus. */
	zIndex: number | string;
	/** Teleport the layer to `<body>` so no transformed ancestor can trap it. */
	teleport: boolean;
	/** Gap between a toast and its anchor, px. */
	gap: number;
	/** Minimum distance between a toast and the viewport edges, px. */
	margin: number;

};

defineOptions( {

	name: 'UiToastLayer',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	zIndex: 8000,
	teleport: true,
	gap: 8,
	margin: 12,

} );

const { toasts } = useToasts();

const { block } = useBem( 'UiToastLayer' );

const mainAttrs = computed( () => ( {

	'class': block.mix( props.namespace ?? '' ).classify(),
	'style': { 'z-index': String( props.zIndex ) },

} ) );

</script>

<style lang="scss">
// Unscoped: TransitionGroup classes land on the item roots. Everything is
// namespaced under `ui-toast-layer`, so nothing leaks.
.ui-toast-layer {

	position: fixed;
	inset: 0;

	pointer-events: none;

	&__item {

		position: absolute;

	}

	// The toast slides out from its anchor: below — downwards, above — upwards.
	&-enter-active,
	&-leave-active {

		transition: opacity 0.18s ease, transform 0.18s ease;

	}

	&-enter-from,
	&-leave-to {

		opacity: 0;
		transform: translateY( -6px );

	}

	&-enter-from[data-side="above"],
	&-leave-to[data-side="above"] {

		transform: translateY( 6px );

	}

	&-enter-from[data-side="center"],
	&-leave-to[data-side="center"] {

		transform: translateY( 6px ) scale( 0.96 );

	}

}
</style>

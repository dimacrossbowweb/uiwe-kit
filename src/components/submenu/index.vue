<template>

	<ui-menu

		v-model="value"
		:direction="direction"
		:margin="margin"
		:z-index="zIndex"

	>

		<template #activator="{ setRef, onShow, onLeave }">

			<ui-list-item

				:ref="setRef"
				v-bind="itemAttrs"
				@hover="( over: boolean ) => onHover( over, onShow, onLeave )"
				@click="onClick( onShow )"

			>

				<template v-if="slots.prepend" #prepend>

					<slot name="prepend" />

				</template>

				<slot name="label">{{ label }}</slot>

				<template #append>

					<ui-icon

						v-bind="arrowAttrs"
						name="chevron-right"
						size="18"

					/>

				</template>

			</ui-list-item>

		</template>

		<template #content="bind">

			<ui-card

				v-bind="cardAttrs"
				:rounded="rounded"
				:elevation="elevation"

			>

				<slot v-bind="bind" />

			</ui-card>

		</template>

	</ui-menu>

</template>

<script lang="ts" setup>
/**
 * A list item that opens a nested menu to the side — for a ui-list inside a
 * ui-menu. Itself a ui-list-item with a "›" arrow in `append`; the submenu is a
 * ui-menu wrapping a ui-card.
 *
 * Opens on hover after `openDelay` ( so submenus the pointer merely brushes on
 * its way to another item don't flicker ) or immediately on click. Closes once
 * the pointer has left both the item and the submenu.
 *
 * Slots:
 *  - `label` ( or the `label` prop ) — the item caption;
 *  - `prepend` — leading icon, as on ui-list-item;
 *  - default — submenu content, receives `{ on }` from ui-menu:
 *    `on.close()` closes the submenu, `on.closeAll()` the whole menu chain.
 *
 * A click inside a submenu does not close parent menus ( ui-menu tracks its
 * nested popovers ), so an item that completes the choice calls `on.closeAll()`.
 *
 * @example
 * <ui-menu>
 *   <template #activator="…">…</template>
 *   <template #content>
 *     <ui-list>
 *       <ui-list-item @click="…">Item</ui-list-item>
 *       <ui-submenu label="More">
 *         <template #default="{ on }">
 *           <ui-list>
 *             <ui-list-item @click="doB(); on.closeAll()">Item B</ui-list-item>
 *           </ui-list>
 *         </template>
 *       </ui-submenu>
 *     </ui-list>
 *   </template>
 * </ui-menu>
 */
import { computed, onBeforeUnmount, useSlots } from 'vue';
import { useBem } from '@/composables/useBem';
import { type TStrategy } from '../menu/strategies/strategy';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	label: string;
	disabled: boolean;

	/** Side the submenu opens towards. */
	direction: TStrategy;
	/** Gap between the item and the submenu ( px ). */
	margin: string | number;
	/** Hover open delay ( ms ). */
	openDelay: string | number;
	zIndex: string | number;

	rounded: string | number;
	elevation: string | number;

};

defineOptions( {

	name: 'UiSubmenu',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	label: '',
	disabled: false,

	direction: 'right-down',
	margin: 4,
	openDelay: 150,
	zIndex: 100,

	rounded: 12,
	elevation: 2,

} );

const value = defineModel<boolean>( { default: false } );

const slots = useSlots();

const { block, element } = useBem( 'UiSubmenu' );

const itemAttrs = computed( () => ( {

	class: block
		.mix( props.namespace )
		.m( 'open', value.value )
		.classify(),

	disabled: props.disabled,

} ) );

const arrowAttrs = computed( () => ( {

	class: element( 'arrow' ).classify(),

} ) );

const cardAttrs = computed( () => ( {

	class: [ ...element( 'card' ).mix( props.namespace ).classify(), 'px-1', 'py-2' ],

} ) );

let openTimer: ReturnType<typeof setTimeout> | null = null;

function cancelOpen (): void {

	if ( openTimer === null ) return;

	clearTimeout( openTimer );
	openTimer = null;

}

function onHover ( over: boolean, show: () => void, leave: () => void ): void {

	if ( props.disabled ) return;

	cancelOpen();

	if ( over ) {

		const delay = Math.max( 0, +props.openDelay || 0 );

		openTimer = setTimeout( () => {

			openTimer = null;
			show();

		}, delay );

		return;

	}

	leave();

}

function onClick ( show: () => void ): void {

	if ( props.disabled ) return;

	cancelOpen();
	show();

}

onBeforeUnmount( cancelOpen );

</script>

<style lang="scss" scoped>
.ui-submenu {

	&__arrow {

		opacity: .6;

		transition: opacity .15s ease;

	}

	// While the submenu is open the arrow stays lit — it shows whose it is.
	&_open &__arrow {

		opacity: 1;

	}

}
</style>

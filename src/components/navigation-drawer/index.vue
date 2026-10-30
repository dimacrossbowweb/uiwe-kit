<template>

	<div :class="rootClass">

		<template v-if="!!slots.activator">

			<slot
				name="activator"
				:onShow="() => isVisible = true"
				:onHide="() => isVisible = false"
			/>

		</template>

		<!-- Inner mode: ui-expansion in normal flow, no overlay/fixed. -->
		<ui-expansion
			v-if="inner"
			v-model="isVisible"
			:row="isHorizontal"
			:class="expansionClass"
		>

			<div
				ref="innerContent"
				v-bind="contentAttrs"
				:style="innerContentStyle"
			>

				<div
					v-if="!!slots.header"
					v-bind="headerAttrs"
				>

					<slot name="header"></slot>

				</div>

				<div v-bind="bodyAttrs">

					<slot />

				</div>

				<div
					v-if="!!slots.footer"
					v-bind="footerAttrs"
				>

					<slot name="footer"></slot>

				</div>

			</div>

		</ui-expansion>

		<!-- Default mode: fixed-position drawer with overlay. -->
		<div
			v-else
			v-show="isVisibleNow"
			v-bind="mainAttrs"
		>

			<div v-bind="overlayAttrs">

				<slot name="overlay" />

			</div>

			<div
				v-bind="contentAttrs"
				:style="contentStyle"
				ref="content"
			>

				<div
					v-if="!!slots.header"
					v-bind="headerAttrs"
				>

					<slot name="header"></slot>

				</div>

				<div v-bind="bodyAttrs">

					<slot />

				</div>

				<div
					v-if="!!slots.footer"
					v-bind="footerAttrs"
				>

					<slot name="footer"></slot>

				</div>

			</div>

		</div>

	</div>

</template>

<script lang="ts" setup>

	import { ref, computed, useSlots, useTemplateRef, watch, nextTick, type CSSProperties } from 'vue';
	import { useBem } from '@/composables/useBem';
	import { useFormat } from '@/composables/useFormat';
	import { useEscapeLayer } from '@/composables/useEscapeLayer';
	import { onClickOutside } from '@vueuse/core';

	import type { IProps, TAnimationFunction } from './types/props.type';
	import { DIRECTIONS } from './types/direction.type';

	// `TDirection` widens to `string` (DIRECTIONS is declared as `string[]`), but
	// the direction is used as a key into `CSSStyleDeclaration` / `CSSProperties`
	// below, so it has to be re-narrowed to the four physical edges here.
	type TEdge = 'top' | 'bottom' | 'left' | 'right';
	function isEdge ( value: string | undefined ): value is TEdge {

		return value === 'top' || value === 'bottom' || value === 'left' || value === 'right';

	}

	const props = withDefaults( defineProps<Partial<IProps>>(), {

		theme: 'auto',

		namespace: '',
		size: 300,
		direction: 'left',
		zIndex: 1,
		fadeOutDelay: 0,
		inner: false,
		absolute: false,
		escapable: true,
		outsideIgnore: () => [],

		width:     'auto',
		height:    'auto',
		minWidth:  'auto',
		minHeight: 'auto',
		maxWidth:  'auto',
		maxHeight: 'auto',

	} );

	const { parseValue } = useFormat();

	// parseValue rejects CSS-only keywords (`none`, `min-content`, etc.) by
	// throwing, so we let those pass through untouched and only invoke it
	// for actual numeric / length values. `auto` is supported by parseValue
	// itself, so it goes through the normal branch.
	const SIZE_KEYWORDS = new Set( [ 'none', 'min-content', 'max-content', 'fit-content', 'inherit', 'initial', 'unset', 'revert' ] );
	function toSize( v: string | number ): string {

		if ( typeof v === 'string' ) {

			const trimmed = v.trim();
			if ( SIZE_KEYWORDS.has( trimmed ) ) return trimmed;

		}

		return parseValue( v ).toString();

	}

	const namespace = computed( () => props.namespace ?? '' );
	const size = computed( () => Number(props.size) !== Number.NaN ? Number(props.size) : 300 );

	const widthCss     = computed( () => toSize( props.width     ) );
	const heightCss    = computed( () => toSize( props.height    ) );
	const minWidthCss  = computed( () => toSize( props.minWidth  ) );
	const minHeightCss = computed( () => toSize( props.minHeight ) );
	const maxWidthCss  = computed( () => toSize( props.maxWidth  ) );
	const maxHeightCss = computed( () => toSize( props.maxHeight ) );

	const sizeStyle = computed<CSSProperties>( () => ( {

		'width':      widthCss.value,
		'height':     heightCss.value,
		'min-width':  minWidthCss.value,
		'min-height': minHeightCss.value,
		'max-width':  maxWidthCss.value,
		'max-height': maxHeightCss.value,

	} ) );
	const direction = computed<TEdge>( () => {
		const find = DIRECTIONS.find( value => value === props.direction );
		return isEdge( find ) ? find : 'left';
	} );
	const zIndex = computed( () => String(props.zIndex ?? '1') );
	const fadeOutDelay = computed( () => Number(props.fadeOutDelay) );
	const onEnter = computed<TAnimationFunction> ( () => props.onEnter ?? ( (el, done) => {

		if ( direction.value === 'left' || direction.value === 'right' ) {
			el.style.top = '0px';
			el.style.bottom = '0px';
		} else {
			el.style.left = '0px';
			el.style.right = '0px';
		}
		el.style[direction.value] = `${-size.value}px`;

		done();

		nextTick( () => { requestAnimationFrame( () => {

			el.style[direction.value] = '0px';

		}) });

	} ) );
	const onLeave = computed<TAnimationFunction> ( () => props.onLeave ?? ( (el, done) => {

		el.style[direction.value] = `${-size.value}px`;

		setTimeout( done, ( fadeOutDelay.value - 0.1 < 0 ? 0 : fadeOutDelay.value - 0.1) * 1000 );

	} ) );

	const slots = useSlots();

	const content = useTemplateRef<HTMLElement | null> ( 'content' );
	const innerContent = useTemplateRef<HTMLElement | null> ( 'innerContent' );
	const isVisible = defineModel<boolean>( { default: false } );

	useEscapeLayer( isVisible, () => { isVisible.value = false; }, { enabled: () => props.escapable } );

	const inner = computed( () => !!props.inner );
	const absolute = computed( () => !!props.absolute );
	const isHorizontal = computed( () => direction.value === 'left' || direction.value === 'right' );

	const isVisibleNow = ref<boolean>( false );

	const { block, element } = useBem( 'UiNavigationDrawer' );

	// IMPORTANT: rootClass intentionally OMITS the base `ui-navigation-drawer`
	// class. That base class carries `position: fixed; inset: 0` (correct for
	// the inner overlay div in default mode, but wrong for the outer wrapper
	// which exists *always* and would then cover the whole viewport invisibly,
	// swallowing every click on the page). Only the `_inner` modifier goes on
	// the outer wrapper; the base class lives on the inner overlay via
	// `mainAttrs` exclusively.
	const rootClass = computed( () => {

		const c: string[] = [];

		if ( inner.value ) c.push( 'ui-navigation-drawer_inner' );

		if ( namespace.value ) c.push( namespace.value );

		return c;

	} );

	// `_absolute` modifier goes on the inner overlay (where `ui-navigation-drawer`
	// already lives), not the outer wrapper — that way it can actually override
	// the base `position: fixed`. In `inner` mode this branch doesn't render at
	// all so the modifier is suppressed.
	const mainAttrs = computed( () => ( {
		'class': block
			.mix( namespace.value )
			.m( 'absolute', absolute.value && !inner.value )
			.classify(),
		'style': {
			'z-index': zIndex.value,
			...sizeStyle.value,
		},
	} ) );

	const expansionClass = computed( () => element( 'expansion' )
		.mix( namespace.value )
		.m( 'direction', direction.value )
		.classify()
	);

	const innerContentStyle = computed<CSSProperties>( () => {

		const style: CSSProperties = {};

		if ( isHorizontal.value ) {
			style.width  = `${ size.value }px`;
			style.height = '100%';
		} else {
			style.width  = '100%';
			style.height = `${ size.value }px`;
		}

		return { ...style, ...sizeStyle.value };

	} );

	const overlayAttrs = computed( () => ( {
		'class': element('overlay').mix( namespace.value ).classify(),
	} ) );

	const contentAttrs = computed( () => ( {
		'class': element('content').mix( namespace.value ).classify(),
	} ) );

	const contentStyle = computed( () => {

		const style: CSSProperties = {}

		if ( direction.value === 'left' || direction.value === 'right' ) {
			style.width = `${size.value}px`;
			style.top = '0px';
			style.bottom = '0px';
		} else {
			style.height = `${size.value}px`;
			style.left = '0px';
			style.right = '0px';
		}

		// The offset along the slide-in edge ( `left` / `right`… ) is not part of
		// this binding: onEnter / onLeave manage it directly in el.style. If it
		// were bound, any style change — e.g. `size` changing while a column is
		// resized — would overwrite an open panel's 0px with -size and it would
		// slide off the edge as if closed. Before the first open the panel is
		// hidden anyway ( v-show ), and onEnter sets the start offset itself.

		style['--drawer-transition'] = !fadeOutDelay.value ? 'none' : `left ${fadeOutDelay.value}s ease, top ${fadeOutDelay.value}s ease, right ${fadeOutDelay.value}s ease, bottom ${fadeOutDelay.value}s ease`;

		return style;

	} );

	const headerAttrs = computed( () => ( {
		'class': element('header').mix( namespace.value ).classify(),
	} ) );

	const bodyAttrs = computed( () => ( {
		'class': element('body').mix( namespace.value ).classify(),
	} ) );

	const footerAttrs = computed( () => ( {
		'class': element('footer').mix( namespace.value ).classify(),
	} ) );

	watch( isVisible, () => {

		// In inner (ui-expansion) mode the expansion drives the open/close
		// animation; the fixed-overlay enter/leave handlers don't run.
		if ( inner.value ) return;

		// In default mode the content div is always rendered (only `v-show`
		// toggles it), so the ref is set from mount onwards; bail out for the
		// window before mount where there is nothing to animate.
		const el = content.value;
		if ( !el ) return;

		if (isVisible.value)
			onEnter.value( el, () => {isVisibleNow.value = true} );
		else
			onLeave.value( el, () => {isVisibleNow.value = false} );

	} );

	// A getter, not a snapshot: onClickOutside reads it via toValue on every
	// click, so the list may change after mount too.
	const outsideIgnore = { ignore: () => props.outsideIgnore ?? [] };

	onClickOutside( content, () => {

		if ( inner.value ) return;
		isVisible.value = false;

	}, outsideIgnore );

	onClickOutside( innerContent, () => {

		if ( !inner.value || !isVisible.value ) return;
		isVisible.value = false;

	}, outsideIgnore );


</script>

<style lang="scss" scoped>

.ui-navigation-drawer {

	position: fixed;
	inset: 0;

	&_absolute {

		// Scope the overlay to the nearest positioned ancestor instead of the
		// viewport. Default-mode drawer mechanics (overlay slot, slide-in
		// animation, click-outside) are otherwise unchanged.
		position: absolute;

	}

	&_inner {

		display: contents;

		:deep( .ui-expansion ),
		:deep( .ui-expansion__content ) {

			height: 100%;

		}

		.ui-navigation-drawer__content {

			position: static;
			height: 100%;
			transition: none;

		}

	}

	&__overlay {

		position: absolute;
		inset: 0;
		overflow: hidden;

	}

	&__content {

		position: absolute;
		display: flex;
		flex-direction: column;
		transition: var(--drawer-transition);

		box-sizing: border-box;

		overflow: hidden;

	}

	&__header &__footer {

		flex: 0 0 auto;

	}

	&__body {

		flex: 1 1 auto;

		overflow: hidden;

	}
}

</style>

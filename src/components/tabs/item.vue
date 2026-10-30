<template>
	
	<ui-btn v-bind="mainAttrs">

		<slot></slot>

	</ui-btn>

</template>

<script lang="ts" setup>
import { useBem } from '@/composables/useBem';
import { useAttrs, computed } from 'vue';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	selected: boolean;
	plain: boolean;
	underline: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	plain: false,
	underline: false,

} );

const attrs = useAttrs();

const namespace = computed( () => props?.namespace ?? '' );

const selected = computed( () => !!props?.selected );

const plain = computed( () => !!props?.plain );

// Underline is only meaningful when the tab is `plain` (no background fill);
// on a regular button-style tab the bar would look out of place.
const underline = computed( () => !!props?.underline && plain.value );

const color = computed( () => selected?.value ? 'brand' : 'neutral' )

const { element } = useBem( 'UiTabs' );

const mainClass = computed( () => {

	return element( 'item' )
			.mix( namespace.value )
			.m( 'selected', selected.value )
			.m( 'underline', underline.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	'color': color.value,
	'plain': plain.value,

	...attrs,

} ) );

</script>

<style lang="scss" scoped>
.ui-tabs__item {

	$selector: &;

	position: relative;

	&_underline::after {

		// Bottom rail beneath the tab content. Stretches across the full
		// width, follows the button's current text color (which is `brand`
		// when selected, neutral otherwise). Visible only on the selected
		// tab; fades in/out over .4s.
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;

		background-color: currentColor;
		opacity: 0;

		transition: opacity 0.4s ease;
		pointer-events: none;

	}

	&_underline#{ $selector }_selected::after {

		opacity: 1;

	}

}

</style>

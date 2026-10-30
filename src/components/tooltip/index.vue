<template>

	<slot

		v-if="isMobile"
		name="activator"

	></slot>

	<ui-menu
	
		v-if="!isMobile"
		v-bind="mainAttrs"
		
	>

		<template #activator="{ setRef, onShow, onHide, onLeave }">

			<slot

				name="activator"
				:setRef="setRef"
				:onShow="onShow"
				:onHide="onHide"
				:onLeave="onLeave"

			></slot>

		</template>

		<template
		
			v-if="!!slots[ 'card' ]"
			#content
			
		>

			<slot name="card"></slot>
		
		</template>

		<template
		
			v-else
			#content
			
		>

			<ui-card
			
				v-bind="cardAttrs"
				:rounded="12"
				:elevation="4"	
			
			>

				<slot>{{ title }}</slot>

			</ui-card>

		</template>

	</ui-menu>

</template>

<script lang="ts" setup>
import { useAttrs, computed, useSlots, } from 'vue';
import { useBem } from '@/composables/useBem';
import { useMobile } from '@/composables/useMobile';

// Root is a fragment (mobile <slot> + <ui-menu>), so Vue cannot auto-inherit
// fallthrough attrs. They are forwarded manually via mainAttrs instead.
defineOptions( { name: 'UiTooltip', inheritAttrs: false } );

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	title: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	title: 'No title',

} );

const attrs = useAttrs();

const slots = useSlots();

const { isMobile } = useMobile();

const namespace = computed( () => props?.namespace ?? '' );

const title = computed( () => props?.title ?? '' );

const { block, element } = useBem( 'UiTooltip' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	// Default show delay; an explicit delay-start on <ui-tooltip> overrides it
	// since attrs are spread afterwards.
	'delay-start': '0.4s',

	// A tooltip belongs above whatever its activator sits in. ui-menu's own
	// default ( 100 ) put it under every stacked panel-dialog ( 2000+ ), so hints
	// inside dialogs never showed. Kept below the loading overlay ( 9999 ).
	'z-index': 9000,

	// A tooltip lives off hover rather than being opened by the user: if it took
	// a slot in the Esc stack, the first press would dismiss it instead of the
	// dialog underneath.
	'escapable': false,

	...attrs,

} ) );

const cardClass = computed( () => {

	return element( 'card' )
			.mix( namespace.value )
			.classify();

} );

const cardAttrs = computed( () => ( {

	'class': cardClass.value,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

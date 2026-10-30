<template>

	<ui-sheet v-bind="mainAttrs">

		<template v-if="!!slots.header">

			<div v-bind="headerAttrs">

				<slot

					name="header"
					v-bind="{ on }"

				></slot>

			</div>

		</template>

		<div v-bind="contentAttrs">

			<template v-if="!!slots.prepend">

				<div v-bind="prependAttrs">

					<slot name="prepend"></slot>

				</div>

			</template>

			<div v-bind="bodyAttrs">

				<slot></slot>

			</div>

			<template v-if="!!slots.append">

				<div v-bind="appendAttrs">

					<slot name="append"></slot>

				</div>

			</template>			

		</div>

	</ui-sheet>

</template>

<script lang="ts" setup>
import {
	
	computed,
	useAttrs,
	useSlots,

} from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

};

defineOptions( {

	name: 'UiAlert',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const emit = defineEmits( [ 'on-close' ] );

const attrs = useAttrs();

const slots = useSlots();

const namespace = computed( () => props?.namespace ?? '' );

const { block, element } = useBem( 'UiAlert' );

const on = computed( () => ( {

	'close': () => emit( 'on-close' ),

} ) );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

	// `theme` is a declared prop, so it never reaches `attrs` — without naming it
	// here it would stop at the alert instead of reaching <ui-sheet>, which is
	// what actually resolves the colours through useCSSVar( name, theme ).
	'theme': props.theme,

	...attrs,

} ) );

const headerClass = computed( () => {

	return element( 'header' )
			.mix( namespace.value )
			.classify();

} );

const headerAttrs = computed( () => ( {

	'class': headerClass.value,

} ) );

const contentClass = computed( () => {

	return element( 'content' )
			.mix( namespace.value )
			.classify();

} );

const contentAttrs = computed( () => ( {

	'class': contentClass.value,

} ) );

const prependClass = computed( () => {

	return element( 'prepend' )
			.mix( namespace.value )
			.classify();

} );

const prependAttrs = computed( () => ( {

	'class': prependClass.value,

} ) );

const bodyClass = computed( () => {

	return element( 'body' )
			.mix( namespace.value )
			.classify();

} );

const bodyAttrs = computed( () => ( {

	'class': bodyClass.value,

} ) );

const appendClass = computed( () => {

	return element( 'append' )
			.mix( namespace.value )
			.classify();

} );

const appendAttrs = computed( () => ( {

	'class': appendClass.value,

} ) );

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

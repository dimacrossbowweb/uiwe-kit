<template>
	
	<ui-card
	
		v-bind="mainAttrs"
		rounded="12"
		elevation="0"

	>

		<ui-card-item 

			ref="grid"
			v-bind:class="bodyClass"
			
		>

			<ui-calendar-grid-years
			
				v-if="index === 0"
				v-model="value"
				@click-year="onClickYear"
			
			/>

			<ui-calendar-grid-months
			
				v-if="index === 1"
				v-model="value"
				@click-month="onClickMonth"
				v-bind="props.monthsShort ? { months: props.monthsShort } : {}"

			/>

			<ui-calendar-grid-days
			
				v-if="index === 2"
				v-model="value"
				@click-month="index = 1"
				@click-year="index = 0"
				v-bind="daysLabels"
			
			/>

		</ui-card-item>

	</ui-card>

</template>

<script lang="ts" setup>
import {
	
	ref,
	computed,

} from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	elevation: string | number;
	height: string | number;
	maxHeight: string | number;
	minHeight: string | number;
	width: string | number;
	maxWidth: string | number;
	minWidth: string | number;
	switched: boolean;

	/**
	 * Label overrides forwarded to the grids ( English by default ). Callers
	 * localise them, e.g. `:months="tm( 'ui.months' )"`.
	 *  - `weekDays`    — short weekday labels, Monday first;
	 *  - `months`      — full month names, January first;
	 *  - `monthsShort` — short month names, January first.
	 */
	weekDays: string[];
	months: string[];
	monthsShort: string[];

};

defineOptions( {

	name: 'UiCalendar',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	elevation: 2,
	height: 'auto',
	maxHeight: 'auto',
	minHeight: 'auto',
	width: 'auto',
	maxWidth: 'auto',
	minWidth: 'auto',
	switched: false,

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const value = defineModel( { default: new Date() } );

const index = ref<number>( 2 );

const { block, element } = useBem( 'UiCalendar' );

const mainClass = computed( () => {

	return block
			.mix( 'pa-2' )
			.classify();

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,

	theme: props.theme,

	namespace: namespace.value,
	elevation: props.elevation,
	height: props.height,
	maxHeight: props.maxHeight,
	minHeight: props.minHeight,
	width: props.width,
	maxWidth: props.maxWidth,
	minWidth: props.minWidth,

} ) );

// Only pass the overrides that were set, so the grids keep their own defaults.
const daysLabels = computed( () => ( {

	...( props.weekDays ? { weekDays: props.weekDays } : {} ),
	...( props.months ? { months: props.months } : {} ),

} ) );

const bodyClass = computed( () => {

	return element( 'body' )
			.classify();

} );

function onClickYear (): void {

	index.value = 2;

}

function onClickMonth (): void {

	index.value = 2;

}

</script>

<style lang="scss" scoped>
@use './styles.scss' as *;

</style>

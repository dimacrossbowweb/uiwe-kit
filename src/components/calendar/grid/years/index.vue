<template>

	<div @wheel="onWheel">

		<div v-bind:class="toolsClass">

			<h3 v-bind:class="periodClass">{{ period }}</h3>

			<ui-spacer />

			<ui-tool-btn

				@click="onPrevDecade"
				view="text"

			>
		
				<ui-icon

					name="angle-up"
					size="28"

				></ui-icon>
		
			</ui-tool-btn>

			<ui-tool-btn

				@click="onNextDecade"
				view="text"

			>
		
				<ui-icon

					name="angle-down"
					size="28"

				></ui-icon>
		
			</ui-tool-btn>

		</div>

		<div 
		
			ref="grid"
			v-bind:class="gridClass"
			
		>

			<div

				v-for=" yr in years "
				:key="yr"
				@click="onClickYear( yr )"
				v-bind:class="itemClass( yr )"
				plain
				rounded="0"

			>

				<span v-bind:class="textClass( yr )">
					
					{{ yr }}

				</span>
		
			</div>

		</div>

	</div>

</template>

<script lang="ts" setup>
import moment from 'moment';
import {
	
	computed,
	ref,
	watchEffect,

} from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

};

defineOptions( {

	name: 'UiCalendarGridYears',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

} );

const grid = ref( null );

const formattedDateValue = computed( () => ( value: number ) => value < 10 ? `0${ value }` : value );

const emit = defineEmits( [

	'click-year',

] );

const value = defineModel( { default: new Date() } );

const workingValue = ref<Date>( new Date() );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const year = computed( () => moment.utc( workingValue.value ).year() );
const month = computed( () => moment.utc( workingValue.value ).month() );
const date = computed( () => moment.utc( workingValue.value ).date() );

watchEffect( () => {

	if ( value.value ) {

		workingValue.value = value.value;

	}

} );

const { block, element } = useBem( 'UiCalendarGridYears' );

const startYear = computed( () => Math.floor( year.value / 10 ) * 10 );

const period = computed( () => `${ startYear.value } - ${ startYear.value + 9 }` );

const years = computed( () => {

	const array = Array.from( { length: 16 }, () => 0 );

	const startYearPosition = startYear.value % 4 + 1;

	const firstYear = startYear.value - startYearPosition + 1;

	for ( let i = 0; i < array.length; i++ ) {

		array[ i ] = firstYear + i;

	}

	return array;

} );

const gridClass = computed(() => {

	return block
			.mix( namespace.value )
			.classify();	

} );

const toolsClass = computed(() => {

	return useBem( 'UiCalendarTools' )
			.block
			.mix( namespace.value )
			.mix( 'mx-4' )
			.classify();

} );

const periodClass = computed(() => {

	return element( 'period' )
			.mix( 'py-0' )
			.classify();	

} );

const itemClass = computed(() => ( yr: number ) => {

	const year = moment.utc( value.value ).year();

	return element( 'item' )
			.m( 'selected', yr === year )
			.classify();	

} );

const textClass = computed(() => ( yr: number ) => {

	const year = moment.utc( value.value ).year();

	return useBem( 'UiCalendarText' )
			.block
			.m( 'selected', yr === year )
			.classify();

} );

function onClickYear( year: number ): void {

	const daysInMonth = moment.utc( `${ year }-${ formattedDateValue.value( month.value + 1 ) }` ).daysInMonth();

	const normDate = date.value > daysInMonth ? daysInMonth : date.value;

	value.value = moment.utc( `${ year }-${ formattedDateValue.value( month.value + 1 ) }-${ formattedDateValue.value( normDate ) }` ).toDate();

	emit( 'click-year' );

}

function onPrevDecade(): void {

	workingValue.value = moment.utc( workingValue.value ).subtract( 10, 'year' ).toDate();

}

function onNextDecade(): void {

	workingValue.value = moment.utc( workingValue.value ).add( 10, 'year' ).toDate();

}

function onWheel( event: WheelEvent ): void {

	if ( event.deltaY > 0 ) {

		onNextDecade();

	} else {

		onPrevDecade();

	}

	event.preventDefault();

}

</script>

<style lang="scss" scoped>
@use '../../styles.scss';

.ui-calendar-grid-years {

	position: relative;

	display: grid;
	grid-template-columns: repeat( 4, 1fr );
	grid-template-rows: repeat( 4, auto );

	column-gap: 4px;
	row-gap: 4px;

	padding: 0px;

	overflow: hidden;

	&__period {

		color: var( --ui-text-primary );

	}

	&__item {

		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
		
		box-sizing: border-box;
		
		cursor: pointer;

		transition: transform .3s;

		color: var( --ui-text-primary );

		background-color: var( --ui-card );

		background-clip: content-box;

		color: var( --ui-text-primary )!important;

		border: 2px solid var( --ui-card );

		padding: 2px;

		width: 96px;
		height: 96px;

		aspect-ratio: 1/1;

		z-index: 1;

		border-radius: 4px;

		&:hover {

			color: var( --ui-text-primary );

			border: 2px solid var( --ui-text-primary );

		}

		&_selected {

			color: var( --ui-text-primary )!important;

			border: 2px solid var( --ui-brand );

		}

	}

}

</style>

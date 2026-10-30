<template>

	<div
	
		@wheel="onWheel"
		v-bind:class="mainClass"
		
	>

		<div v-bind:class="toolsClass">

			<ui-btn

				@click="onPrevMonth"
				icon
				icon-name="chevron-left"
				rounded="100%"
				plain

			></ui-btn>

			<div class="d-flex items-center gap-2">

				<a

					@click="onClickMonth"
					v-bind:class="linkClass"

				>
			
					{{ currentMonth }}
			
				</a>

				<a

					@click="onClickYear"
					v-bind:class="linkClass"

				>
			
					{{ year }}
			
				</a>

			</div>

			<ui-btn

				@click="onNextMonth"
				icon
				icon-name="chevron-right"
				rounded="100%"
				plain

			></ui-btn>

		</div>

		<div v-bind:class="daysListClass">

			<a

				v-for=" day in props.weekDays "
				:key="day"
				icon
				v-bind:class="columnClass"

			>
		
				{{ day }}
		
			</a>

		</div>

		<div

			ref="grid"	
			v-bind:class="gridClass"
			
		>

			<template
			
				v-for=" ( date, i ) in dates "
				:key="i"
			
			>

				<a

					v-if="!!date"
					@click="onClickDate( date )"
					v-bind:class="itemClass( date )"

				>

					{{ dayValue( date ) }}
			
				</a>

				<a

					v-else
					v-bind:class="itemClass( date )"

				>

					{{ dayValue( date ) }}
			
				</a>

			</template>

		</div>

	</div>

</template>

<script lang="ts" setup>
import moment from 'moment';
import {
	
	ref,
	watchEffect,
	computed,

} from 'vue';
import { useBem } from '@/composables/useBem';
import {

	weekDaysShort,
	months,

} from '../../const';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	/**
	 * Short weekday labels, Monday first. English by default — callers
	 * localise them themselves, e.g. `:week-days="tm( 'ui.weekDaysShort' )"`.
	 */
	weekDays: string[];

	/** Full month names, January first. English by default, localised by the caller. */
	months: string[];

};

interface IDayInfo {
  
	date: number;
	month: number;
	year: number;
	isWeekend: boolean;

}

defineOptions( {

	name: 'UiCalendarGridDays',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

	weekDays: () => [ ...weekDaysShort ],
	months: () => [ ...months ],

} );

const emit = defineEmits( [

	'click-month',
	'click-year',

] );

const grid = ref( null ); 

const value = defineModel( { default: new Date() } );

const workingValue = ref<Date>( new Date() );

watchEffect( () => {

	if ( value.value ) {

		workingValue.value = value.value;

	}

} );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const year = computed( () => moment.utc( workingValue.value ).year() );
const month = computed( () => moment.utc( workingValue.value ).month() );

const currentMonth = computed( () => props.months[ month.value ] );

const daysInMonth = computed( () => moment.utc( workingValue.value ).daysInMonth() );

const dates = computed( () => {

	let firstDay: number = moment.utc( workingValue.value ).startOf( 'month' ).day();
	const endDay: number = moment.utc( workingValue.value ).endOf( 'month' ).day();

	firstDay = firstDay === 0 ? 7 : firstDay;

	const firstDaysLeft: number = 7 - firstDay + 1;

	const weeks: number = ( daysInMonth.value - firstDaysLeft - endDay ) / 7 + 2;

	const array: ( IDayInfo | null )[] = Array.from( { length: weeks * 7 }, () => null );

	for ( let index = firstDay - 1, date = 1; date <= daysInMonth.value; index++, date++ ) {

		array[ index ] = {

			date,
			month: month.value,
			year: year.value,

			/**
			 * @todo make it cooler
			 */
			isWeekend: ( firstDay + date ) % 7 === 0 || ( firstDay + date - 1 ) % 7 === 0,

		};

	}

	return array;

} );

const dayValue = computed( () => ( date: ( IDayInfo | null ) ) => date?.date || '' );

const formattedDateValue = computed( () => ( value: number ) => value < 10 ? `0${ value }` : value );

const isHoverable = computed( () => ( dt: ( IDayInfo | null ) ) => !!dt );

const isDateWeekend = computed( () => ( dt: ( IDayInfo | null ) ) => !!dt?.isWeekend );

const isDateSelected = computed( () => ( dt: ( IDayInfo | null ) ) => {

	const year = moment.utc( value.value ).year();
	const month = moment.utc( value.value ).month();
	const date = moment.utc( value.value ).date();

	return dt?.date === date &&
		   dt?.month === month &&
		   dt?.year === year

} );

const mainClass = computed( () => {

	return useBem( 'UiCalendarContainer' )
			.block
			.mix( namespace.value )
			.classify();

} );

const toolsClass = computed( () => {

	return useBem( 'UiCalendarTools' )
			.block
			.mix( namespace.value )
			.classify();

} );

const linkClass = computed( () => {

	return useBem( 'UiCalendarLink' )
			.block
			.mix( namespace.value )
			.mix( 'text-uppercase' )
			.classify();

} );

const daysListClass = computed( () => {

	return useBem( 'UiCalendarGridDaysList' )
			.block
			.mix( namespace.value )
			.classify();

} );


const gridClass = computed( () => {

	return useBem( 'UiCalendarGridDays' )
			.block
			.mix( namespace.value )
			.classify();

} );

const columnClass = computed( () => {

	return useBem( 'UiCalendarGridDays' )
			.element( 'column' )
			.classify();

} );

const itemClass = computed( () => ( date: ( IDayInfo | null ) ) => {

	return useBem( 'UiCalendarGridDays' )
			.element( 'item' )
			.m( 'hoverable', isHoverable.value( date ) )
			.m( 'selected', isDateSelected.value( date ) )
			.m( 'weekend', isDateWeekend.value( date ) )
			.classify();

} );

function onPrevMonth(): void {

	workingValue.value = moment.utc( workingValue.value ).subtract( 1, 'month' ).toDate();

}

function onClickMonth(): void {

	emit( 'click-month' );

}

function onClickYear(): void {

	emit( 'click-year' );

}

function onNextMonth(): void {

	workingValue.value = moment.utc( workingValue.value ).add( 1, 'month' ).toDate();

}

function onClickDate( date: IDayInfo ): void {

	value.value = moment.utc( `${ date.year }-${ formattedDateValue.value( date.month + 1 ) }-${ formattedDateValue.value( date.date ) }` ).toDate();

}

function onWheel( event: WheelEvent ): void {

	if ( event.deltaY > 0 ) {

		onNextMonth();

	} else {

		onPrevMonth();

	}

	event.preventDefault();

}

</script>

<style lang="scss" scoped>
@use '../../styles.scss';

.ui-calendar-grid-days-list {

	position: relative;

	display: grid;
	grid-template-columns: repeat( 7, 1fr );
	grid-template-rows: auto;
	column-gap: 0px;
	row-gap: 0px;

	padding: 0px;

	overflow: hidden;

}

.ui-calendar-grid-days {

	$selector: &;

	position: relative;

	display: grid;
	grid-template-columns: repeat( 7, 1fr );
	grid-template-rows: auto;
	column-gap: 4px;
	row-gap: 4px;

	padding: 0px;

	overflow: hidden;

	&__column {

		display: flex;
		justify-content: center;
		align-items: center;
		color: var( --ui-text-primary );

		padding: 2px;

		width: 56px;
		height: 56px;

		aspect-ratio: 1/1;

		font-size: 14px;

		background-color: var( --ui-card );

	}

	&__item {		

		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
		
		box-sizing: border-box;

		color: var( --ui-text-primary );

		padding: 2px;

		width: 56px;
		height: 56px;

		aspect-ratio: 1/1;

		font-size: 14px;

		outline: 1px solid transparent;

		background-color: var( --ui-card );

		border: 2px solid var( --ui-card );

		border-radius: 4px;

		z-index: 1;

		&_hoverable {

			transition: all .3s;

			cursor: pointer;

			&:not( #{ $selector }__item_selected ):hover {

				color: var( --ui-text-primary );

				border: 2px solid var( --ui-text-primary );

			}

		}

		&_weekend {

			color: var( --ui-negative );

		}

		&_selected {

			color: var( --ui-text-primary );

			border: 2px solid var( --ui-brand );

		}

	}

}

</style>

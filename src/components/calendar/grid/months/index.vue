<template>

	<div
	
		ref="grid"
		v-bind:class="mainClass"
		
	>

		<div

			v-for=" ( month, i ) in months "
			:key="month"
			@click="onClickMonth( i )"
			v-bind:class="itemClass( i )"
			plain
			rounded="0"

		>

			{{ month }}
	
		</div>

	</div>

</template>

<script lang="ts" setup>
import moment from 'moment';
import { ref, computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	/**
	 * Short month labels, January first.
	 *
	 * This was `tm( 'ui.monthsShort' )`, which made the component depend on
	 * vue-i18n being installed with that exact key present — a hard coupling a
	 * library cannot make. It is a plain prop now, so callers localise it
	 * themselves: `:months="tm( 'ui.monthsShort' )"`.
	 */
	months: string[];

};

defineOptions( {

	name: 'UiCalendarGridMonths',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',

	months: () => [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],

} );

const grid = ref( null );

const { block, element } = useBem( 'UiCalendarGridMonths' );

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const year = computed( () => moment.utc( value.value ).year() );
const month = computed( () => moment.utc( value.value ).month() );
const date = computed( () => moment.utc( value.value ).date() );

const emit = defineEmits( [

	'click-month',

] );

const months = computed<string[]>( () => props.months );

const value = defineModel( { default: new Date() } );

const formattedDateValue = computed( () => ( value: number ) => value < 10 ? `0${ value }` : value );

const mainClass = computed(() => {

	return block
			.mix( namespace.value )
			.classify();	

} );

const itemClass = computed(() => ( currentMonth: number ) => {

	return element( 'item' )
			.m( 'selected', currentMonth === month.value )
			.classify();

} );

function onClickMonth( month: number ): void {

	const daysInMonth = moment.utc( `${ year.value }-${ formattedDateValue.value( month + 1 ) }` ).daysInMonth();

	const normDate = date.value > daysInMonth ? daysInMonth : date.value;

	value.value = moment.utc( `${ year.value }-${ formattedDateValue.value( month + 1 ) }-${ formattedDateValue.value( normDate ) }` ).toDate();

	emit( 'click-month' );

}

</script>

<style lang="scss" scoped>
@use '../../styles.scss';

.ui-calendar-grid-months {

	$selector: &;

	position: relative;

	display: grid;
	grid-template-columns: repeat( 4, 1fr );
	grid-template-rows: repeat( 3, auto );

	column-gap: 4px;
	row-gap: 4px;

	padding: 0px;

	// aspect-ratio: 1/1;

	&__item {

		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
		
		box-sizing: border-box;
		
		cursor: pointer;

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

		transition: all .4s ease-in-out;

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

<template>

	<div v-bind="mainAttrs">

		<div
		
			v-for="( color, i ) in colors"
			:key="i"

			v-bind="pickAttrs"
			:style="{

				'background-color': color,

			}"
			
		></div>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	size: string | number;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	size: 24,

} );

const colors = ref( [

	'lighgreen', 'lightcyan', 'pink', 'red', 'primary', 'accent'

] );

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const size = computed( () => parseValue( props?.size ).toString() );

const { block, element } = useBem( 'UiColorList' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const pickClass = computed( () => {

	return element( 'pick' )
			.mix( namespace.value )
			.classify();

} );

const pickAttrs = computed( () => ( {

	'class': pickClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-color-list {

	display: flex;
	gap: 8px;
	align-items: center;

	&__pick {

		width: v-bind( size );
		height: v-bind( size );

		box-sizing: border-box;

		border-radius: 50%;

		box-shadow: 0 2px 10px #00000099;

		background-color: lightgreen;

		cursor: pointer;

		transition: all .3s;

		&:hover {

			box-shadow: 0 2px 10px currentColor;

			transform: scale( 1.1 );

		}

	}

}

</style>

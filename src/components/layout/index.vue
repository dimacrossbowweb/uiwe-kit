<template>
	
	<div v-bind="mainAttrs">

		<slot></slot>

	</div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	height: string | number,
	width: string | number,
	column: boolean,
	fillHeight: boolean;
	noOverflow: boolean;

};

const props = withDefaults(defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	height: 'auto',
	width: '100%',
	column: false,
	fillHeight: false,
	noOverflow: false,

} );

const { block } = useBem( 'UiLayout' );

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const height = computed( () => props?.fillHeight ? '100%' : parseValue( props?.height ).toString() );
const width = computed( () => parseValue( props?.width ).toString() );
const column = computed( () => !!props?.column );
const noOverflow = computed( () => !!props?.noOverflow );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'column', column.value )
			.m( 'overflow', noOverflow.value ? 'disable' : false )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-layout {

	position: relative;

	width: v-bind( width );
	height: v-bind( height );

	box-sizing: border-box;

	&_column {

		flex-direction: column;

		.ui-flex {

			width: 100%;

		}

	}

	&_overflow {

		&_disable {

			overflow: hidden;

		}

	}

}

</style>

<template>

    <ui-menu v-bind="mainAttrs">

		<template #activator="{ setRef, onShow }">

			<ui-input-date

                v-model="value"
				@click="onShow"
				type="date"
				:ref="setRef"

			></ui-input-date>

        </template>

		<template #content>

			<ui-calendar
			
				v-model="value"
			
			/>

		</template>

    </ui-menu>

</template>

<script lang="ts" setup>
import { ref, computed, } from 'vue';
import { type TStrategy } from '../menu/strategies/strategy';
import { useBem } from '@/composables/useBem';
import { useDate } from '@/composables/useDate';

const { formatDateOnlyToUtc } = useDate();

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    modelValue: string | number | Date;
	direction: TStrategy;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
	direction: 'bottom-start',

} );

const emit = defineEmits( [ 
	
	'update:modelValue', 
	'keydown',
	'keyup',
	'input',
	'paste',

] );

const fakeValue = ref<string | number | Date>( new Date() );

const value = computed ( {

	get () {

		return formatDateOnlyToUtc( props.modelValue === undefined ? fakeValue.value : props.modelValue );

	},

	set ( val ) {

		if ( props.modelValue === undefined ) {

			fakeValue.value = val;

		}

		if ( props.modelValue !== undefined ) {

			emit( 'update:modelValue', val );

		}

	}

} );

const namespace = computed( () => props?.namespace ?? '' );
const direction = computed( () => props?.direction ?? 'bottom-start' );

const { block } = useBem( 'UiDatePicker' );

const mainClass = computed( () => {

	return block
				.mix( namespace.value )
				.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,
	'direction': direction.value,

} ) );

</script>

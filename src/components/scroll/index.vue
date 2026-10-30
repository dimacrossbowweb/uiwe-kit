<template>

	<div
	
		ref="scrollRef"
		v-bind="mainAttrs"
		@scroll="onScroll"

	>

		<slot></slot>

	</div>

</template>

<script lang="ts" setup>
import {
	
	ref,
	computed,
	watch,
	onMounted,
	nextTick,

} from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;

	width: string | number;

	height: string | number;

	scrollX: number;
	scrollY: number;

	lockY: boolean;
	lockX: boolean;

};

interface IEmits {

	(e: 'update:scrollX', value: number): void;
	(e: 'update:scrollY', value: number): void;

}

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	width: 'auto',
	height: 'auto',
	scrollX: 0,
	scrollY: 0,
	lockY: false,
	lockX: false,

} );

const scrollRef = ref<HTMLDivElement | null>(null);

const emit = defineEmits<IEmits>();

const { parseValue } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );

const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );

const lockX = computed( () => !!props?.lockX );
const lockY = computed( () => !!props?.lockY );

const { block } = useBem( 'UiScroll' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'locked-x', lockX.value )
			.m( 'locked-y', lockY.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const onScroll = () => {
	if (!scrollRef.value) return;
	const { scrollLeft, scrollTop } = scrollRef.value;
	if (!lockX.value) {
		emit('update:scrollX', scrollLeft);
	}
	if (!lockY.value) {
		emit('update:scrollY', scrollTop);
	}
};

watch(
	() => [props.scrollX, props.scrollY, lockX.value, lockY.value],
	() => {
		if (!scrollRef.value) return;
		scrollRef.value.scrollTo({
			left: lockX.value ? scrollRef.value.scrollLeft : props.scrollX,
			top: lockY.value ? scrollRef.value.scrollTop : props.scrollY,
			behavior: 'auto',
		});
	},
	{ immediate: true }
);

onMounted(() => {
	nextTick(() => {
		if (!scrollRef.value) return;

		const left = lockX.value ? 0 : props.scrollX;
		const top = lockY.value ? 0 : props.scrollY;

		scrollRef.value.scrollTo({ left, top });
	});
});

</script>

<style lang="scss" scoped>
.ui-scroll {

	width: v-bind( width );
	height: v-bind( height );

	overflow-x: auto;
	overflow-y: auto;

	// The scrollbar look is global ( styles/_scrollbar.scss ).

	&_locked-x {

		overflow-x: hidden!important;

	}

	&_locked-y {

		overflow-y: hidden!important;

	}

}

</style>

<template>

	<div v-bind="mainAttrs">

		<slot/>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	reverse: boolean;
	xs: string | number;
	sm: string | number;
	md: string | number;
	lg: string | number;
	xl: string | number;
	xxl: string | number;
	xsOffset: string | number;
	smOffset: string | number;
	mdOffset: string | number;
	lgOffset: string | number;
	xlOffset: string | number;
	xxlOffset: string | number;
	first: string;
	last: string;

};

defineOptions( {

	name: 'UiCol',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	reverse: false,

} );

const reverse = computed( () => !!props?.reverse );

const xs = computed( () => props.xs );
const sm = computed( () => props.sm );
const md = computed( () => props.md );
const lg = computed( () => props.lg );
const xl = computed( () => props.xl );
const xxl = computed( () => props.xxl );

const xsOffset = computed( () => props.xsOffset );
const smOffset = computed( () => props.smOffset );
const mdOffset = computed( () => props.mdOffset );
const lgOffset = computed( () => props.lgOffset );
const xlOffset = computed( () => props.xlOffset );
const xxlOffset = computed( () => props.xxlOffset );

const first = computed( () => props?.first ? props.first : 'xs' );
const last = computed( () => props?.last ? props.last : 'xs' );

const { block } = useBem( 'UiCol' );

const hasBreakpoint = computed( () => [ 
	'xs', 'sm', 'md', 'lg', 'xl', 'xxl',
].find( key => !!props[ key as keyof IProps ] ) );

const mainClass = computed( () => {

	if ( !hasBreakpoint.value ) {

		return block
				.m( 'reverse', reverse.value )
				
				.m( 'xs', xs.value )
				.m( 'sm', sm.value )
				.m( 'md', md.value )
				.m( 'lg', lg.value )
				.m( 'xl', xl.value )
				.m( 'xxl', xxl.value )

				.m( 'xs_offset', xsOffset.value )
				.m( 'sm_offset', smOffset.value )
				.m( 'md_offset', mdOffset.value )
				.m( 'lg_offset', lgOffset.value )
				.m( 'xl_offset', xlOffset.value )
				.m( 'xxl_offset', xxlOffset.value )

				.m( 'first', first.value )
				.m( 'last', last.value )

				.classify();

	}

	return '';

} );

const mainAttrs = computed( () => ( {

	class: mainClass.value,	

} ) );

</script>

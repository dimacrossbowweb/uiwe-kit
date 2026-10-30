<template>
	
	<div
	
		ref="uploader"
		v-bind="mainAttrs"
		
	>
	
		<slot
		
			name="activator"
			v-bind="{ on }"
			
		></slot>

		<div v-bind="coverAttrs">

			<slot>

				<ui-icon
					:name="icon"
					size="2.2em"
					color="text-primary"
				/>

			</slot>

		</div>

		<input

			ref="file"
			@change="onFileSelect"
			v-bind="inputAttrs"
			type="file" />

	</div>

</template>

<script lang="ts" setup>
import {

	ref,
	computed,
	onMounted,
	nextTick,

} from 'vue';
import { useBem } from '@/composables/useBem';

import { useDropZone } from '@vueuse/core';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	block: boolean;
	icon: string;
	instant: boolean;

};

defineOptions( {

	name: 'UiUploader',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	block: false,
	icon: 'upload-circle-outline',
	instant: false,

} );

const emit = defineEmits( [ 'click', 'change' ] );

const namespace = computed( () => props?.namespace ?? '' );
const isBlock = computed( () => !!props?.block );
const icon = computed( () => props?.icon ?? 'upload-circle-outline' );
const isInstant = computed( () => props?.instant );

const uploader = ref<HTMLElement | null>( null );
const file     = ref<HTMLInputElement | null>( null );

const isDropIn = ref<boolean>( false );

// Activator's border-radius — mirrored onto the uploader root so the
// clipping shape (and cover) follow whatever rounded container the consumer
// passed (e.g. a circular ui-avatar). Read once after mount; sufficient for
// the common case where radius is set via static CSS / props.
const activatorRadius = ref<string>( '0' );

onMounted( () => {

	nextTick( () => {

		const root = uploader.value;
		if ( !root ) return;

		const child = Array.from( root.children ).find( ( c: Element ) =>
			!c.classList.contains( 'ui-uploader__cover' ) &&
			!c.classList.contains( 'ui-uploader__input' )
		) as HTMLElement | undefined;

		if ( !child ) return;

		activatorRadius.value = window.getComputedStyle( child ).borderRadius || '0';

	} );

} );

useDropZone( uploader, {

	onDrop,
	onEnter,
	onLeave,

	dataTypes: [ 'image/jpeg' ],
	multiple: true,
	preventDefaultForUnhandled: false,

} );

const { block, element } = useBem( 'UiUploader' )

const on = computed ( (): any => {

	return {

		'click': () => onUploaderClick(),

	};

} );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'block', isBlock.value )
			.m( 'dropin', isDropIn.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const coverClass = computed( () => {

	return element( 'cover' )
			.mix( namespace.value )
			.classify();

} );

const coverAttrs = computed( () => ( {

	'class': coverClass.value,

} ) );

const inputClass = computed( () => {

	return element( 'input' )
			.mix( namespace.value )
			.classify();

} );

const inputAttrs = computed( () => ( {

	'class': inputClass.value

} ) );

function onDrop( files: File[] | null ): void {

	isDropIn.value = false;

}

function onEnter(): void {

	isDropIn.value = true;

}

function onLeave(): void {

	isDropIn.value = false;

}

function onUploaderClick (): void {

	isInstant.value && file.value?.click();

	emit( 'click' );

}

function onFileSelect ( e: any ): void {

	const files = e?.target?.files;

    if ( files ) {

		emit( 'change', files );
    
	}

}

</script>

<style lang="scss">
.ui-uploader {

	$selector: &;

	position: relative;
	display: inline-block;

	cursor: pointer;

	border-radius: v-bind( activatorRadius );
	overflow: hidden;

	&_block {

		display: block;

	}

	&:hover #{ $selector }__cover,
	&_dropin #{ $selector }__cover {

		opacity: 1;

	}

	&__cover {

		position: absolute;
		inset: 0;

		display: flex;
		justify-content: center;
		align-items: center;

		background-color: #11111199;

		opacity: 0;
		pointer-events: none;

		transition: opacity .3s ease-in-out;

		border-radius: v-bind( activatorRadius );

	}

	&__input {

		display: none;

	}

}

</style>

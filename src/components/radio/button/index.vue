<template>
	<div v-bind="containerAttrs">

		<div v-bind="buttomAttrs">

			<div v-if="isChecked" />

		</div>

		<div v-if="label" v-bind="labelAttrs">

			{{ label }}

		</div>

	</div>
</template>

<script lang="ts" setup>

	import { computed } from 'vue';
	import { useBem } from '@/composables/useBem';
	import type { IProps } from './props.type';

	const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

		namespace: '',
		label: '',
		disabled: false,

	} );

	const namespace = computed( () => props.namespace ?? '' );
	const label = computed( () => props.label ?? '' );
	const isDisabled = computed<boolean>( () => props.disabled );
	const isChecked = defineModel<boolean>( { default: false } );

	const { block, element } = useBem( 'UiRadioButton' );
	const containerAttrs = computed( () => ( {
		class: block.mix( namespace.value ).classify(),
		onClick: () => { if ( !isDisabled.value ) isChecked.value = true }
	} ) );
	const buttomAttrs = computed( () => ( {
		class: element('buttom').m( 'checked', isChecked.value ).m( 'disabled', isDisabled.value ).mix( namespace.value ).classify()
	} ) );
	const labelAttrs = computed( () => ( {
		class: [
			...element('label').m( 'disabled', isDisabled.value ).mix( namespace.value ).classify(),
			'toggle-label'
		]
	} ) );

</script>

<style lang="scss" scoped>

.ui-radio-button {

	display: flex;
	align-items: center;
	gap: 0.3125rem;
	color: var(--ui-text-primary);
	cursor: pointer;

	&:hover .ui-radio-button__buttom {

		background-color: var(--ui-neutral-400);

	}

	&:hover .ui-radio-button__buttom_checked {

		background-color: var(--ui-brand-600);

	}

	&:hover .ui-radio-button__buttom_disabled {

		background-color: var(--ui-neutral);

	}

	&__buttom {

		width: 1.25rem;
		height: 1.25rem;
		border-radius: 0.625rem;
		background-color: var(--ui-neutral);
		display: flex;
		align-items: center;
		justify-content: center;

		&_checked {

			background-color: var(--ui-brand);
		
		}

		&_disabled {

			background-color: var(--ui-neutral);

			& > div {

				background-color: var(--ui-neutral-300) !important;

			}

		}

		& > div {

			width: 0.5rem;
			height: 0.5rem;
			border-radius: 0.25rem;
			background-color: var(--ui-text-primary);

		}

	}

	&__label {

		user-select: none;

		&_disabled {
			color: var(--ui-neutral-400);
		}

	}

}

</style>
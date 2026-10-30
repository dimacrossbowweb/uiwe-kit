<template>

	<label v-bind="labelAttrs">
				
		<div v-bind:class="containerClass">

			<template v-if="slots.prepend">
		
				<div v-bind:class="prependClass">
					
					<slot name="prepend"/>
				
				</div>

			</template>

			<template v-if="slots.default || title">
			
				<div v-bind:class="contentClass">

					<template v-if="title">
						
						{{ title }}
					
					</template>

					<template v-else>
					
						<slot/>

					</template>
				
				</div>

			</template>

			<template v-if="slots.append">
			
				<div v-bind="appendAttrs">
					
					<slot name="append"/>
				
				</div>

			</template>
		
		</div>
	
	</label>

</template>

<script lang="ts" setup>
import { useSlots, computed, ref } from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useElevation } from '@/composables/useElevation';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

defineOptions( {

	name: 'UiChip',

} );

const views: string[] = [ 'elevate', 'flat', 'text', 'outlined' ];

type TView = typeof views[ number ];

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	color: string;
	title: string;
	disabled: boolean;
	rounded: string | number;
	elevation: string | number;
	view: TView;
	height: string | number;

	bordered: string | number;

	borderColor: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	color: 'brand',
	title: '',
	disabled: false,
	rounded: 50,
	elevation: 2,
	view: 'elevate',
	height: 32,

	bordered: 0,

	borderColor: 'neutral',

} );

const {
	
	parseColor,
	parseValue,

} = useFormat();

const slots = useSlots();

const namespace = computed( () => props?.namespace ? props.namespace : '' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ) );

const colorToString = computed( () => color.value.toString() );

const textColor = computed( () => color.value.contrast().toString() || useCSSVar( 'text-color', props.theme ) );

const title = computed( () => props.title );
const rounded = computed( () => parseValue( props.rounded ).toString() );
const elevation = computed( () => useElevation( props.elevation ).toString() );

const view = computed( () => props?.view ?? 'elevate' );

const height = computed( () => parseValue( props?.height ).toString() );

// bordered = 0 → the border is left to `view` ( outlined/flat/elevate draw their own 1px ).
const isBordered = computed( () => parseFloat( String( props?.bordered ?? 0 ) ) > 0 );

const bordered = computed( () => parseValue( props?.bordered ).toString() );

const borderColorVar = computed( () => useCSSVar( props.borderColor, props.theme ) );

const borderColor = computed( () =>
	parseColor( borderColorVar?.value ? borderColorVar.value : props.borderColor ).toString()
);

const border = computed( () => `${ bordered.value } solid ${ borderColor.value }` );

const isHovered = ref<boolean>( false );
const isDisabled = computed( () => props.disabled );
const isEnabled = computed( () => !isDisabled.value );

const emit = defineEmits( [ 
	
	'click',
	'click:append',

	'hover',
	'mouseenter',
	'mouseleave',

] );

const { block, element } = useBem( 'UiChip' );

const labelClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'disabled', isDisabled.value )
			.m( 'hovered', isHovered.value )
			.m( 'view', view.value )
			.m( 'bordered', isBordered.value )
			.classify();

} );

const labelAttrs = computed( () => ( {

	class: labelClass.value,

	onMouseenter,
	onMouseleave,
	onClick,

} ) );

const containerClass = computed( () => {

	return element( 'container' )
			.mix( namespace.value )
			.classify();

} );

const prependClass = computed( () => {

	return element( 'prepend' )
			.mix( namespace.value )
			.classify();

} );

const contentClass = computed( () => {

	return element( 'content' )
			.mix( namespace.value )
			.classify();

} );

const appendClass = computed( () => {

	return element( 'append' )
			.mix( namespace.value )
			.classify();

} );

const appendAttrs = computed( () => ( {

	class: appendClass.value,

	onClick: onClickAppend,
	// onClick,

} ) );

/**
** 
**/
function onClick ( e: Event ): void {

	if ( isEnabled.value ) {

		emit( 'click', e );

	}

};

/**
** 
**/
function onClickAppend ( e: Event ): void {

	e.preventDefault();
	e.stopPropagation();

	if ( isEnabled.value ) {

		emit( 'click:append', e );

	}

};

/**
** 
**/
function onMouseenter (): void {

	if ( isEnabled.value ) {

		isHovered.value = true;

		emit( 'mouseenter', true );
		emit( 'hover', true );

	}

};

/**
** 
**/
function onMouseleave (): void {

	if ( isEnabled.value ) {

		isHovered.value = false;

		emit( 'mouseleave', false );
		emit( 'hover', false );

	}

};

</script>

<style lang="scss" scoped>
@use './styles.scss';

.ui-chip {

	border-radius: v-bind( rounded );
	height: v-bind( height );

	&_view {

		&_elevate {

			box-shadow: v-bind( elevation );

			border: 1px solid v-bind( colorToString );

			background: v-bind( colorToString );

			color: v-bind( textColor );

		}

		&_flat {

			border: 1px solid v-bind( colorToString );

			background: v-bind( colorToString );

			color: v-bind( textColor );

		}

		&_text {

			color: v-bind( colorToString );

		}

		&_outlined {

			position: relative;

			border: 1px solid v-bind( colorToString );

			color: v-bind( colorToString );

			* {

				z-index: 1;

			}

			&:before {

				content: '';

				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;

				border-radius: v-bind( rounded );

				background-color: v-bind( colorToString );

				opacity: 0.15;

			}

		}

	}

	// After &_view — overrides the view's 1px border at equal specificity.
	&_bordered {

		border: v-bind( border );

	}

}

</style>

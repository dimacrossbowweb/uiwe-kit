<template>

	<ui-menu
	
		v-model="display"
		:direction="direction"
		:animation="animation"
		:z-index="zIndex"
		:block="isBlock"

	>

		<template #activator="{ setRef, onShow }">

			<div
			
				@click="!disabled && onShow()"

				v-bind="mainAttrs"
			
				:ref="setRef"

			>

				<template v-if="!!slots.prepend">

					<div v-bind="prependAttrs">

						<slot name="prepend"></slot>

					</div>

				</template>

				<div v-bind="bodyAttrs">

					<template v-if="multiselect">

						<ui-chip

							v-for="( item, i ) in computedModel"
							:key="i"
							view="flat"
							color="card"
							rounded="5"

						>
					
							{{ item }}
					
						</ui-chip>

					</template>

					<template v-else>

						{{ itemText( computedModel ) }}

					</template>

				</div>

				<template v-if="!!slots.append">

					<div v-bind="appendAttrs">

						<slot name="prepend"></slot>

					</div>

				</template>

				<template v-if="!noArrow">

					<div v-bind="arrowAttrs">

						<slot name="arrow">

							<ui-icon

								v-bind="arrowIconAttrs"
								color="text-primary"
								name="chevron-down"
								size="24"

							/>

						</slot>

					</div>

				</template>

			</div>

		</template>

		<template #content>

			<ui-card
			
				v-bind="contentAttrs"
			
				:elevation="4"
				:rounded="12"
				max-height="100vh"
				bordered="0"

			>

				<template v-if="isEmpty">

					<slot name="empty">

						<ui-card
						
							class="d-flex justify-center items-center"
							elevation="0"
							bordered="0"

						>
					
							{{ emptyText }}
					
						</ui-card>

					</slot>

				</template>

				<template v-else>

					<ui-scroll height="100%">

						<ui-list>

							<ui-list-item

								v-for=" ( item, i ) in items "
								:key="i"
								@click="onSelect( item )"
								color="brand"
								:active="isSelected( item )"

							>
								<template
								
									v-if="multiselect"
									#prepend
									
								>

									<ui-checkbox
									
										:checked="isSelected( item )"
									
									/>

								</template>

								{{ itemText( item ) }}

							</ui-list-item>

						</ui-list>

					</ui-scroll>

				</template>

			</ui-card>

		</template>

	</ui-menu>

</template>

<script lang="ts" setup>
import {

	computed,
	useSlots,

} from 'vue';

import { type TDirection } from '../menu/types/direction.type';
import { type TAnimation } from '../menu/animations/animation';

import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	direction: TDirection;
	animation: TAnimation;
	zIndex: string | number;
	block: boolean;
	items: any[];
	noArrow: boolean;
	keyName: string;
	value: string;
	multiselect: boolean;
	disabled: boolean;
	emptyText: string;
	height: string | number;
	color: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	direction: 'bottom-start',
	animation: 'slide',
	zIndex: 100,
	block: false,
	items: () => [],
	noArrow: false,
	keyName: 'id',
	value: 'name',
	multiselect: false,
	disabled: false,
	emptyText: 'List is empty',
	height: '3.2rem',
	color: 'input',

} );

const slots = useSlots();

const { parseValue, parseColor } = useFormat();

const display = defineModel( 'display', { type: Boolean, default: false } );

const model = defineModel<any | any[]>({ default: '' });

const namespace = computed( () => props?.namespace ?? '' );

const direction = computed( () => props?.direction ?? 'bottom-start' );
const animation = computed( () => props?.animation ?? 'scale' );
const zIndex = computed( () => props?.zIndex ?? 100 );

const isBlock = computed( () => !!props?.block );

const isEmpty = computed( () => items.value.length === 0 );

const items = computed( () => props?.items ?? [] );

const key = computed( () => props?.keyName ?? 'id' );

const value = computed( () => props?.value ?? 'name' );

const emptyText = computed( () => props?.emptyText );

const height = computed( () => parseValue( props?.height ).toString() );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );

const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color )?.toString() );

const itemKey = computed( () => ( item: any ) => {

	if ( [ 'string', 'number' ].includes( typeof item ) ) {

		return item;

	}

	if ( typeof item === 'object' ) {

		return item?.[ key.value ] || null;

	}

	return null;

} );

const itemText = computed( () => ( item: any ) => {

	if ( [ 'string', 'number' ].includes( typeof item ) ) {

		return item;

	}

	if ( typeof item === 'object' ) {

		return item?.[ value.value ] || '';

	}

	return '';

} );

const isSelected = computed( () => ( currentItem: any ) => {

	if ( computedModel.value instanceof Array ) {

		return computedModel.value.find( ( item: any ) => itemKey.value( item ) === itemKey.value( currentItem ) );

	}

	return itemKey.value( computedModel.value ) === itemKey.value( currentItem );

} );

const noArrow = computed( () => !!props.noArrow );

const multiselect = computed( () => !!props.multiselect );

const computedModel = computed({

	get: () => model.value,
  
	set: ( newValue ) => {
    
		if ( multiselect.value ) {

			if ( !( model.value instanceof Array ) ) model.value = [];

      		const existingItem = model.value.find( ( item: any ) => itemKey.value( item ) === itemKey.value( newValue ) );

			if ( !existingItem ) {

				model.value = model.value.concat( newValue );

			} else {

				model.value = model.value.filter( ( item: any ) => {
					
					return itemKey.value( item ) !== itemKey.value( newValue ) 
				
				});

			}

    	} else {

			model.value = newValue;
    
		}
  
	},

});

const { block, element } = useBem( 'UiDropdown' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'block', isBlock.value )
			.m( 'focused', display.value )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const prependClass = computed( () => {

	return element( 'prepend' )
			.mix( namespace.value )
			.classify();

} );

const prependAttrs = computed( () => ( {

	'class': prependClass.value,

} ) );

const bodyClass = computed( () => {

	return element( 'body' )
			.mix( namespace.value )
			.classify();

} );

const bodyAttrs = computed( () => ( {

	'class': bodyClass.value,

} ) );

const appendClass = computed( () => {

	return element( 'append' )
			.mix( namespace.value )
			.classify();

} );

const appendAttrs = computed( () => ( {

	'class': appendClass.value,

} ) );

const arrowClass = computed( () => {

	return element( 'arrow' )
			.mix( namespace.value )
			.classify();

} );

const arrowAttrs = computed( () => ( {

	'class': arrowClass.value,

} ) );

const arrowIconClass = computed( () => {

	return element( 'arrow-icon' )
			.mix( namespace.value )
			.m( 'expanded', display.value )
			.classify();

} );

const arrowIconAttrs = computed( () => ( {

	'class': arrowIconClass.value,

} ) );

const contentClass = computed( () => {

	return element( 'content' )
			.mix( namespace.value )
			.classify();

} );

const contentAttrs = computed( () => ( {

	'class': contentClass.value,

} ) );

function onSelect ( item: any ) {

	computedModel.value = item;
	if (!props.multiselect) display.value = false;

}

</script>

<style lang="scss">
@use './styles.scss';

.ui-dropdown {

	height: v-bind( height );

	background-color: v-bind( color );

}

</style>

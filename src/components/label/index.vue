<template>

	<div v-bind="mainAttrs">

		<label

			v-bind="labelAttrs"
			:for="to"

		>

			<span v-bind="captionAttrs"><slot name="caption">{{ caption }}</slot></span>
			<span
			
				v-if="!!slots[ 'subtitle' ] || subtitle"
				v-bind="subtitleAttrs"
				
			><slot name="subtitle">{{ subtitle }}</slot></span>
	
		</label>

		<slot></slot>
	
	</div>

</template>

<script lang="ts" setup>
import { useSlots, computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

defineOptions( {

	name: 'UiLabel',

} );

type TDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	to: string;
	block: boolean;
	caption: string;
	subtitle: string;
	color: string;
	subtitleColor: string;
	direction: TDirection;

};

const slots = useSlots();

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	block: false,
	color: 'text-primary',
	subtitleColor: 'text-secondary',
	direction: 'row'

} );

const { parseColor } = useFormat();

const namespace = computed( () => props?.namespace ? props.namespace : '' );
const to = computed( () => props.to );
const isBlock = computed( () => !!props.block );
const caption = computed( () => props?.caption || '' );
const subtitle = computed( () => props?.subtitle || '' );

const colorVar = computed( () => useCSSVar( props.color, props.theme ) );
const color = computed( () => parseColor( colorVar?.value ? colorVar.value : props.color ).toString() );

const subtitleColorVar = computed( () => useCSSVar( props.subtitleColor, props.theme ) );
const subtitleColor = computed( () => parseColor( subtitleColorVar?.value ? subtitleColorVar.value : props.subtitleColor ).toString() );

const { block, element } = useBem( 'UiLabel' );

const mainClass = computed( () => {

	return block
			.mix( namespace.value )
			.m( 'block', isBlock.value )
			.m( 'direction', props.direction )
			.classify();

} );

const mainAttrs = computed( () => ( {

	'class': mainClass.value,

} ) );

const labelClass = computed( () => {

	return element( 'label' )
			.mix( namespace.value )
			.classify();

} );

const labelAttrs = computed( () => ( {

	'class': labelClass.value,

} ) );

const captionClass = computed( () => {

	return element( 'caption' )
			.mix( namespace.value )
			.classify();

} );

const captionAttrs = computed( () => ( {

	'class': captionClass.value,

} ) );

const subtitleClass = computed( () => {

	return element( 'subtitle' )
			.mix( namespace.value )
			.classify();

} );

const subtitleAttrs = computed( () => ( {

	'class': subtitleClass.value,

} ) );

</script>

<style lang="scss" scoped>
.ui-label {

	display: inline-flex;
	align-items: center;
	gap: 8px;

	&_block {

		display: flex;
		justify-content: space-between;

	}

	&_block.ui-label_direction_row > * {

		flex-grow: 1;
		flex-shrink: 1;

	}

	&_block.ui-label_direction_column > * {

		align-items: stretch;
		width: 100%;

	}

	&_direction {

		&_row {

			flex-direction: row;

		}

		&_row-reverse {

			flex-direction: row-reverse;

		}

		&_column {

			flex-direction: column;
			align-items: flex-start;

		}

		&_column-reverse {

			flex-direction: column-reverse;
			align-items: flex-start;


		}

	}

	&__label {

		display: flex;
		flex-direction: column;

		color: v-bind( color );

	}

		&__caption {

			color: v-bind( color );

		}

		&__subtitle {

			color: v-bind( subtitleColor );
			font-size: 12px;

		}

}

</style>

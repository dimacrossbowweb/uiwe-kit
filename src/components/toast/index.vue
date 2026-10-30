<template>

	<div v-bind="mainAttrs">

		<ui-icon
			v-if="icon"
			:class="iconClass"
			:name="icon"
			:color="iconColor"
			size="18"
		/>

		<span :class="textClass">

			<slot>{{ text }}</slot>

		</span>

	</div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

/**
 * A toast pill: an icon and a short line of text ( "Link copied" ). Appearance
 * only — where it appears and how long it lives is decided by `<ui-toast-layer>`
 * and `showToast()` ( see composables/useToast ). Can also be used standalone.
 */
interface IProps {

	theme: 'auto' | 'light' | 'dark';

	namespace: string;
	text: string;
	/** ui-icon glyph name; empty — no icon. */
	icon: string;
	type: 'info' | 'success' | 'error';

};

defineOptions( {

	name: 'UiToast',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

	namespace: '',
	text: '',
	icon: '',
	type: 'info',

} );

const namespace = computed( () => props.namespace ?? '' );

// The error icon is red so an error toast is recognisable at a glance; the
// rest use the toast text colour. Resolved here ( not by ui-icon ) so a forced
// `theme` reaches the icon too.
const iconColor = computed<string>( () => {

	const token = props.type === 'error' ? 'negative' : 'toast-text';

	return useCSSVar( token, props.theme ) || token;

} );

const { block, element } = useBem( 'UiToast' );

const mainAttrs = computed( () => ( {

	'class': block
			.mix( namespace.value )
			.m( 'type', props.type )
			.classify(),

	// The toast has no focus or buttons: a polite announcement is enough for
	// screen readers, an error gets an assertive one.
	'role':      props.type === 'error' ? 'alert' : 'status',
	'aria-live': ( props.type === 'error' ? 'assertive' : 'polite' ) as 'assertive' | 'polite',

} ) );

const iconClass = computed( () => element( 'icon' ).mix( namespace.value ).classify() );
const textClass = computed( () => element( 'text' ).mix( namespace.value ).classify() );

</script>

<style lang="scss" scoped>
.ui-toast {

	display: inline-flex;
	align-items: center;
	gap: 8px;

	max-width: 320px;
	padding: 8px 14px;

	border-radius: 10px;

	background: var( --ui-toast-background );
	color: var( --ui-toast-text );

	box-shadow: 0 6px 20px rgba( 0, 0, 0, 0.22 );

	font-size: 13px;
	line-height: 1.35;

	pointer-events: none;
	user-select: none;

	&__icon {

		flex: 0 0 auto;

	}

	&__text {

		min-width: 0;
		overflow-wrap: anywhere;

	}

}
</style>

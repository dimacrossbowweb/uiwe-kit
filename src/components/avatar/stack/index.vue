<template>

	<div v-bind="containerAttrs">

		<component
			v-for="(vnode, i) in patchVNodes()"
			:is="vnode"
		/>

	</div>

</template>

<script lang="ts" setup>

	import { useSlots, computed, cloneVNode } from 'vue';
	import type { VNode, VNodeArrayChildren} from 'vue';
	import { useBem } from '@/composables/useBem';
	import type { IProps } from './props.type';
	import { extendedKeys, updatedKeys } from './props.type';

	const props = withDefaults( defineProps<Partial<IProps>>(), {

		theme: 'auto',

		alignRight: false,
		disableExpand: false,
		size: 36,

	} );

	const slots = useSlots();

	// Not a computed: slots are not reactive. The owner usually passes a ready
	// array into the slot ( v-for over its own computed ), and a computed here
	// would not notice the avatars changed and kept rendering the old set.
	// Rebuilt on every render: the stack re-renders together with its slot.
	function patchVNodes () {

		const result: VNode[] = [];
		let offset = 0.5;

		const configureAvatars = (vnodeList: VNodeArrayChildren) => {

			if (!vnodeList) return;

			const isVNode = (obj: unknown): obj is VNode => {
  				return typeof obj === 'object' && obj !== null && '__v_isVNode' in obj && (obj as any).__v_isVNode === true;
			}

			vnodeList.forEach( vnode => {

				if ( isVNode(vnode) ) {

					if (vnode.type === Symbol.for('v-fgt') && Array.isArray(vnode.children))
						configureAvatars(vnode.children)
					else if ( (vnode.type as any)?.name === 'UiAvatar' ) {
						
						const thisProps:Record<string, unknown> = {};
						const ownProps = props as unknown as Record<string, unknown>;
						// An unset stack prop leaves the avatar alone: otherwise its undefined
						// would wipe what is set on the ui-avatar itself.
						for (const key in ownProps) if (!extendedKeys.includes(key) && ownProps[key] !== undefined) thisProps[key] = ownProps[key];

						for (const key in vnode.props) {
							if (updatedKeys.includes(key))
								thisProps[key] = vnode.props![key];
						}

						const s = parseInt( String(props.size) );
						const b = parseInt( String(props.bordered) );
						const diameter = (Number.isNaN(s) ? 0 : s) + ((Number.isNaN(b) ? 0 : b) * 2);

						const style: Record<string, unknown> = { ...( vnode.props?.style as object ?? {} ) };
						if (!alignRight.value)
							style['margin-right'] = `${-diameter * offset}px`;
						else
							style['margin-left'] = `${-diameter * offset}px`;
						thisProps.style = style;

						result.push(cloneVNode(vnode, {
							...thisProps
						}))

						offset += 0.05;
						offset = offset > 0.9 ? 0.9 : offset;

					}

				}

			} );
		}

		configureAvatars( slots.default?.() ?? [] );

		// Reads the style bag off a cloned vnode. cloneVNode always carries the
		// props we just built, but the vnode type does not know that.
		const styleOf = ( vnode: VNode | undefined ): Record<string, unknown> | null =>
			( vnode?.props?.style as Record<string, unknown> | undefined ) ?? null;

		// The outermost avatar should not pull the (non-existent) next one in.
		const lastStyle = styleOf( result[result.length - 1] );
		if (lastStyle)
			lastStyle[ alignRight.value ? 'margin-left' : 'margin-right' ] = '0px';

		// Stack front-to-back so earlier avatars overlap later ones.
		let zIndex = 1;
		for (let i = result.length - 1; i >= 0; i-- ){
			const style = styleOf( result[i] );
			if (style) style['z-index'] = zIndex;
			zIndex++;
		}

		return result;
	}

	const namespace = computed( () => props.namespace ?? '' );
	const alignRight = computed( () => ( typeof props.alignRight === 'boolean' && props.alignRight ) 
		|| ( typeof props.alignRight === 'string' && props.alignRight.toLowerCase() !== 'false' ) );
	const disableExpand = computed( () => ( typeof props.disableExpand === 'boolean' && props.disableExpand ) 
		|| ( typeof props.disableExpand === 'string' && props.disableExpand.toLowerCase() !== 'false' ) );

	const { block } = useBem( 'UiAvatarStack' );
	const containerAttrs = computed( () => ( {
		class: block
			.mix( namespace.value )
			.m('hover-r', !disableExpand.value && !alignRight.value)
			.m('hover-l', !disableExpand.value && alignRight.value)
			.classify(),
		style: {
			'flex-direction': (alignRight.value ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
		}
	} ) );

</script>

<style lang="scss">

.ui-avatar-stack {

	position: relative;
	display: flex;
	flex-wrap: nowrap;
	padding: 0;

	& > div {
		position: relative;
		padding: 0;
		transition: margin-right 0.3s ease, margin-left 0.3s ease;
	}

}

</style>
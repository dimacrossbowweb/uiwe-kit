<template>

    <ui-sheet v-bind="mainAttrs">

        <slot></slot>

    </ui-sheet>

</template>

<script lang="ts" setup>
/**
 * Toolbar on top of ui-sheet ( like ui-card ): background, rounding, shadow and
 * theme come from the sheet; the toolbar adds the row layout, height and `view`.
 *
 * view:
 *  - `elevate`  — `color` background and `elevation` shadow;
 *  - `flat`     — `color` background without a shadow ( default; `color` is
 *                 transparent by default — an undecorated toolbar );
 *  - `text`     — no background, no shadow;
 *  - `outlined` — no background, 1px border in `color` ( unless `bordered` is set ).
 *
 * Padding, gap and per-side borders are CSS variables rather than props:
 * the sheet's scoped rules beat a plain outer class, variables are not affected.
 *  --ui-toolbar-padding            ( default 0 )
 *  --ui-toolbar-gap                ( default 0 )
 *  --ui-toolbar-border-{top|right|bottom|left}  ( default — from bordered / view )
 */
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';

const views = [ 'elevate', 'flat', 'text', 'outlined' ] as const;

type TView = typeof views[ number ];

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    height: string | number;

    view: TView;
    color: string;
    elevation: string | number;
    rounded: string | number;

    bordered: string | number;
    borderColor: string;

    contrastText: boolean;

};

defineOptions( {

    name: 'UiToolbar',

} );

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
    height: 72,

    view: 'flat',
    color: 'transparent',
    elevation: 2,
    rounded: 0,

    bordered: 0,
    borderColor: 'neutral',

    contrastText: false,

} );

const { parseValue, parseColor } = useFormat();

const namespace = computed( () => props?.namespace ?? '' );
const height    = computed( () => parseValue( props?.height ).toString() );

const view = computed<TView>( () => views.includes( props.view as TView ) ? props.view as TView : 'flat' );

const hasBackground = computed( () => view.value === 'elevate' || view.value === 'flat' );

const hasBorder = computed( () => parseFloat( String( props?.bordered ?? 0 ) ) > 0 );

function resolveColor ( name: string ): string {

	const cssVar = useCSSVar( name, props.theme );

	return parseColor( cssVar ? cssVar : name ).toString();

}

// The toolbar draws its own border ( per side, see styles ): `bordered` /
// `borderColor`, and for outlined without `bordered` — 1px in `color`.
const border = computed( () => {

	if ( hasBorder.value ) {

		return `${ parseValue( props.bordered ).toString() } solid ${ resolveColor( props.borderColor ) }`;

	}

	if ( view.value === 'outlined' ) {

		return `1px solid ${ resolveColor( props.color ) }`;

	}

	return 'none';

} );

const { block } = useBem( 'UiToolbar' );

const mainClass = computed( () => block
    .m( 'view', view.value )
    .mix( namespace.value )
    .classify()
);

const mainAttrs = computed( () => ( {

    class: mainClass.value,

    theme: props.theme,

    color: hasBackground.value ? props.color : 'transparent',
    elevation: view.value === 'elevate' ? props.elevation : 0,
    rounded: props.rounded,
    bordered: 0,
    contrastText: props.contrastText,

} ) );

</script>

<style lang="scss" scoped>
// Toolbar variables don't inherit: otherwise a nested toolbar would pick up
// the outer one's padding and borders.
@each $name in padding, gap, border-top, border-right, border-bottom, border-left {

    @property --ui-toolbar-#{ $name } {

        syntax: '*';
        inherits: false;

    }

}

// .ui-toolbar.ui-sheet — beats the sheet's own scoped rules ( .ui-sheet[data-v] ).
.ui-toolbar.ui-sheet {

    flex: 0 0 auto;
    min-height: v-bind( height );

    box-sizing: border-box;

    display: flex;
    align-items: center;

    padding: var( --ui-toolbar-padding, 0 );
    gap: var( --ui-toolbar-gap, 0 );

    border-top: var( --ui-toolbar-border-top, v-bind( border ) );
    border-right: var( --ui-toolbar-border-right, v-bind( border ) );
    border-bottom: var( --ui-toolbar-border-bottom, v-bind( border ) );
    border-left: var( --ui-toolbar-border-left, v-bind( border ) );

}
</style>

<template>
    
    <div v-bind="mainAttrs">

        <div v-bind="formAttrs">

            <slot
            
                name="form"
                v-bind="{ onMessage }"
                
            >

            </slot>

        </div>

        <ui-expansion v-model="value">

            <div v-bind="messageAttrs">

                <slot name="message">

                    <ui-text v-bind="textAttrs">{{ message || fallbackMessage }}</ui-text>

                </slot>

            </div>

        </ui-expansion>

    </div>

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;

    block: boolean;

    message: string;

    /**
     * Shown when `message` is empty.
     *
     * This was `$t('ui.errorOccurred')`, which made the component depend on
     * vue-i18n being installed with that exact key present — a hard coupling a
     * library cannot make. It is a prop now, so callers localise it themselves:
     * `:fallback-message="t('ui.errorOccurred')"`.
     */
    fallbackMessage: string;

    color: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',

    block: false,

    message: '',

    fallbackMessage: 'An error occurred',

    color: 'negative',

} );

const value = defineModel( { default: false } );

const namespace = computed( () => props?.namespace ?? '' );
const fallbackMessage = computed( () => props?.fallbackMessage ?? '' );
const isBlock = computed( () => !!props?.block );
const color = computed( () => props?.color ?? 'negative' );

const { block, element } = useBem( 'UiHelperText' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'block', isBlock.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

const formClass = computed( () => {

    return element( 'form' )
            .mix( namespace.value )
            .classify();

} );

const formAttrs = computed( () => ( {

    'class': formClass.value,

} ) );

const messageClass = computed( () => {

    return element( 'message' )
            .mix( namespace.value )
            .classify();

} );

const messageAttrs = computed( () => ( {

    'class': messageClass.value,

} ) );

const textClass = computed( () => {

    return element( 'text' )
            .mix( namespace.value )
            .classify();

} );

const textAttrs = computed( () => ( {

    'class': textClass.value,
    'color': color.value,

} ) );

function onMessage ( val: boolean ) {

    value.value = val;

}

</script>

<style lang="scss" scoped>
@use './styles.scss';

</style>

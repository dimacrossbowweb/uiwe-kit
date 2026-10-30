<template>
  <div
    v-if="selectionRect.width > 0 && selectionRect.height > 0"
    :class="mainClass"
    :style="selectionStyle"
    v-bind="mainAttrs"
  ></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBem } from '@/composables/useBem';
import { useFormat } from '@/composables/useFormat';
import { useCSSVar } from '@/composables/useCSSVar';
import { useMarqueeSelection } from '@/composables/useMarqueeSelection';

interface IProps {

	theme: 'auto' | 'light' | 'dark';
  namespace: string;
  color: string;
  bordered: string | number;
  borderColor: string;
  fixed: boolean;
  containerRef?: HTMLElement | null;
  threshold?: number;
  disabled?: boolean;
  hidden?: boolean;
  /**
   * Selector for blocks whose text stays natively selectable: a press inside one
   * lets the browser select words, and the marquee only takes over once the
   * pointer leaves that block. Pass '' to marquee everything.
   */
  textSelector?: string;
}

const props = withDefaults(defineProps<Partial<IProps>>(), {

	theme: 'auto',
  namespace: '',
  color: 'brand',
  bordered: 1,
  borderColor: 'brand',
  fixed: false,
  containerRef: undefined,
  threshold: 100,
  disabled: false,
  hidden: false,
  textSelector: '[data-copy-text]',
});

const emit = defineEmits<{
  select: [rect: { x: number; y: number; width: number; height: number }];
  move: [rect: { x: number; y: number; width: number; height: number }];
  selectionStart: [];
  selectionEnd: [];
}>();

const namespace = computed(() => props?.namespace ?? '');
const { parseColor, parseValue } = useFormat();

const colorVar = computed(() => useCSSVar( props.color, props.theme ));
// Normalise to rgb and force the fill to 50% alpha so the selection zone reads
// as a translucent wash regardless of the source colour's own alpha.
const color = computed(() =>
  parseColor(colorVar?.value ? colorVar.value : props?.color, 'rgb').opacity(0.5).toString()
);

const bordered = computed(() => parseValue(props?.bordered).toString());
const borderColorVar = computed(() => useCSSVar( props.borderColor, props.theme ));
const borderColor = computed(() =>
  parseColor(
    borderColorVar?.value ? borderColorVar.value : props?.borderColor
  ).toString()
);

const fixed = computed(() => !!props?.fixed);
const disabled = computed(() => props?.disabled ?? false);
const hidden = computed(() => !!props?.hidden);

const { block } = useBem('UiMarqueeSelection');

const mainClass = computed(() => {
  return block
    .mix(namespace.value)
    .m('fixed', fixed.value)
    .m('hidden', fixed.value)
    .classify();
});

const mainAttrs = computed(() => ({
  class: mainClass.value,
}));

const targetElement = computed(() => {
  if (props.containerRef) {
    return props.containerRef;
  }

  if (fixed.value) {
    return document.body;
  }

  return null;
});

const selectionStyle = computed(() => {
  if (!selectionRect.value.width && !selectionRect.value.height) {
    return {};
  }

  return {
    left: `${selectionRect.value.x}px`,
    top: `${selectionRect.value.y}px`,
    width: `${selectionRect.value.width}px`,
    height: `${selectionRect.value.height}px`,
    display: hidden.value ? 'none' : 'block',
  };
});

const { isSelecting, selectionRect, startPoint } = useMarqueeSelection(
  targetElement,
  {
    onSelect: (rect) => {
      emit('select', rect);
    },
    onSelectionMove: (rect) => {
      emit('move', rect);
    },
    onSelectionStart: () => {
      emit('selectionStart');
    },
    onSelectionEnd: () => {
      emit('selectionEnd');
    },
    disabled: disabled.value,
    threshold: props.threshold,
    textSelector: props.textSelector,
  }
);

defineExpose({
  isSelecting,
  selectionRect,
  startPoint,
});
</script>

<style lang="scss" scoped>
.ui-marquee-selection {

    position: absolute;

    background-color: v-bind( color );

    border-width: v-bind( bordered );
    border-color: v-bind( borderColor );
    border-style: solid;

    pointer-events: none;
    z-index: 9999000;
    display: none;

    &_fixed {

      position: fixed;

    }
    
}
</style>
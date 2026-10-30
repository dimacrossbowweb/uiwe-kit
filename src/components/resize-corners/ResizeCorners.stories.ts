import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiResizeCorners from './index.vue'

const meta = {
  title: 'Components/ResizeCorners',
  component: UiResizeCorners,
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: 'Width / height to keep. Unset — the ratio the box has when the drag starts.'
    },
    minHeight: { control: 'number', description: 'Smallest height while resizing, px.' },
    maxWidth: { control: 'number' },
    maxHeight: { control: 'number' },
    size: { control: 'number', description: 'Handle size, px.' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Invisible corner handles for proportional mouse resizing. Place inside a positioned box; the component only emits `start` / `resize` / `end` with the new size — the host applies it (and shifts itself when a left / top corner is dragged). Used by `UiFloatWindow` with `resizable`.'
      }
    }
  },
  args: {
    minHeight: 80,
    size: 14
  }
} satisfies Meta<typeof UiResizeCorners>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiResizeCorners },
    setup: () => {
      const size = ref({ width: 240, height: 160 })
      return { args, size }
    },
    template: `
      <div
        :style="{
          position: 'relative',
          width: size.width + 'px',
          height: size.height + 'px',
          background: 'var( --ui-brand )',
          borderRadius: '12px'
        }"
      >
        <ui-resize-corners v-bind="args" @resize="( s ) => size = s" />
      </div>
    `
  })
}

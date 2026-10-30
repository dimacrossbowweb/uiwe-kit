import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiCircleSlider from './index.vue'

const meta = {
  title: 'Components/CircleSlider',
  component: UiCircleSlider,
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    color: { control: 'text', description: 'Thumb outline / glow colour — token name or CSS colour.' },
    borderColor: { control: 'text', description: 'Track colour — token name or CSS colour.' },
    size: { control: { type: 'range', min: 60, max: 300, step: 10 }, description: 'Diameter in px.' },
    thickness: { control: { type: 'range', min: 1, max: 12, step: 1 }, description: 'Track width in px.' },
    thumb: { control: { type: 'range', min: 8, max: 32, step: 1 }, description: 'Thumb diameter in px.' },
    step: { control: { type: 'number', min: 1, max: 90 }, description: 'Snap step in degrees.' },
    disabled: { control: 'boolean' }
  },
  parameters: {
    docs: {
      description: {
        component: [
          'Circular angle picker bound with `v-model` (degrees, 0 at the top, clockwise).',
          '',
          'The model is intentionally **not** wrapped into `[0, 360)`: dragging across the top seam keeps counting (359 → 360 → 361), so a consumer animating a rotation never spins a full turn back. Use `value % 360` when you need the normalised angle — the default slot already receives it as `angle`.'
        ].join('\n')
      }
    }
  },
  args: {
    size: 120,
    step: 1
  }
} satisfies Meta<typeof UiCircleSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiCircleSlider },
    setup() {
      const value = ref(45)
      return { args, value }
    },
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: center;">
        <ui-circle-slider v-bind="args" v-model="value" />
        <span style="font-size: 0.85rem; color: var(--ui-text-secondary);">
          Model: <code>{{ value }}</code>
        </span>
      </div>
    `
  })
}

export const Snapping: Story = {
  parameters: {
    docs: { description: { story: '`step` snaps the angle, e.g. to 15° or 90° increments.' } }
  },
  render: () => ({
    components: { UiCircleSlider },
    setup: () => ({ a: ref(0), b: ref(0) }),
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <ui-circle-slider v-model="a" :step="15" />
        <ui-circle-slider v-model="b" :step="90" />
      </div>
    `
  })
}

export const CustomContent: Story = {
  parameters: {
    docs: { description: { story: 'The default slot replaces the centre label and receives `{ angle }`.' } }
  },
  render: () => ({
    components: { UiCircleSlider },
    setup: () => ({ value: ref(90) }),
    template: `
      <ui-circle-slider v-model="value" :size="160" :step="90" v-slot="{ angle }">
        <span style="font-size: 0.8rem;">Rotate {{ angle }}°</span>
      </ui-circle-slider>
    `
  })
}

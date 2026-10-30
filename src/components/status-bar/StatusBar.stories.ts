import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiStatusBar from './index.vue'

const strength = [
  { start: 0, end: 33, color: 'negative', text: 'Weak' },
  { start: 34, end: 66, color: 'warning', text: 'Fair' },
  { start: 67, end: 100, color: 'success', text: 'Strong' }
]

const meta = {
  title: 'Components/StatusBar',
  component: UiStatusBar,
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    modelValue: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    width: { control: 'text' },
    height: { control: 'number', description: 'Bar thickness in px (or a CSS length).' },
    start: { control: 'number', description: 'Value at the left edge of the scale.' },
    end: { control: 'number', description: 'Value at the right edge of the scale.' },
    statuses: {
      control: 'object',
      description:
        'Bands `{ start, end, color, text }`. The band covering the value paints the fill; `color` is a token name or any CSS colour.'
    },
    namespace: {
      control: 'text',
      description: 'Extra BEM namespace mixed into every generated class, for host-app overrides.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A thin progress-like scale split into coloured bands — password strength, quota usage. The `header` / `footer` slots receive `{ status, value, percent, color, text }`.'
      }
    }
  },
  args: {
    modelValue: 50,
    height: 4,
    statuses: strength
  }
} satisfies Meta<typeof UiStatusBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiStatusBar },
    setup: () => ({ args }),
    template: `<div style="width: 280px;"><ui-status-bar v-bind="args" /></div>`
  })
}

export const WithCaption: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Slots get the active band, so a caption can name and colour the current state.'
      }
    }
  },
  render: () => ({
    components: { UiStatusBar },
    setup: () => ({ value: ref(72), statuses: strength }),
    template: `
      <div style="width: 280px; display: flex; flex-direction: column; gap: 1rem;">
        <input type="range" min="0" max="100" v-model.number="value" />
        <ui-status-bar v-model="value" :statuses="statuses" :height="4">
          <template #footer="{ text, color, value }">
            <span :style="{ color }">{{ text }}</span>&nbsp;· {{ value }}%
          </template>
        </ui-status-bar>
      </div>
    `
  })
}

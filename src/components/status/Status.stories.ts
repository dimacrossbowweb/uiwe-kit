import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiStatus from './index.vue'

const meta = {
  title: 'Components/Status',
  component: UiStatus,
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    size: { control: 'number', description: 'Diameter in px (or a CSS length).' },
    color: {
      control: 'text',
      description: 'Fill: a design token name (e.g. `success`, `negative`) or any CSS colour.'
    },
    bordered: { control: { type: 'range', min: 0, max: 6, step: 1 }, description: 'Ring width in px.' },
    borderColor: { control: 'text', description: 'Ring colour: a token name or any CSS colour.' },
    namespace: {
      control: 'text',
      description: 'Extra BEM namespace mixed into every generated class, for host-app overrides.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A round presence / state marker — online, away, busy. Usually placed over an avatar corner with a ring in the surface colour.'
      }
    }
  },
  args: {
    size: 12,
    color: 'success'
  }
} satisfies Meta<typeof UiStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiStatus },
    setup: () => ({ args }),
    template: `<ui-status v-bind="args" />`
  })
}

export const Colors: Story = {
  render: () => ({
    components: { UiStatus },
    setup: () => ({ colors: ['success', 'warning', 'negative', 'neutral', 'brand'] }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <ui-status v-for="c in colors" :key="c" :color="c" />
      </div>
    `
  })
}

export const OnAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A ring in the surface colour (`fill-01`) separates the marker from the avatar.'
      }
    }
  },
  render: () => ({
    components: { UiStatus },
    template: `
      <div style="position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--ui-neutral-200);">
        <ui-status
          :size="14"
          :bordered="2"
          border-color="fill-01"
          style="position: absolute; right: 0; bottom: 0;"
        />
      </div>
    `
  })
}

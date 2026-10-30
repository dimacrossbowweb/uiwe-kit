import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiBadge from './index.vue'

const meta = {
  title: 'Components/Badge',
  component: UiBadge,
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    content: { control: 'text', description: 'Label or count. Ignored when the default slot is used.' },
    color: {
      control: 'text',
      description: 'Fill: a design token name (e.g. `brand`, `negative`) or any CSS colour.'
    },
    textColor: {
      control: 'text',
      description:
        'Text colour. Defaults to the fill’s contrast colour (white or black, picked via APCA).'
    },
    size: { control: 'number', description: 'Height in px (or a CSS length).' },
    max: {
      control: 'number',
      description: 'Numeric content above `max` renders as `max+` (e.g. `99+`). `0` disables.'
    },
    dot: { control: 'boolean', description: 'Renders a bare round marker without content.' },
    floating: {
      control: 'boolean',
      description: 'Overlays the top-right corner of a `position: relative` parent.'
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
          'A counter / label pill or a bare dot. The fill is token-driven and the text colour is derived from it, so a badge stays legible in any theme.'
      }
    }
  },
  args: {
    content: 7,
    color: 'brand'
  }
} satisfies Meta<typeof UiBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiBadge },
    setup: () => ({ args }),
    template: `<ui-badge v-bind="args" />`
  })
}

export const Colors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The text colour follows the fill automatically.'
      }
    }
  },
  render: () => ({
    components: { UiBadge },
    setup: () => ({ colors: ['brand', 'neutral', 'negative', 'success', 'warning', '#ffd60a'] }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <ui-badge v-for="c in colors" :key="c" :color="c" :content="c" />
      </div>
    `
  })
}

export const Max: Story = {
  parameters: {
    docs: { description: { story: 'Counts past `max` collapse into `max+`.' } }
  },
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <ui-badge :content="5" :max="99" />
        <ui-badge :content="99" :max="99" />
        <ui-badge :content="150" :max="99" />
      </div>
    `
  })
}

export const DotAndFloating: Story = {
  parameters: {
    docs: {
      description: {
        story: '`dot` drops the content; `floating` pins the badge to the parent’s corner.'
      }
    }
  },
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <ui-badge dot color="negative" :size="10" />
        <div style="position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--ui-neutral-200);">
          <ui-badge floating :content="3" color="negative" :size="18" />
        </div>
        <div style="position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--ui-neutral-200);">
          <ui-badge floating dot color="success" :size="12" />
        </div>
      </div>
    `
  })
}

export const Sizes: Story = {
  render: () => ({
    components: { UiBadge },
    setup: () => ({ sizes: [14, 18, 20, 24, 32] }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <ui-badge v-for="s in sizes" :key="s" :size="s" :content="12" />
      </div>
    `
  })
}

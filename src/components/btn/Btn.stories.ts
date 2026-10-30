import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiBtn from './index.vue'

const meta = {
  title: 'Components/Btn',
  component: UiBtn,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Forces the light or dark palette for this button regardless of the page theme.'
    },
    color: {
      control: 'text',
      description:
        'Design token name (e.g. `brand`, `negative`) or any CSS colour. Token names resolve through `--ui-*`, so the button re-colours on theme change.'
    },
    width: { control: 'text' },
    height: { control: 'text' },
    rounded: { control: 'text', description: 'Border radius in px, or a CSS length.' },
    elevation: { control: { type: 'range', min: 0, max: 24, step: 1 } },
    bordered: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    borderColor: { control: 'text' },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    plain: { control: 'boolean', description: 'Transparent background, coloured label.' },
    flat: { control: 'boolean', description: 'Removes elevation and hover lift.' },
    icon: { control: 'boolean', description: 'Renders a square icon-only button.' },
    iconName: { control: 'text', description: 'Icon font glyph name, without the `uii-` prefix.' },
    iconSize: { control: 'number' },
    iconColor: { control: 'text' },
    to: {
      control: 'text',
      description:
        'Navigation target. Uses vue-router when installed, otherwise falls back to `window.location`.'
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
          'The primary action control. Colour, radius, elevation and borders are all token-driven, so a button styled with `color="brand"` follows whatever the active theme defines.'
      }
    }
  },
  args: {
    color: 'brand'
  }
} satisfies Meta<typeof UiBtn>

export default meta
type Story = StoryObj<typeof meta>

const render = (args: Record<string, unknown>, slot = 'Button') => ({
  components: { UiBtn },
  setup: () => ({ args }),
  template: `<ui-btn v-bind="args">${slot}</ui-btn>`
})

export const Default: Story = {
  render: (args) => render(args)
}

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`plain` drops the fill and colours the label instead; `flat` keeps the fill but removes elevation.'
      }
    }
  },
  render: (args) => ({
    components: { UiBtn },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <ui-btn v-bind="args">Filled</ui-btn>
        <ui-btn v-bind="args" plain>Plain</ui-btn>
        <ui-btn v-bind="args" flat>Flat</ui-btn>
        <ui-btn v-bind="args" :bordered="1">Bordered</ui-btn>
        <ui-btn v-bind="args" disabled>Disabled</ui-btn>
      </div>
    `
  })
}

export const Colors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Any colour token works as a `color` value. These re-map when the theme changes.'
      }
    }
  },
  render: () => ({
    components: { UiBtn },
    setup: () => ({ colors: ['brand', 'neutral', 'negative', 'success', 'warning'] }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <ui-btn v-for="c in colors" :key="c" :color="c">{{ c }}</ui-btn>
      </div>
    `
  })
}

export const Elevation: Story = {
  render: () => ({
    components: { UiBtn },
    setup: () => ({ levels: [0, 1, 2, 4, 8, 16] }),
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <ui-btn v-for="e in levels" :key="e" color="brand" :elevation="e">{{ e }}</ui-btn>
      </div>
    `
  })
}

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the `prepend` / `append` slots for a label with an icon, or `icon` for an icon-only button. With a side icon the label stays centred in the whole button, not in the space left after the icon.'
      }
    }
  },
  render: () => ({
    components: { UiBtn },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <ui-btn color="brand">
          <template #prepend><ui-icon name="send" :size="16" /></template>
          Send
        </ui-btn>
        <ui-btn color="brand">
          Next
          <template #append><ui-icon name="arrow-right" :size="16" /></template>
        </ui-btn>
        <ui-btn color="brand" icon icon-name="search" />
        <ui-btn color="negative" icon icon-name="error" />
      </div>
    `
  })
}

export const Block: Story = {
  parameters: {
    docs: { description: { story: '`block` makes the button fill its container width.' } }
  },
  render: (args) => render({ ...args, block: true }, 'Full width')
}

export const Sizes: Story = {
  render: () => ({
    components: { UiBtn },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <ui-btn color="brand" height="2.4rem">Small</ui-btn>
        <ui-btn color="brand">Default</ui-btn>
        <ui-btn color="brand" height="4rem" width="12rem">Large</ui-btn>
      </div>
    `
  })
}

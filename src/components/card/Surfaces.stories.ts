import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiCard from './index.vue'

/**
 * Card, sheet and alert are the surface family — every raised or bounded
 * container in the system is one of these three.
 */
const meta = {
  title: 'Components/Surfaces',
  component: UiCard,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['auto', 'light', 'dark'],
      description: 'Forces the light or dark palette for this card regardless of the app theme.'
    },
    color: { control: 'text', description: 'Background token. Defaults to the `card` token.' },
    elevation: { control: { type: 'range', min: 0, max: 24, step: 1 } },
    rounded: { control: { type: 'range', min: 0, max: 32, step: 1 } },
    bordered: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    borderColor: { control: 'text' },
    width: { control: 'text' },
    height: { control: 'text' },
    flat: { control: 'boolean', description: 'Drops elevation.' },
    tile: { control: 'boolean', description: 'Drops the border radius.' },
    disabled: { control: 'boolean' },
    contrastText: {
      control: 'boolean',
      description:
        'Forces the text colour to the computed contrast of the background instead of inheriting it.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          '`UiSheet` is the primitive — a themed rectangle. `UiCard` builds on it with the title/subtitle/text/actions sub-components, and `UiAlert` is a sheet preset for messages.'
      }
    }
  }
} satisfies Meta<typeof UiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {
  render: (args) => ({
    components: { UiCard },
    setup: () => ({ args }),
    template: `
      <ui-card v-bind="args" style="max-width: 22rem;">
        <ui-card-title>Card title</ui-card-title>
        <ui-card-subtitle>Supporting subtitle</ui-card-subtitle>
        <ui-card-text>
          Cards compose from sub-components so the internal spacing stays consistent
          without you setting padding by hand.
        </ui-card-text>
        <ui-card-actions>
          <ui-btn color="brand" height="2.6rem">Confirm</ui-btn>
          <ui-btn color="neutral" plain height="2.6rem">Cancel</ui-btn>
        </ui-card-actions>
      </ui-card>
    `
  })
}

export const Elevation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Elevation maps to a box-shadow via `useElevation`. The same scale is accepted by button, sheet, chip and card.'
      }
    }
  },
  render: () => ({
    components: { UiCard },
    setup: () => ({ levels: [0, 1, 2, 4, 8, 16, 24] }),
    template: `
      <div style="display: flex; gap: 1.25rem; flex-wrap: wrap; padding: 0.5rem;">
        <ui-card v-for="e in levels" :key="e" :elevation="e" width="5.5rem" height="5.5rem">
          <ui-card-text style="text-align: center;">{{ e }}</ui-card-text>
        </ui-card>
      </div>
    `
  })
}

export const Sheet: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <ui-sheet width="10rem" height="6rem" />
        <ui-sheet width="10rem" height="6rem" color="brand" :contrast-text="true">
          <div style="padding: 1rem;">Brand fill</div>
        </ui-sheet>
        <ui-sheet width="10rem" height="6rem" :bordered="1" :elevation="0" />
        <ui-sheet width="10rem" height="6rem" :rounded="0" />
      </div>
    `
  })
}

export const Toolbar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`UiToolbar` is a sheet laid out in a row. `view` picks the decoration: `elevate` (fill + shadow), `flat` (fill, default), `text` (none) or `outlined` (1px border in `color`). Padding, gap and per-side borders come from `--ui-toolbar-padding`, `--ui-toolbar-gap` and `--ui-toolbar-border-{top|right|bottom|left}`.'
      }
    }
  },
  render: () => ({
    setup: () => ({ views: ['elevate', 'flat', 'text', 'outlined'] }),
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 30rem;">
        <ui-toolbar
          v-for="v in views"
          :key="v"
          :view="v"
          :color="v === 'outlined' ? 'neutral' : 'card'"
          :rounded="12"
          :height="48"
          style="--ui-toolbar-padding: 0 1rem; --ui-toolbar-gap: 0.5rem;"
        >
          <strong>{{ v }}</strong>
          <span style="margin-left: auto;">Action</span>
        </ui-toolbar>
      </div>
    `
  })
}

export const Alert: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 30rem;">
        <ui-alert>A neutral message with the default styling.</ui-alert>
        <ui-alert>
          <template #prepend><ui-icon name="check" color="success" :size="20" /></template>
          Saved successfully.
        </ui-alert>
        <ui-alert>
          <template #prepend><ui-icon name="error" color="negative" :size="20" /></template>
          Something went wrong.
        </ui-alert>
      </div>
    `
  })
}

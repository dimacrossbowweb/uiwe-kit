import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiText from './index.vue'

const meta = {
  title: 'Components/Typography',
  component: UiText,
  tags: ['autodocs'],
  argTypes: {
    tag: { control: 'text', description: 'Rendered element. Defaults to `div`.' },
    text: { control: 'text', description: 'Content. The default slot wins when both are given.' },
    color: { control: 'text' },
    size: { control: { type: 'range', min: 10, max: 48, step: 1 } },
    truncate: { control: 'boolean', description: 'Single line with an ellipsis.' },
    noWrap: { control: 'boolean' },
    block: { control: 'boolean' },
    mono: { control: 'boolean', description: 'Switches to the monospace token.' }
  },
  parameters: {
    docs: {
      description: {
        component:
          '`UiText` is the inline text primitive. For headings and named scale steps, prefer the utility classes documented in Foundations → Typography — they carry the whole scale.'
      }
    }
  },
  args: {
    text: 'The quick brown fox jumps over the lazy dog'
  }
} satisfies Meta<typeof UiText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Colors: Story = {
  render: () => ({
    components: { UiText },
    setup: () => ({
      colors: ['text-primary', 'text-secondary', 'brand', 'negative', 'success', 'warning']
    }),
    template: `
      <div style="display: grid; gap: 0.4rem;">
        <ui-text v-for="c in colors" :key="c" :color="c" :text="c" />
      </div>
    `
  })
}

export const Truncate: Story = {
  render: () => ({
    components: { UiText },
    template: `
      <div style="width: 18rem; border: 1px dashed var(--ui-neutral-200); padding: 0.75rem;">
        <ui-text
          truncate
          text="This sentence is deliberately far too long to fit inside its container, so it truncates."
        />
      </div>
    `
  })
}

export const Label: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 20rem;">
        <ui-label>Field label</ui-label>
        <ui-input placeholder="With a label above" />
        <ui-helper-text>Helper text sits below the control.</ui-helper-text>
      </div>
    `
  })
}

export const Link: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a `RouterLink` when vue-router is installed and a plain `<a href>` when it is not — so the component works in either kind of app.'
      }
    }
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <ui-link to="/somewhere" text="Default link" />
        <ui-link to="/somewhere" text="Brand" color="brand" />
        <ui-link to="/somewhere" text="Monospace" mono />
        <ui-link to="/somewhere" text="Disabled" disabled />
      </div>
    `
  })
}

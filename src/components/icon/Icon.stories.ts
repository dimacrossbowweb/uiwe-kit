import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiIcon from './index.vue'
import { ICON_NAMES } from './icon-names'

const meta = {
  title: 'Components/Icon',
  component: UiIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
      description: 'Glyph name from the bundled `ui` icon font, without the `uii-` prefix.'
    },
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    color: {
      control: 'text',
      description: 'Token name (e.g. `brand`) or any CSS colour.'
    },
    namespace: { control: 'text' }
  },
  parameters: {
    docs: {
      description: {
        component: [
          'Renders a glyph from the bundled icon font. The font ships with the library — no network request, no extra install.',
          '',
          'Text fonts are *not* bundled (see Foundations → Typography), but this icon font is, because components depend on it.'
        ].join('\n')
      }
    }
  },
  args: {
    name: 'search',
    size: 24,
    color: 'text-primary'
  }
} satisfies Meta<typeof UiIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components: { UiIcon },
    setup: () => ({ sizes: [12, 16, 20, 24, 32, 48] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div v-for="s in sizes" :key="s" style="text-align: center;">
          <ui-icon name="rocket-3" :size="s" color="brand" />
          <div style="font-size: 0.7rem; color: var(--ui-text-secondary); margin-top: 0.25rem;">{{ s }}</div>
        </div>
      </div>
    `
  })
}

export const Colors: Story = {
  render: () => ({
    components: { UiIcon },
    setup: () => ({ colors: ['brand', 'neutral', 'negative', 'success', 'warning', '#ec4899'] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ui-icon v-for="c in colors" :key="c" name="star-fill" :size="28" :color="c" />
      </div>
    `
  })
}

export const Gallery: Story = {
  parameters: {
    docs: {
      description: {
        story: `All ${ICON_NAMES.length} glyphs in the bundled font. Click a tile to copy its name.`
      }
    }
  },
  render: () => ({
    components: { UiIcon },
    setup: () => ({
      names: ICON_NAMES,
      copy: (n: string) => navigator.clipboard?.writeText(n)
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr)); gap: 0.5rem;">
        <button
          v-for="n in names"
          :key="n"
          type="button"
          :title="'Copy: ' + n"
          @click="copy(n)"
          style="
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
            padding: 0.85rem 0.5rem; cursor: pointer;
            border: 1px solid var(--ui-neutral-200); border-radius: 8px;
            background: var(--ui-card); color: var(--ui-text-primary);
            font: inherit;
          "
        >
          <ui-icon :name="n" :size="24" color="brand" />
          <span style="font-size: 0.68rem; color: var(--ui-text-secondary); word-break: break-all; line-height: 1.3;">
            {{ n }}
          </span>
        </button>
      </div>
    `
  })
}

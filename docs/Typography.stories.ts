import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Every class the typography layer defines, in scale order. */
const SCALE = [
  { cls: 'heading1', note: '28px / 500' },
  { cls: 'heading2', note: '22px / 500' },
  { cls: 'heading3', note: '18px / 500' },
  { cls: 'heading4', note: '16px / 500' },
  { cls: 'heading5', note: '14px / 500' }
]

const BODY = [
  { cls: 'body-m', note: 'Default body copy' },
  { cls: 'body-m-medium', note: 'Body, medium weight' },
  { cls: 'body-m-underline', note: 'Body, underlined' },
  { cls: 'description-m', note: 'Secondary description' },
  { cls: 'description-m-medium', note: 'Description, medium' },
  { cls: 'description-m-underline', note: 'Description, underlined' },
  { cls: 'value-field', note: 'Field values' }
]

const LABELS = [
  { cls: 'label-xs', note: '' },
  { cls: 'label-xs-medium', note: '' },
  { cls: 'label-s', note: '' },
  { cls: 'label-s-medium', note: '' },
  { cls: 'label-m', note: '' },
  { cls: 'label-m-medium', note: '' },
  { cls: 'label-l', note: '' },
  { cls: 'label-l-medium', note: '' },
  { cls: 'button-label-m', note: 'Used by UiBtn' },
  { cls: 'button-label-s', note: 'Small buttons' },
  { cls: 'toggle-label', note: 'Checkbox / switch labels' }
]

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component: [
          'The type scale ships as utility classes, applied directly to any element:',
          '',
          '```html',
          '<h1 class="heading1">Page title</h1>',
          '<p class="body-m">Body copy</p>',
          '```',
          '',
          '**No text fonts are bundled.** The source project referenced Inter and Montserrat through `@font-face`, but the files were never in the repo, so those rules resolved to nothing and the browser fell back. Shipping that would push the same broken lookup onto every consumer.',
          '',
          'The family is a token instead — `--ui-font-family`, defaulting to the system stack. To use your own:',
          '',
          '```css',
          "@font-face { font-family: 'Inter'; src: url('/fonts/Inter.woff2') format('woff2'); }",
          ":root { --ui-font-family: 'Inter', sans-serif; }",
          '```',
          '',
          'The scale itself sets only weight, size and line-height, so it works with whatever family you choose.'
        ].join('\n')
      }
    }
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const table = (rows: Array<{ cls: string; note: string }>, sample: string) => ({
  setup: () => ({ rows, sample }),
  template: `
    <div style="display: grid; gap: 1.25rem;">
      <div v-for="r in rows" :key="r.cls">
        <div style="display: flex; gap: 0.75rem; align-items: baseline; margin-bottom: 0.15rem;">
          <code style="font-size: 0.72rem; color: var(--ui-text-secondary);">.{{ r.cls }}</code>
          <span v-if="r.note" style="font-size: 0.7rem; color: var(--ui-text-secondary);">
            {{ r.note }}
          </span>
        </div>
        <div :class="r.cls">{{ sample }}</div>
      </div>
    </div>
  `
})

export const Headings: Story = {
  render: () => table(SCALE, 'The quick brown fox jumps over the lazy dog')
}

export const Body: Story = {
  render: () => table(BODY, 'The quick brown fox jumps over the lazy dog')
}

export const Labels: Story = {
  render: () => table(LABELS, 'Label text')
}

export const FontStack: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The two family tokens, rendered with their current values.'
      }
    }
  },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <div>
          <code style="font-size: 0.75rem; color: var(--ui-text-secondary);">--ui-font-family</code>
          <p style="font-family: var(--ui-font-family); font-size: 1.25rem; margin: 0.35rem 0 0;">
            The quick brown fox jumps over the lazy dog — 0123456789
          </p>
        </div>
        <div>
          <code style="font-size: 0.75rem; color: var(--ui-text-secondary);">--ui-font-family-mono</code>
          <p style="font-family: var(--ui-font-family-mono); font-size: 1.25rem; margin: 0.35rem 0 0;">
            The quick brown fox jumps over the lazy dog — 0123456789
          </p>
        </div>
      </div>
    `
  })
}

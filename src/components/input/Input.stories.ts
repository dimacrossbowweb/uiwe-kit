import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiInput from './index.vue'

const meta = {
  title: 'Components/Input',
  component: UiInput,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Forces the light or dark palette for this field regardless of the page theme.'
    },
    placeholder: { control: 'text' },
    color: { control: 'text', description: 'Background token. Defaults to the `input` token.' },
    rounded: { control: { type: 'range', min: 0, max: 24, step: 1 } },
    height: { control: 'text' },
    type: { control: 'select', options: ['text', 'email', 'number', 'tel', 'url'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    autofocus: { control: 'boolean' }
  },
  parameters: {
    docs: {
      description: {
        component: [
          'Text field with `v-model` support via `defineModel`.',
          '',
          'There is no `label` prop — pair it with `UiLabel` above and `UiHelperText` below, which is what keeps the control reusable in tight layouts where a label would not fit.',
          '',
          'Specialised variants live alongside it — `UiInputSearch`, `UiInputPassword`, `UiInputDate`, `UiInputPhone` and `UiInputPin` — each wrapping this base.'
        ].join('\n')
      }
    }
  },
  args: {
    placeholder: 'Type something…'
  }
} satisfies Meta<typeof UiInput>

export default meta
type Story = StoryObj<typeof meta>

/** Shared v-model harness so the controls actually do something. */
const model = (args: Record<string, unknown>, initial = '') => ({
  components: { UiInput },
  setup() {
    const value = ref(initial)
    return { args, value }
  },
  template: `
    <div style="max-width: 22rem;">
      <ui-input v-bind="args" v-model="value" />
      <p style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--ui-text-secondary);">
        Model: <code>{{ value || '—' }}</code>
      </p>
    </div>
  `
})

export const Default: Story = {
  render: (args) => model(args)
}

export const States: Story = {
  render: () => ({
    components: { UiInput },
    setup: () => ({ filled: ref('Some value') }),
    template: `
      <div style="display: grid; gap: 1rem; max-width: 22rem;">
        <div><ui-label>Default</ui-label><ui-input placeholder="Empty" /></div>
        <div><ui-label>Filled</ui-label><ui-input v-model="filled" /></div>
        <div><ui-label>Required</ui-label><ui-input placeholder="Required field" required /></div>
        <div><ui-label>Readonly</ui-label><ui-input model-value="Read only" readonly /></div>
        <div><ui-label>Disabled</ui-label><ui-input placeholder="Disabled" disabled /></div>
        <div><ui-label>Invalid</ui-label><ui-input model-value="Bad value" invalid /></div>
      </div>
    `
  })
}

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each variant is a separate component, globally registered by the plugin. `UiInputPin` emits the joined code; `UiInputPhone` detects the country from the dialling prefix.'
      }
    }
  },
  render: () => ({
    setup() {
      return {
        search: ref(''),
        password: ref(''),
        phone: ref(''),
        pin: ref('')
      }
    },
    template: `
      <div style="display: grid; gap: 1.25rem; max-width: 22rem;">
        <div>
          <div style="font-size: 0.75rem; color: var(--ui-text-secondary); margin-bottom: 0.35rem;">UiInputSearch</div>
          <ui-input-search v-model="search" placeholder="Search…" />
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--ui-text-secondary); margin-bottom: 0.35rem;">UiInputPassword</div>
          <ui-input-password v-model="password" placeholder="Password" />
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--ui-text-secondary); margin-bottom: 0.35rem;">UiInputPhone</div>
          <ui-input-phone v-model="phone" />
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--ui-text-secondary); margin-bottom: 0.35rem;">UiInputPin</div>
          <ui-input-pin v-model="pin" />
        </div>
      </div>
    `
  })
}

export const Rounding: Story = {
  render: () => ({
    components: { UiInput },
    setup: () => ({ radii: [0, 4, 8, 16, 24] }),
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 22rem;">
        <ui-input v-for="r in radii" :key="r" :rounded="r" :placeholder="'rounded: ' + r" />
      </div>
    `
  })
}

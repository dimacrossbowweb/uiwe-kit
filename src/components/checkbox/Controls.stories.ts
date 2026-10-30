import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiCheckbox from './index.vue'

/**
 * Checkbox, switch and radio share a story file: they are the same decision in
 * three shapes, and seeing them together is how you pick the right one.
 */
const meta = {
  title: 'Components/Controls',
  component: UiCheckbox,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'text' },
    rounded: { control: { type: 'range', min: 0, max: 16, step: 1 } },
    disabled: { control: 'boolean' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Selection controls. All of them bind with `v-model` — `UiRadioGroup` holds the selected value while each `UiRadioButton` supplies one option.'
      }
    }
  }
} satisfies Meta<typeof UiCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checkbox: Story = {
  render: (args) => ({
    components: { UiCheckbox },
    setup() {
      const checked = ref(true)
      return { args, checked }
    },
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: center;">
        <ui-checkbox v-bind="args" v-model="checked" />
        <span style="font-size: 0.85rem; color: var(--ui-text-secondary);">
          Model: <code>{{ checked }}</code>
        </span>
      </div>
    `
  })
}

export const CheckboxStates: Story = {
  render: () => ({
    components: { UiCheckbox },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
        <label style="display: flex; gap: 0.5rem; align-items: center;">
          <ui-checkbox v-model="off" /> Unchecked
        </label>
        <label style="display: flex; gap: 0.5rem; align-items: center;">
          <ui-checkbox v-model="on" /> Checked
        </label>
        <label style="display: flex; gap: 0.5rem; align-items: center; opacity: 0.6;">
          <ui-checkbox :model-value="true" disabled /> Disabled
        </label>
        <label style="display: flex; gap: 0.5rem; align-items: center;">
          <ui-checkbox v-model="on" color="success" /> Success
        </label>
      </div>
    `
  })
}

export const Switch: Story = {
  render: () => ({
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
        <ui-switch v-model="off" />
        <ui-switch v-model="on" />
        <ui-switch v-model="on" color="success" />
        <ui-switch v-model="on" :size="22" />
        <ui-switch :model-value="true" disabled />
      </div>
    `
  })
}

export const Radio: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '`UiRadioGroup` is data-driven rather than slot-driven: it takes a `list` of objects and renders one scoped slot per entry, passing `item` with a `checked` flag it maintains.',
          '',
          '`valueKey` names the property written back to `v-model` — it falls back to the array index when the key is missing from an item.'
        ].join('\n')
      }
    }
  },
  render: () => ({
    setup() {
      const picked = ref('b')
      const options = [
        { id: 'a', title: 'Option A' },
        { id: 'b', title: 'Option B' },
        { id: 'c', title: 'Option C' },
        { id: 'd', title: 'Disabled', disabled: true }
      ]
      return { picked, options }
    },
    template: `
      <div>
        <ui-radio-group v-model="picked" :list="options" value-key="id">
          <template #default="{ item }">
            <ui-radio-button
              :model-value="item.checked"
              :label="item.title"
              :disabled="item.disabled"
            />
          </template>
        </ui-radio-group>

        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--ui-text-secondary);">
          Selected: <code>{{ picked }}</code>
        </p>
      </div>
    `
  })
}

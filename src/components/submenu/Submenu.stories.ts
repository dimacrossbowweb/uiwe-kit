import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiSubmenu from './index.vue'

const meta = {
  title: 'Components/Submenu',
  component: UiSubmenu,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Item caption (or use the `label` slot).' },
    disabled: { control: 'boolean' },
    direction: {
      control: 'select',
      options: ['right-down', 'right-up', 'right-center', 'left-down', 'left-up', 'left-center'],
      description: 'Side the submenu opens towards.'
    },
    margin: { control: 'number', description: 'Gap between the item and the submenu, px.' },
    openDelay: {
      control: 'number',
      description: 'Hover open delay, ms — keeps submenus the pointer merely brushes from flickering.'
    },
    rounded: { control: 'number' },
    elevation: { control: { type: 'range', min: 0, max: 24, step: 1 } },
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    namespace: {
      control: 'text',
      description: 'Extra BEM namespace mixed into every generated class, for host-app overrides.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A list item that opens a nested `ui-menu` to the side. Use it inside a `ui-list` in a menu. Clicks inside a submenu do not close the parent menus; an item that completes the choice calls `on.closeAll()` from the default slot to close the whole chain.'
      }
    }
  },
  args: {
    label: 'More'
  }
} satisfies Meta<typeof UiSubmenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiSubmenu },
    setup: () => ({ args }),
    template: `
      <ui-menu>
        <template #activator="{ setRef, onShow }">
          <ui-btn :ref="setRef" color="brand" @click="onShow">Open menu</ui-btn>
        </template>
        <template #content="{ on }">
          <ui-card class="px-1 py-2" :rounded="12" :elevation="2">
            <ui-list>
              <ui-list-item @click="on.close()">Item A</ui-list-item>
              <ui-submenu v-bind="args">
                <template #default="{ on: sub }">
                  <ui-list>
                    <ui-list-item @click="sub.closeAll()">Item B</ui-list-item>
                    <ui-list-item @click="sub.closeAll()">Item C</ui-list-item>
                  </ui-list>
                </template>
              </ui-submenu>
            </ui-list>
          </ui-card>
        </template>
      </ui-menu>
    `
  })
}

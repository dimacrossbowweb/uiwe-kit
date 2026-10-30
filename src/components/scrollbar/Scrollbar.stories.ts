import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiScrollbar from './index.vue'

const meta = {
  title: 'Components/Scrollbar',
  component: UiScrollbar,
  tags: ['autodocs'],
  argTypes: {
    target: {
      control: false,
      description: 'Element with native vertical scrolling the bar tracks and drives.'
    },
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Forces the light or dark palette regardless of the page theme.'
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
          'An overlay scrollbar for an element that must keep native scrolling ( e.g. a virtual list that counts rows by `scrollTop` ). Looks like `UiScrolling`\'s bar: thin, drawn over the content and shown while the pointer is over the area. Place it as a sibling of the target inside a `position: relative` wrapper and hide the target\'s native bar ( `scrollbar-width: none` ).'
      }
    }
  }
} satisfies Meta<typeof UiScrollbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiScrollbar },
    setup: () => {
      const target = ref<HTMLElement | null>(null)
      const rows = Array.from({ length: 60 }, (_, i) => `Row ${i + 1}`)
      return { args, target, rows }
    },
    template: `
      <div style="position: relative; width: 16rem; height: 14rem; border: 1px solid var(--ui-neutral-200, #ddd); border-radius: 12px;">
        <div ref="target" style="height: 100%; overflow-y: auto; scrollbar-width: none; padding: 0.5rem 0.75rem; box-sizing: border-box;">
          <div v-for="r in rows" :key="r" style="padding: 0.25rem 0;">{{ r }}</div>
        </div>
        <ui-scrollbar v-bind="args" :target="target" />
      </div>
    `
  })
}

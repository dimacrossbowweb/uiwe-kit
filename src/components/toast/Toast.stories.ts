import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiToast from './index.vue'
import UiToastLayer from './layer/index.vue'
import { showToast, showCopyToast, hideToast } from '@/composables/useToast'

const meta = {
  title: 'Components/Toast',
  component: UiToast,
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    text: { control: 'text' },
    icon: { control: 'text', description: 'Icon font glyph name; empty for no icon.' },
    type: {
      control: 'select',
      options: ['info', 'success', 'error'],
      description: '`error` paints the icon red and announces assertively to screen readers.'
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
          'A short feedback pill ("Link copied"). On its own it is purely visual; mount `<ui-toast-layer />` once and call `showToast()` from anywhere to have toasts appear next to an anchor element and expire on their own.'
      }
    }
  },
  args: {
    text: 'Link copied',
    icon: 'copy',
    type: 'success'
  }
} satisfies Meta<typeof UiToast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { UiToast },
    setup: () => ({ args }),
    template: `<ui-toast v-bind="args" />`
  })
}

export const Types: Story = {
  render: () => ({
    components: { UiToast },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;">
        <ui-toast type="info" text="Message pinned" />
        <ui-toast type="success" icon="check" text="Saved" />
        <ui-toast type="error" icon="error" text="Couldn't copy" />
      </div>
    `
  })
}

export const Layer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`<ui-toast-layer />` renders whatever `showToast()` raises. A toast sits below its anchor, flips above when there is no room, and falls back to the bottom centre without one. A new toast replaces the current one.'
      }
    }
  },
  render: () => ({
    components: { UiToastLayer },
    setup: () => {
      let last = 0
      const anchored = (e: MouseEvent) => {
        last = showToast({ text: 'Anchored to this button', anchor: e.currentTarget as Element })
      }
      const success = (e: MouseEvent) => {
        last = showToast({ text: 'Saved', type: 'success', anchor: e.currentTarget as Element })
      }
      const error = (e: MouseEvent) => {
        last = showToast({ text: 'Something went wrong', type: 'error', anchor: e.currentTarget as Element })
      }
      const copy = async (e: MouseEvent) => {
        const el = e.currentTarget as Element
        let ok = true
        try {
          await navigator.clipboard.writeText('https://example.com')
        } catch {
          ok = false
        }
        last = showCopyToast(ok, el, { success: 'Link copied' })
      }
      const centred = () => {
        last = showToast({ text: 'No anchor — bottom centre', duration: 3000 })
      }
      const hide = () => hideToast(last)
      return { anchored, success, error, copy, centred, hide }
    },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <ui-btn color="brand" @click="anchored">Info</ui-btn>
        <ui-btn color="success" @click="success">Success</ui-btn>
        <ui-btn color="negative" @click="error">Error</ui-btn>
        <ui-btn color="neutral" @click="copy">Copy link</ui-btn>
        <ui-btn color="neutral" plain @click="centred">No anchor</ui-btn>
        <ui-btn color="neutral" plain @click="hide">Hide</ui-btn>
        <ui-toast-layer />
      </div>
    `
  })
}

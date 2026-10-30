import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiAvatar from './index.vue'

const meta = {
  title: 'Components/Data Display',
  component: UiAvatar,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Used for the initials fallback, and to derive a stable colour when `color` is unset.'
    },
    src: { control: 'text' },
    size: { control: { type: 'range', min: 20, max: 96, step: 4 } },
    color: { control: 'text' },
    bordered: { control: { type: 'range', min: 0, max: 6, step: 1 } },
    borderColor: { control: 'text' },
    shading: { control: 'boolean' },
    borderStatus: { control: 'text', description: 'Status token drawn as a ring, e.g. `status-03`.' },
    statusGap: {
      control: { type: 'range', min: 0, max: 8, step: 1 },
      description: 'Width of the transparent ring the `status` slot cuts out of the avatar around itself. 0 disables the cut-out.'
    },
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Forces the light or dark palette for this avatar regardless of the page theme.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar, chip, divider and the loading placeholders. `UiAvatar` falls back to initials when `src` is absent or fails to load.'
      }
    }
  },
  args: {
    name: 'Jane Doe',
    size: 48
  }
} satisfies Meta<typeof UiAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Avatar: Story = {}

export const AvatarVariants: Story = {
  render: () => ({
    components: { UiAvatar },
    setup: () => ({ names: ['Jane Doe', 'Alex Kim', 'Sam Patel', 'Rowan Fox'] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <ui-avatar v-for="n in names" :key="n" :name="n" :size="48" />
        <ui-avatar name="Bordered" :size="48" :bordered="2" border-color="brand" />
        <ui-avatar name="Status" :size="48" border-status="status-03" />
        <ui-avatar name="Shaded" :size="48" shading />
      </div>
    `
  })
}

export const AvatarStatusAndPreloader: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `status` slot sits in the bottom-right and cuts a transparent ring of `statusGap` px out of the avatar. The `preloader` slot ( receives `size` and `color` ) spins over the image while it loads; a broken `src` falls back to the initials.'
      }
    }
  },
  render: () => ({
    components: { UiAvatar },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ui-avatar name="Jane Doe" :size="48">
          <template #status><ui-status /></template>
        </ui-avatar>
        <ui-avatar name="Wide gap" :size="48" :status-gap="6">
          <template #status><ui-status /></template>
        </ui-avatar>
        <ui-avatar name="Broken Src" src="https://invalid.example/nope.png" :size="48" />
        <ui-avatar name="Loading" src="https://picsum.photos/96" :size="48">
          <template #preloader="{ size, color }"><ui-preloader :size="size" :color="color" /></template>
        </ui-avatar>
      </div>
    `
  })
}

export const AvatarSizes: Story = {
  render: () => ({
    components: { UiAvatar },
    setup: () => ({ sizes: [24, 32, 40, 48, 64, 80] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ui-avatar v-for="s in sizes" :key="s" name="Jane Doe" :size="s" />
      </div>
    `
  })
}

export const AvatarStack: Story = {
  parameters: {
    docs: { description: { story: 'Overlapping group for showing multiple participants.' } }
  },
  render: () => ({
    template: `
      <ui-avatar-stack>
        <ui-avatar name="Jane Doe" :size="40" />
        <ui-avatar name="Alex Kim" :size="40" />
        <ui-avatar name="Sam Patel" :size="40" />
        <ui-avatar name="Rowan Fox" :size="40" />
      </ui-avatar-stack>
    `
  })
}

export const Chip: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <ui-chip color="brand">Brand</ui-chip>
        <ui-chip color="success">Success</ui-chip>
        <ui-chip color="negative">Negative</ui-chip>
        <ui-chip color="neutral" :elevation="0">Flat</ui-chip>
        <ui-chip color="brand" :rounded="6">Square-ish</ui-chip>
        <ui-chip color="brand" disabled>Disabled</ui-chip>
      </div>
    `
  })
}

export const Divider: Story = {
  render: () => ({
    template: `
      <div style="max-width: 24rem;">
        <p style="color: var(--ui-text-secondary);">Above</p>
        <ui-divider />
        <p style="color: var(--ui-text-secondary);">Below</p>
        <ui-divider color="brand" />
        <p style="color: var(--ui-text-secondary);">After a branded divider</p>
      </div>
    `
  })
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`UiSkeleton` holds layout while content loads; `UiPreloader` is the indeterminate spinner.'
      }
    }
  },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.5rem; max-width: 24rem;">
        <div style="display: flex; gap: 1.5rem; align-items: center;">
          <ui-preloader :size="24" color="brand" />
          <ui-preloader :size="36" color="success" />
          <ui-preloader :size="48" color="negative" />
        </div>

        <div style="display: grid; gap: 0.5rem;">
          <ui-skeleton height="1rem" width="60%" />
          <ui-skeleton height="1rem" />
          <ui-skeleton height="1rem" width="80%" />
        </div>
      </div>
    `
  })
}

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiContainer from './index.vue'

const meta = {
  title: 'Components/Layout',
  component: UiContainer,
  tags: ['autodocs'],
  argTypes: {
    fluid: {
      control: 'boolean',
      description: 'Spans the full width of the parent instead of the responsive max width (900/1200/1800/2400px from 960/1280/1920/2560px).'
    },
    fillHeight: { control: 'boolean', description: 'Stretches to the full height of the parent.' }
  },
  parameters: {
    docs: {
      description: {
        component: [
          'The layout primitives: `UiContainer` centres and bounds a page (like Vuetify’s `v-container`; `fluid` lifts the max width), `UiRow`/`UiCol` are a 12-column responsive grid, and `UiFlex`/`UiSpace` handle one-off arrangement.',
          '',
          '`UiCol` takes a span per breakpoint (`xs`…`xxl`) plus matching `*Offset` props. Breakpoint values are documented in Foundations → Grid.'
        ].join('\n')
      }
    }
  }
} satisfies Meta<typeof UiContainer>

export default meta
type Story = StoryObj<typeof meta>

/** Shared cell styling so the grid structure is visible. */
const CELL = `
  background: var(--ui-fill-03);
  border: 1px solid var(--ui-neutral-200);
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
`

export const Grid: Story = {
  render: () => ({
    setup: () => ({ CELL }),
    template: `
      <ui-container>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="12"><div :style="CELL">12</div></ui-col>
        </ui-row>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="6"><div :style="CELL">6</div></ui-col>
          <ui-col :xs="6"><div :style="CELL">6</div></ui-col>
        </ui-row>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="4"><div :style="CELL">4</div></ui-col>
          <ui-col :xs="4"><div :style="CELL">4</div></ui-col>
          <ui-col :xs="4"><div :style="CELL">4</div></ui-col>
        </ui-row>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="3" v-for="n in 4" :key="n"><div :style="CELL">3</div></ui-col>
        </ui-row>
      </ui-container>
    `
  })
}

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resize the preview: each cell is full width on `xs`, half on `md`, and a third on `lg` and up.'
      }
    }
  },
  render: () => ({
    setup: () => ({ CELL }),
    template: `
      <ui-container>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col v-for="n in 6" :key="n" :xs="12" :md="6" :lg="4">
            <div :style="CELL">xs=12 md=6 lg=4</div>
          </ui-col>
        </ui-row>
      </ui-container>
    `
  })
}

export const Offsets: Story = {
  render: () => ({
    setup: () => ({ CELL }),
    template: `
      <ui-container>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="6" :xs-offset="3"><div :style="CELL">6, offset 3</div></ui-col>
        </ui-row>
        <ui-row style="gap: 0.5rem 0;">
          <ui-col :xs="4" :xs-offset="8"><div :style="CELL">4, offset 8</div></ui-col>
        </ui-row>
      </ui-container>
    `
  })
}

export const Flex: Story = {
  render: () => ({
    setup: () => ({ CELL }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <ui-flex style="gap: 0.5rem;">
          <div :style="CELL">A</div>
          <div :style="CELL">B</div>
          <div :style="CELL">C</div>
        </ui-flex>

        <ui-flex stretch style="gap: 0.5rem;">
          <div :style="CELL">Stretched</div>
          <div :style="CELL">To</div>
          <div :style="CELL">Fill</div>
        </ui-flex>
      </div>
    `
  })
}

export const Divider: Story = {
  parameters: {
    docs: { description: { story: '`UiDivider` also accepts a `label` and a `vertical` mode.' } }
  },
  render: () => ({
    template: `
      <div style="max-width: 26rem;">
        <ui-divider />
        <div style="height: 1rem;"></div>
        <ui-divider label="OR" />
        <div style="display: flex; align-items: center; gap: 1rem; height: 4rem; margin-top: 1rem;">
          <span>Left</span>
          <ui-divider vertical />
          <span>Right</span>
        </div>
      </div>
    `
  })
}

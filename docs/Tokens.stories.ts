import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, defineComponent, h } from 'vue'
import { TOKEN_GROUPS, BASE_TOKENS } from '../src/theme/tokens'
import { themeVersion } from '../src/theme/useTheme'

/**
 * Reads the live computed value of a token rather than a hard-coded table, so
 * the page always reflects the theme selected in the toolbar — including custom
 * themes registered with createTheme().
 */
function readToken(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(`--ui-${name}`).trim()
}

const Swatch = defineComponent({
  props: { token: { type: String, required: true } },
  setup(props) {
    // Depending on themeVersion is what makes this re-read on a theme change.
    const value = computed(() => {
      void themeVersion.value
      return readToken(props.token)
    })

    const copy = () => navigator.clipboard?.writeText(`var(--ui-${props.token})`)

    return () =>
      h(
        'button',
        {
          type: 'button',
          onClick: copy,
          title: `Copy var(--ui-${props.token})`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.75rem',
            border: '1px solid var(--ui-neutral-200)',
            borderRadius: '8px',
            background: 'var(--ui-card)',
            color: 'var(--ui-text-primary)',
            font: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%'
          }
        },
        [
          h('span', {
            style: {
              flex: '0 0 auto',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '6px',
              background: `var(--ui-${props.token})`,
              border: '1px solid var(--ui-neutral-200)'
            }
          }),
          h('span', { style: { minWidth: 0 } }, [
            h(
              'code',
              { style: { fontSize: '0.78rem', display: 'block' } },
              `--ui-${props.token}`
            ),
            h(
              'span',
              {
                style: {
                  fontSize: '0.72rem',
                  color: 'var(--ui-text-secondary)',
                  fontVariantNumeric: 'tabular-nums'
                }
              },
              value.value || '—'
            )
          ])
        ]
      )
  }
})

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Live values from the active theme. Switch the Theme control in the toolbar and every swatch updates — this page reads `getComputedStyle`, not a static table. Click a swatch to copy its `var()` reference.'
      }
    }
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Colors: Story = {
  render: () => ({
    components: { Swatch },
    setup: () => ({ groups: TOKEN_GROUPS }),
    template: `
      <div style="display: grid; gap: 2rem;">
        <section v-for="g in groups" :key="g.label">
          <h3 style="margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 600;">{{ g.label }}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem;">
            <Swatch v-for="t in g.tokens" :key="t" :token="t" />
          </div>
        </section>
      </div>
    `
  })
}

export const BaseTokens: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tokens that do not change between light and dark. They are still overridable via `createTheme()` or plain CSS.'
      }
    }
  },
  render: () => ({
    setup() {
      const rows = computed(() => {
        void themeVersion.value
        return BASE_TOKENS.map((t) => ({ token: t, value: readToken(t) }))
      })
      return { rows }
    },
    template: `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead>
          <tr style="text-align: left; border-bottom: 1px solid var(--ui-neutral-200);">
            <th style="padding: 0.5rem 0.75rem;">Token</th>
            <th style="padding: 0.5rem 0.75rem;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.token" style="border-bottom: 1px solid var(--ui-neutral-200);">
            <td style="padding: 0.5rem 0.75rem;"><code>--ui-{{ r.token }}</code></td>
            <td style="padding: 0.5rem 0.75rem; color: var(--ui-text-secondary);">{{ r.value || '—' }}</td>
          </tr>
        </tbody>
      </table>
    `
  })
}

export const OnSurfaces: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The three `fill-*` tokens are the surface ladder — page, raised, and highest. Check text contrast against each when authoring a custom theme.'
      }
    }
  },
  render: () => ({
    setup: () => ({ fills: ['fill-01', 'fill-02', 'fill-03', 'card'] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem;">
        <div
          v-for="f in fills"
          :key="f"
          :style="{
            background: 'var(--ui-' + f + ')',
            border: '1px solid var(--ui-neutral-200)',
            borderRadius: '10px',
            padding: '1rem'
          }"
        >
          <code style="font-size: 0.75rem; color: var(--ui-text-secondary);">{{ f }}</code>
          <p style="margin: 0.5rem 0 0; color: var(--ui-text-primary);">Primary text</p>
          <p style="margin: 0.25rem 0 0; color: var(--ui-text-secondary); font-size: 0.85rem;">
            Secondary text
          </p>
        </div>
      </div>
    `
  })
}

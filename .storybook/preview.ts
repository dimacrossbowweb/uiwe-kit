import { setup, type Preview } from '@storybook/vue3-vite'
import { watchEffect, type App } from 'vue'

import UiKit from '../src/plugin'
import { setTheme, createTheme } from '../src/theme/useTheme'
import '../src/styles/main.scss'

// Register every component globally so stories can write `<ui-btn>` in a
// template string without importing each one.
setup((app: App) => {
  app.use(UiKit, { persistTheme: false })
})

// A custom theme, registered the same way a consumer would. It doubles as the
// live proof that createTheme() works — the toolbar's third option is this.
createTheme('ocean', {
  'fill-01': '#f0f9ff',
  'fill-02': '#e0f2fe',
  'fill-03': '#bae6fd',
  brand: '#0284c7',
  'brand-600': '#0369a1',
  card: '#ffffff',
  dropdown: '#ffffff',
  'dropdown-hover': '#e0f2fe',
  input: '#e0f2fe',
  'text-primary': '#0c4a6e',
  'text-secondary': '#0369a1',
  placeholder: '#7dd3fc'
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    options: {
      // Foundation docs first, then components.
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Installation', 'Theming', 'Design Tokens', 'Typography', 'Grid', 'Utilities'],
          'Components',
          'Composables',
          'Directives'
        ]
      }
    },
    // The decorator paints the surface from the active theme, so Storybook's own
    // background switcher would only ever fight it.
    backgrounds: { disable: true }
  },

  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'ocean', title: 'Ocean (custom)' }
        ],
        dynamicTitle: true
      }
    }
  },

  initialGlobals: {
    theme: 'light'
  },

  decorators: [
    (story, context) => ({
      components: { story },
      setup() {
        // Storybook re-runs the decorator when a global changes; watchEffect
        // keeps the applied theme in step with the toolbar selection.
        watchEffect(() => setTheme(context.globals.theme))
        return {}
      },
      template: `
        <div
          style="
            padding: 1.5rem;
            min-height: 100vh;
            box-sizing: border-box;
            font-family: var(--ui-font-family);
            color: var(--ui-text-primary);
            background: var(--ui-fill-01);
            transition: background-color 200ms ease, color 200ms ease;
          "
        >
          <story />
        </div>
      `
    })
  ]
}

export default preview

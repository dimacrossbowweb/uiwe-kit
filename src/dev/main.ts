import { createApp } from 'vue'
import UiKit, { createTheme } from '../index'
import '../styles/main.scss'
import App from './App.vue'

// Same custom theme Storybook registers, so the playground can exercise the
// runtime theming path too.
createTheme('ocean', {
  'fill-01': '#f0f9ff',
  'fill-02': '#e0f2fe',
  'fill-03': '#bae6fd',
  brand: '#0284c7',
  'brand-600': '#0369a1',
  card: '#ffffff',
  input: '#e0f2fe',
  'text-primary': '#0c4a6e',
  'text-secondary': '#0369a1'
})

createApp(App).use(UiKit, { baseStyles: true }).mount('#app')

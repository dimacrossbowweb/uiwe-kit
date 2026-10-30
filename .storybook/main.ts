import { fileURLToPath, URL } from 'node:url'
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  // Foundation docs live in docs/; component stories sit next to their component.
  stories: [
    '../docs/**/*.mdx',
    '../docs/**/*.stories.@(js|ts|tsx)',
    '../src/**/*.stories.@(js|ts|tsx)'
  ],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },

  docs: {
    defaultName: 'Docs'
  },

  viteFinal(cfg) {
    // The library build runs in lib mode with peers externalised; neither is
    // right for Storybook, so only the path alias carries over.
    cfg.resolve = cfg.resolve ?? {}
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
    return cfg
  }
}

export default config

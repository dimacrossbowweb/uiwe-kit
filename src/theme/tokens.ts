/**
 * The token contract. Every key here maps to a `--ui-<key>` CSS custom property
 * emitted by styles/main.scss, so this list and the SCSS maps must stay in sync.
 *
 * Colour tokens are also always available per palette, regardless of the active
 * theme, as `--ui-light-<key>` and `--ui-dark-<key>`.
 */
export const COLOR_TOKENS = [
  // Main
  'fill-01',
  'fill-02',
  'fill-03',
  // Core
  'brand',
  'brand-600',
  'neutral',
  'neutral-100',
  'neutral-200',
  'neutral-300',
  'neutral-400',
  'neutral-500',
  'neutral-700',
  'negative',
  'success',
  'warning',
  // Controls
  'input',
  'placeholder',
  'dropdown',
  'dropdown-hover',
  'card',
  // Links
  'link',
  'link-inverse',
  // Typography
  'text-primary',
  'text-secondary',
  // Status
  'status-01',
  'status-02',
  'status-03',
  'status-04',
  // Scrollbar
  'scrollbar-track',
  'scrollbar-thumb',
  'scrollbar-thumb-hover',
  // Toast
  'toast-background',
  'toast-text'
] as const

export const BASE_TOKENS = ['font-family', 'font-family-mono', 'theme-transition'] as const

export type ColorToken = (typeof COLOR_TOKENS)[number]
export type BaseToken = (typeof BASE_TOKENS)[number]

/** Any token name. Unknown strings are allowed so consumers can add their own. */
export type TokenName = ColorToken | BaseToken | (string & {})

/** A partial token map — omitted tokens inherit from the base theme. */
export type ThemeTokens = Partial<Record<TokenName, string>>

/** Grouping used by the Storybook token explorer. */
export const TOKEN_GROUPS: Array<{ label: string; tokens: readonly ColorToken[] }> = [
  { label: 'Main', tokens: ['fill-01', 'fill-02', 'fill-03'] },
  {
    label: 'Core',
    tokens: [
      'brand',
      'brand-600',
      'neutral',
      'neutral-100',
      'neutral-200',
      'neutral-300',
      'neutral-400',
      'neutral-500',
      'neutral-700',
      'negative',
      'success',
      'warning'
    ]
  },
  { label: 'Controls', tokens: ['input', 'placeholder', 'dropdown', 'dropdown-hover', 'card'] },
  { label: 'Links', tokens: ['link', 'link-inverse'] },
  { label: 'Typography', tokens: ['text-primary', 'text-secondary'] },
  { label: 'Status', tokens: ['status-01', 'status-02', 'status-03', 'status-04'] },
  { label: 'Scrollbar', tokens: ['scrollbar-track', 'scrollbar-thumb', 'scrollbar-thumb-hover'] },
  { label: 'Toast', tokens: ['toast-background', 'toast-text'] }
]

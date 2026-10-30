<template>
  <ui-container>
    <ui-row style="align-items: center; justify-content: space-between; padding: 1.5rem 0">
      <div>
        <h1 class="heading1">uiwekit</h1>
        <p class="value-field" style="color: var(--ui-text-secondary)">
          Dev playground — the full catalogue lives in Storybook (<code>pnpm storybook</code>).
        </p>
      </div>

      <ui-row style="gap: 0.5rem; align-items: center">
        <ui-btn
          v-for="t in themes"
          :key="t"
          :color="theme === t ? 'brand' : 'neutral'"
          :plain="theme !== t"
          height="2.6rem"
          @click="setTheme(t)"
        >
          {{ t }}
        </ui-btn>
      </ui-row>
    </ui-row>

    <ui-divider />

    <section style="padding: 1.5rem 0">
      <h2 class="heading3" style="margin-bottom: 1rem">Buttons</h2>
      <ui-row style="gap: 0.75rem; flex-wrap: wrap">
        <ui-btn color="brand">Primary</ui-btn>
        <ui-btn color="neutral" plain>Plain</ui-btn>
        <ui-btn color="success" :elevation="4">Elevated</ui-btn>
        <ui-btn color="negative" :bordered="1">Bordered</ui-btn>
        <ui-btn color="brand" icon icon-name="search" />
        <ui-btn color="brand" disabled>Disabled</ui-btn>
      </ui-row>
    </section>

    <section style="padding: 0 0 1.5rem">
      <h2 class="heading3" style="margin-bottom: 1rem">Inputs</h2>
      <ui-row style="gap: 1rem; flex-wrap: wrap; align-items: flex-start">
        <div style="width: 16rem">
          <ui-label>Name</ui-label>
          <ui-input v-model="text" placeholder="Jane Doe" />
        </div>
        <ui-input-search v-model="search" placeholder="Search…" style="width: 16rem" />
        <div style="width: 16rem">
          <ui-label>Password</ui-label>
          <ui-input-password v-model="password" />
        </div>
      </ui-row>
    </section>

    <section style="padding: 0 0 1.5rem">
      <h2 class="heading3" style="margin-bottom: 1rem">Controls</h2>
      <ui-row style="gap: 1.5rem; flex-wrap: wrap; align-items: center">
        <ui-checkbox v-model="checked" label="Checkbox" />
        <ui-switch v-model="enabled" />
        <ui-chip color="brand">Chip</ui-chip>
        <ui-avatar name="Jane Doe" :size="40" />
        <ui-preloader :size="28" color="brand" />
      </ui-row>
    </section>

    <section style="padding: 0 0 3rem">
      <h2 class="heading3" style="margin-bottom: 1rem">Tokens</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 0.75rem">
        <div v-for="t in swatches" :key="t" style="display: flex; align-items: center; gap: 0.5rem">
          <span
            :style="{
              width: '2rem',
              height: '2rem',
              borderRadius: '6px',
              background: `var(--ui-${t})`,
              border: '1px solid var(--ui-neutral-200)'
            }"
          />
          <code style="font-size: 0.75rem">{{ t }}</code>
        </div>
      </div>
    </section>
  </ui-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/theme'

const { theme, themes, setTheme } = useTheme()

const text = ref('')
const search = ref('')
const password = ref('')
const checked = ref(true)
const enabled = ref(true)

const swatches = [
  'fill-01',
  'fill-02',
  'fill-03',
  'brand',
  'neutral',
  'negative',
  'success',
  'warning',
  'text-primary',
  'text-secondary'
]
</script>

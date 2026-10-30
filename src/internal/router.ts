import { getCurrentInstance, resolveComponent, type Component } from 'vue'

/**
 * vue-router is an optional peer dependency, so components must not import it
 * statically — that would make the module fail to resolve for consumers who
 * never installed it.
 *
 * Instead we read what vue-router registers on the app instance. `$router` is a
 * global property it defines, and `RouterLink` is a globally registered
 * component, so both are reachable without an import.
 */

export interface MinimalRouter {
  push: (to: string | Record<string, unknown>) => void
}

/** Returns the app's router, or null when vue-router is not installed. */
export function useOptionalRouter(): MinimalRouter | null {
  const instance = getCurrentInstance()
  const router = instance?.appContext.config.globalProperties.$router
  return (router as MinimalRouter | undefined) ?? null
}

/**
 * Resolves vue-router's RouterLink, falling back to a plain anchor.
 *
 * `resolveComponent` emits a warning for unresolved names, so we check the
 * registry first and only ask for it when it is actually there.
 */
export function resolveRouterLink(): Component | 'a' {
  const instance = getCurrentInstance()
  if (!instance) return 'a'

  const registered = instance.appContext.components
  if (!('RouterLink' in registered) && !('router-link' in registered)) return 'a'

  const resolved = resolveComponent('RouterLink')
  return typeof resolved === 'string' ? 'a' : resolved
}

/** Navigates via the router when present, otherwise falls back to the browser. */
export function navigate(router: MinimalRouter | null, to: string): void {
  if (router) {
    router.push(to)
    return
  }
  if (typeof window !== 'undefined') window.location.assign(to)
}

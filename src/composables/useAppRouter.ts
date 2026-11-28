import { nextTick, readonly, ref } from 'vue'
import {
  INSPIRE_WELLNESS_BASE_PATH,
  findInspireWellnessEpisodeBySlug,
} from '../config/inspireWellness'
import { syncContactIntentFromLocation } from './useContactNavigation'

export type AppRoute =
  | { name: 'home' }
  | { name: 'inspire-wellness-library' }
  | { name: 'inspire-wellness-detail'; slug: string }

function parsePathname(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === '/') {
    return { name: 'home' }
  }
  if (clean === '/inspire-wellness') {
    return { name: 'inspire-wellness-library' }
  }
  const detailMatch = clean.match(/^\/inspire-wellness\/([^/]+)$/)
  if (detailMatch?.[1]) {
    return {
      name: 'inspire-wellness-detail',
      slug: decodeURIComponent(detailMatch[1]),
    }
  }
  return { name: 'home' }
}

function updateDocumentTitleForRoute(route: AppRoute) {
  if (typeof document === 'undefined') return
  if (route.name === 'home') {
    document.title = 'Nguyễn Khánh Ly'
    return
  }
  if (route.name === 'inspire-wellness-library') {
    document.title = 'Inspire Wellness — Nguyễn Khánh Ly'
    return
  }
  const ep = findInspireWellnessEpisodeBySlug(route.slug)
  document.title = ep
    ? `${ep.title} — Inspire Wellness | Nguyễn Khánh Ly`
    : 'Inspire Wellness — Nguyễn Khánh Ly'
}

const currentRouteState = ref<AppRoute>(
  typeof window !== 'undefined' ? parsePathname(window.location.pathname) : { name: 'home' }
)

let popstateBound = false

function ensureRouterListener() {
  if (popstateBound || typeof window === 'undefined') return
  popstateBound = true
  updateDocumentTitleForRoute(currentRouteState.value)

  window.addEventListener('popstate', () => {
    currentRouteState.value = parsePathname(window.location.pathname)
    updateDocumentTitleForRoute(currentRouteState.value)
  })
}

export function shouldInterceptClick(event?: MouseEvent): boolean {
  if (!event) return true
  if (event.defaultPrevented) return false
  if (event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  return true
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Chuyển trang nội bộ (ví dụ `/`, `/inspire-wellness/`, `/inspire-wellness/<slug>/` hoặc `/#talks`).
 */
export async function navigateApp(href: string, event?: MouseEvent): Promise<void> {
  if (typeof window === 'undefined') return
  if (!shouldInterceptClick(event)) return

  const url = new URL(href, window.location.origin)
  if (url.origin !== window.location.origin) return

  event?.preventDefault()

  const nextRoute = parsePathname(url.pathname)
  const targetHash = url.hash

  const normalizedPathname =
    nextRoute.name === 'home'
      ? '/'
      : nextRoute.name === 'inspire-wellness-library'
        ? INSPIRE_WELLNESS_BASE_PATH
        : `${INSPIRE_WELLNESS_BASE_PATH}${nextRoute.slug}/`

  const nextFullUrl = `${normalizedPathname}${targetHash}`
  const currentFullUrl = `${window.location.pathname}${window.location.hash}`

  if (nextFullUrl !== currentFullUrl) {
    window.history.pushState({}, '', nextFullUrl)
  }

  const routeChanged =
    currentRouteState.value.name !== nextRoute.name ||
    (currentRouteState.value.name === 'inspire-wellness-detail' &&
      nextRoute.name === 'inspire-wellness-detail' &&
      currentRouteState.value.slug !== nextRoute.slug)

  currentRouteState.value = nextRoute
  updateDocumentTitleForRoute(nextRoute)

  if (targetHash && targetHash.length > 1) {
    syncContactIntentFromLocation()
  }

  await nextTick()

  if (targetHash && targetHash.length > 1) {
    const rawId = targetHash.slice(1).split('?')[0] ?? ''
    const scrollBehavior: ScrollBehavior =
      routeChanged || prefersReducedMotion() ? 'instant' : 'smooth'
    const scrollToTarget = () => {
      const el = rawId ? document.getElementById(rawId) : null
      if (!el) return false
      el.scrollIntoView({
        behavior: scrollBehavior,
        block: 'start',
      })
      return true
    }

    if (scrollToTarget()) {
      if (routeChanged) {
        window.requestAnimationFrame(() => {
          scrollToTarget()
        })
      }
      return
    }
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: routeChanged || prefersReducedMotion() ? 'instant' : 'smooth',
  })
}

export function scrollCurrentPageToTop(event?: MouseEvent): void {
  if (typeof window === 'undefined') return
  if (!shouldInterceptClick(event)) return
  event?.preventDefault()
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
}

export function useAppRouter() {
  ensureRouterListener()
  return {
    currentRoute: readonly(currentRouteState),
    navigateApp,
    scrollCurrentPageToTop,
  }
}


<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import brandLogo from '../assets/images/logo.png'
import { NAV_DESTINATIONS, SITE_BRAND, type NavDestination } from '../config/siteContent'
import { navigateToContact } from '../composables/useContactNavigation'
import {
  navigateApp,
  scrollCurrentPageToTop,
  useAppRouter,
} from '../composables/useAppRouter'

const { currentRoute } = useAppRouter()

const isMobileMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const activeHomeAnchor = ref<string>('#hero')
let sectionObserver: IntersectionObserver | null = null

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function extractHashFromHref(href: string): string | null {
  const hashIdx = href.indexOf('#')
  return hashIdx >= 0 ? href.slice(hashIdx) : null
}

function isNavItemActive(item: NavDestination): boolean {
  if (
    currentRoute.value.name === 'inspire-wellness-library' ||
    currentRoute.value.name === 'inspire-wellness-detail'
  ) {
    return item.id === 'video-series'
  }
  const itemHash = extractHashFromHref(item.href)
  return Boolean(itemHash && activeHomeAnchor.value === itemHash)
}

function handleBrandClick(event: MouseEvent) {
  closeMobileMenu()
  if (currentRoute.value.name === 'home') {
    activeHomeAnchor.value = '#hero'
    scrollCurrentPageToTop(event)
    return
  }
  void navigateApp('/', event)
}

async function handleNavLinkClick(item: NavDestination, event: MouseEvent) {
  closeMobileMenu()

  if (item.href.startsWith('/inspire-wellness')) {
    await navigateApp(item.href, event)
    return
  }

  const itemHash = extractHashFromHref(item.href)
  if (currentRoute.value.name === 'home') {
    if (itemHash) {
      activeHomeAnchor.value = itemHash
    }
    if (itemHash === '#lien-he') {
      navigateToContact(undefined, event)
      return
    }
    await navigateApp(item.href, event)
    return
  }

  // Đang ở trang Inspire Wellness -> chuyển về Home và cuộn tới đúng mục
  if (itemHash === '#lien-he') {
    await navigateApp('/#lien-he', event)
    navigateToContact(undefined)
    return
  }
  await navigateApp(item.href, event)
}

function setupHomeSectionObserver() {
  sectionObserver?.disconnect()
  sectionObserver = null

  if (currentRoute.value.name !== 'home') return

  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHomeAnchor.value = `#${entry.target.id}`
        }
      }
    },
    { rootMargin: '-28% 0px -55% 0px', threshold: 0 }
  )

  for (const item of NAV_DESTINATIONS) {
    const itemHash = extractHashFromHref(item.href)
    if (itemHash && itemHash.length > 1) {
      const el = document.getElementById(itemHash.slice(1))
      if (el) sectionObserver.observe(el)
    }
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isMobileMenuOpen.value || !headerRef.value) return
  if (!headerRef.value.contains(event.target as Node)) {
    closeMobileMenu()
  }
}

function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

watch(
  () => currentRoute.value.name,
  async () => {
    closeMobileMenu()
    await nextTick()
    setupHomeSectionObserver()
  }
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeyDown)
  setupHomeSectionObserver()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeyDown)
  sectionObserver?.disconnect()
})
</script>

<template>
  <header ref="headerRef" class="site-header">
    <div class="site-header__inner container">
      <a class="site-header__brand" :href="SITE_BRAND.homeHref" @click="handleBrandClick">
        <img
          class="site-header__brand-logo"
          :src="brandLogo"
          alt="Logo Nguyễn Khánh Ly"
          width="1024"
          height="1024"
          decoding="async"
        />
        <strong class="site-header__brand-name">
          <span class="site-header__brand-surname">{{ SITE_BRAND.surname }}</span>
          {{ ' ' }}
          <span class="site-header__brand-given">{{ SITE_BRAND.givenName }}</span>
        </strong>
      </a>

      <!-- Desktop inline navigation (>= 62rem) -->
      <nav class="site-header__nav-desktop" aria-label="Điều hướng chính">
        <ul class="site-header__list">
          <li v-for="item in NAV_DESTINATIONS" :key="item.id">
            <a
              class="site-header__link"
              :class="{ 'is-active': isNavItemActive(item) }"
              :href="item.href"
              :aria-current="isNavItemActive(item) && item.id === 'video-series' ? 'page' : undefined"
              @click="handleNavLinkClick(item, $event)"
            >
              <span
                v-if="isNavItemActive(item)"
                class="site-header__dot"
                aria-hidden="true"
              ></span>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Mobile disclosure toggle (< 62rem) -->
      <button
        type="button"
        class="site-header__menu-btn"
        :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
        aria-controls="mobile-nav-panel"
        @click="toggleMobileMenu"
      >
        <span>Menu</span>
        <X v-if="isMobileMenuOpen" :size="16" :stroke-width="2" aria-hidden="true" />
        <Menu v-else :size="16" :stroke-width="2" aria-hidden="true" />
      </button>
    </div>

    <!-- Mobile navigation panel -->
    <nav
      v-if="isMobileMenuOpen"
      id="mobile-nav-panel"
      class="site-header__nav-mobile"
      aria-label="Điều hướng di động"
    >
      <ul class="site-header__mobile-list container">
        <li v-for="item in NAV_DESTINATIONS" :key="item.id">
          <a
            class="site-header__mobile-link"
            :href="item.href"
            :aria-current="isNavItemActive(item) && item.id === 'video-series' ? 'page' : undefined"
            @click="handleNavLinkClick(item, $event)"
          >
            <span
              class="site-header__dot"
              :class="{ 'is-muted': !isNavItemActive(item) }"
              aria-hidden="true"
            ></span>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky-nav);
  border-bottom: var(--rule-hairline);
  background: var(--color-header-bg);
  backdrop-filter: blur(10px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: 4.5rem;
  padding-block: var(--space-xs);
}

.site-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 44px;
  padding-block: var(--space-2xs);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity var(--dur-micro) var(--ease-out);
}

.site-header__brand-logo {
  display: block;
  height: 2.5rem;
  width: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background: transparent;
  flex-shrink: 0;
}

.site-header__brand-name {
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 1.3vw + 0.68rem, 1.375rem);
  font-weight: 700;
  font-variation-settings: 'opsz' 36, 'SOFT' 25;
  line-height: 1.15;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.site-header__brand-surname {
  color: var(--color-brand-surname);
}

.site-header__brand-given {
  color: var(--color-brand-given);
}

@media (hover: hover) and (pointer: fine) {
  .site-header__brand:hover {
    opacity: 0.88;
  }
}

.site-header__nav-desktop {
  display: none;
}

.site-header__list {
  display: flex;
  align-items: center;
  gap: clamp(var(--space-sm), 1.45vw, var(--space-lg));
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-header__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 44px;
  padding-inline: var(--space-xs);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink-2);
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  transition: color var(--dur-micro) var(--ease-out);
}

.site-header__link:hover,
.site-header__link.is-active {
  color: var(--color-ink);
}

.site-header__link::after {
  content: '';
  position: absolute;
  inset-inline: var(--space-xs);
  bottom: 0.5rem;
  height: 1.5px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--dur-short) var(--ease-out);
}

.site-header__link:hover::after,
.site-header__link.is-active::after {
  transform: scaleX(1);
}

.site-header__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
}

.site-header__dot.is-muted {
  background: var(--color-rule);
}

.site-header__menu-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 44px;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-pill);
  border: var(--rule-hairline);
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}

.site-header__menu-btn:hover {
  background: var(--color-paper-2);
  border-color: var(--color-ink-2);
}

.site-header__nav-mobile {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  background: var(--color-paper);
  border-bottom: var(--rule-hairline);
  box-shadow: var(--shadow-whisper);
  animation: nav-panel-open var(--dur-short) var(--ease-out) forwards;
}

.site-header__mobile-list {
  list-style: none;
  margin: 0;
  padding-block: var(--space-xs);
  display: flex;
  flex-direction: column;
}

.site-header__mobile-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: 44px;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
}

@keyframes nav-panel-open {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 23rem) {
  .site-header__inner {
    gap: var(--space-sm);
  }

  .site-header__menu-btn {
    padding: var(--space-xs) var(--space-sm);
  }
}

@media (min-width: 48rem) {
  .site-header__brand-logo {
    height: 3rem;
  }
}

@media (min-width: 62rem) {
  .site-header__nav-desktop {
    display: flex;
    align-items: center;
  }

  .site-header__menu-btn,
  .site-header__nav-mobile {
    display: none;
  }
}
</style>

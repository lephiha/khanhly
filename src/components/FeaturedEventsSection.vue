<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  FEATURED_EVENTS,
  FEATURED_EVENTS_SECTION,
  type FeaturedEventItem,
} from '../config/siteContent'

const sectionRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const primarySetRef = ref<HTMLElement | null>(null)
const cloneSetRef = ref<HTMLElement | null>(null)

const isOverflowing = ref(false)
const prefersReducedMotion = ref(false)
const isHovered = ref(false)
const isFocusedWithin = ref(false)
const isTouchActive = ref(false)
const isInViewport = ref(true)
const trackOffsetPx = ref(0)

let rafId: number | null = null
let lastTs: number | null = null
let setStridePx = 0
let posPx = 0
let touchSettleTimer: number | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let reducedMotionQuery: MediaQueryList | null = null

const SPEED_PX_PER_SEC = 28

const shouldClone = computed(() => isOverflowing.value && !prefersReducedMotion.value)

const isAutoRunning = computed(() => {
  return (
    shouldClone.value &&
    !isHovered.value &&
    !isFocusedWithin.value &&
    !isTouchActive.value &&
    isInViewport.value
  )
})

const trackStyle = computed(() => {
  if (!shouldClone.value || trackOffsetPx.value === 0) {
    return { transform: 'none' }
  }
  return {
    transform: `translate3d(${(-trackOffsetPx.value).toFixed(2)}px, 0, 0)`,
  }
})

function hasValidDetailUrl(
  item: FeaturedEventItem
): item is FeaturedEventItem & { detailUrl: string } {
  return typeof item.detailUrl === 'string' && item.detailUrl.trim().length > 0
}

function measureLayout() {
  const vp = viewportRef.value
  const primary = primarySetRef.value
  if (!vp || !primary) return

  const fitsInFrame = primary.scrollWidth <= vp.clientWidth + 4
  isOverflowing.value = !fitsInFrame

  nextTick(() => {
    if (shouldClone.value && cloneSetRef.value && primarySetRef.value) {
      const stride = cloneSetRef.value.offsetLeft - primarySetRef.value.offsetLeft
      setStridePx = stride > 0 ? stride : primarySetRef.value.scrollWidth
      if (setStridePx > 0) {
        posPx = posPx % setStridePx
        if (!isTouchActive.value && !isFocusedWithin.value && vp.scrollLeft === 0) {
          trackOffsetPx.value = posPx
        }
      }
    } else {
      setStridePx = 0
      posPx = 0
      trackOffsetPx.value = 0
    }
  })
}

function tick(ts: number) {
  if (lastTs === null) {
    lastTs = ts
  }
  const dt = Math.min((ts - lastTs) / 1000, 0.08)
  lastTs = ts

  if (isAutoRunning.value && setStridePx > 0) {
    posPx = (posPx + SPEED_PX_PER_SEC * dt) % setStridePx
    trackOffsetPx.value = posPx
  }

  rafId = window.requestAnimationFrame(tick)
}

function transferTransformToScrollLeft() {
  const vp = viewportRef.value
  if (!vp || trackOffsetPx.value === 0) return
  vp.scrollLeft += trackOffsetPx.value
  trackOffsetPx.value = 0
}

function foldScrollLeftBackToTransform() {
  const vp = viewportRef.value
  if (!vp || !shouldClone.value || setStridePx <= 0) return
  posPx = ((vp.scrollLeft % setStridePx) + setStridePx) % setStridePx
  vp.scrollLeft = 0
  trackOffsetPx.value = posPx
}

function scheduleTouchSettle() {
  if (touchSettleTimer !== null) {
    window.clearTimeout(touchSettleTimer)
  }
  touchSettleTimer = window.setTimeout(() => {
    isTouchActive.value = false
    if (!isFocusedWithin.value) {
      foldScrollLeftBackToTransform()
    }
  }, 320)
}

function onTouchStart() {
  if (!shouldClone.value) return
  if (touchSettleTimer !== null) {
    window.clearTimeout(touchSettleTimer)
  }
  isTouchActive.value = true
  transferTransformToScrollLeft()
}

function onTouchEnd() {
  if (!shouldClone.value) return
  scheduleTouchSettle()
}

function onWheel(event: WheelEvent) {
  if (!shouldClone.value) return
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 2) {
    isTouchActive.value = true
    transferTransformToScrollLeft()
    scheduleTouchSettle()
  }
}

function onViewportScroll() {
  const vp = viewportRef.value
  if (!vp || !shouldClone.value || setStridePx <= 0) return
  if (!isTouchActive.value && !isFocusedWithin.value && trackOffsetPx.value > 0 && vp.scrollLeft > 0) {
    isTouchActive.value = true
    transferTransformToScrollLeft()
  }
  if (vp.scrollLeft >= setStridePx) {
    vp.scrollLeft -= setStridePx
  }
  if (isTouchActive.value) {
    scheduleTouchSettle()
  }
}

function onFocusIn() {
  isFocusedWithin.value = true
  // Chuyển sang cuộn native để người dùng dùng phím mũi tên trái/phải xem thủ công
  if (shouldClone.value) {
    transferTransformToScrollLeft()
  }
}

function onFocusOut(event: FocusEvent) {
  const current = event.currentTarget as HTMLElement | null
  const related = event.relatedTarget as Node | null
  if (current && related && current.contains(related)) return
  isFocusedWithin.value = false
  if (!isTouchActive.value) {
    foldScrollLeftBackToTransform()
  }
}

function onReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches
  if (event.matches) {
    trackOffsetPx.value = 0
    posPx = 0
  } else {
    measureLayout()
  }
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', onReducedMotionChange)

  measureLayout()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measureLayout()
    })
    if (viewportRef.value) resizeObserver.observe(viewportRef.value)
    if (primarySetRef.value) resizeObserver.observe(primarySetRef.value)
  }

  if (typeof IntersectionObserver !== 'undefined' && sectionRef.value) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          isInViewport.value = entry.isIntersecting
        }
      },
      { threshold: 0.05 }
    )
    intersectionObserver.observe(sectionRef.value)
  }

  rafId = window.requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  if (touchSettleTimer !== null) window.clearTimeout(touchSettleTimer)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reducedMotionQuery?.removeEventListener('change', onReducedMotionChange)
})
</script>

<template>
  <section
    :id="FEATURED_EVENTS_SECTION.id"
    ref="sectionRef"
    class="featured-events"
    aria-labelledby="featured-events-heading"
  >
    <div class="container featured-events__inner">
      <div class="featured-events__stage">
        <header class="featured-events__head">
          <h2 id="featured-events-heading" class="featured-events__title">
            {{ FEATURED_EVENTS_SECTION.heading }}
          </h2>
        </header>

        <div
          ref="viewportRef"
          class="featured-events__viewport"
          :class="{
            'is-static': !isOverflowing,
            'is-manual': prefersReducedMotion || isFocusedWithin,
            'is-masked': shouldClone && !isFocusedWithin,
          }"
          :tabindex="isOverflowing ? 0 : undefined"
          role="region"
          aria-label="Dải ảnh sự kiện nổi bật"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
          @focusin="onFocusIn"
          @focusout="onFocusOut"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
          @touchcancel.passive="onTouchEnd"
          @wheel.passive="onWheel"
          @scroll.passive="onViewportScroll"
        >
          <div class="featured-events__track" :style="trackStyle">
            <!-- Tập thẻ gốc (trình đọc màn hình và bàn phím thao tác tại đây) -->
            <div ref="primarySetRef" class="featured-events__set" role="list">
              <div
                v-for="item in FEATURED_EVENTS"
                :key="item.id"
                class="featured-events__slot"
                role="listitem"
              >
                <a
                  v-if="hasValidDetailUrl(item)"
                  class="event-card is-linked"
                  :href="item.detailUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div class="event-card__media">
                    <img
                      class="event-card__img"
                      :src="item.imageSrc"
                      :alt="item.imageAlt"
                      :width="item.imageWidth"
                      :height="item.imageHeight"
                      :style="{ objectPosition: item.imageObjectPosition ?? '50% 25%' }"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-if="item.isPlaceholder" class="event-card__badge">
                      {{ FEATURED_EVENTS_SECTION.placeholderBadge }}
                    </span>
                  </div>
                  <h3 class="event-card__title">{{ item.title }}</h3>
                </a>

                <article v-else class="event-card is-static">
                  <div class="event-card__media">
                    <img
                      class="event-card__img"
                      :src="item.imageSrc"
                      :alt="item.imageAlt"
                      :width="item.imageWidth"
                      :height="item.imageHeight"
                      :style="{ objectPosition: item.imageObjectPosition ?? '50% 25%' }"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-if="item.isPlaceholder" class="event-card__badge">
                      {{ FEATURED_EVENTS_SECTION.placeholderBadge }}
                    </span>
                  </div>
                  <h3 class="event-card__title">{{ item.title }}</h3>
                </article>
              </div>
            </div>

            <!-- Bản sao nối vòng lặp liền mạch — ẩn hoàn toàn khỏi screen reader và thứ tự Tab -->
            <div
              v-if="shouldClone"
              ref="cloneSetRef"
              class="featured-events__set is-clone"
              aria-hidden="true"
              inert
            >
              <div
                v-for="item in FEATURED_EVENTS"
                :key="`clone-${item.id}`"
                class="featured-events__slot"
              >
                <a
                  v-if="hasValidDetailUrl(item)"
                  class="event-card is-linked"
                  :href="item.detailUrl"
                  tabindex="-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div class="event-card__media">
                    <img
                      class="event-card__img"
                      :src="item.imageSrc"
                      alt=""
                      :width="item.imageWidth"
                      :height="item.imageHeight"
                      :style="{ objectPosition: item.imageObjectPosition ?? '50% 25%' }"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-if="item.isPlaceholder" class="event-card__badge">
                      {{ FEATURED_EVENTS_SECTION.placeholderBadge }}
                    </span>
                  </div>
                  <p class="event-card__title">{{ item.title }}</p>
                </a>

                <div v-else class="event-card is-static">
                  <div class="event-card__media">
                    <img
                      class="event-card__img"
                      :src="item.imageSrc"
                      alt=""
                      :width="item.imageWidth"
                      :height="item.imageHeight"
                      :style="{ objectPosition: item.imageObjectPosition ?? '50% 25%' }"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-if="item.isPlaceholder" class="event-card__badge">
                      {{ FEATURED_EVENTS_SECTION.placeholderBadge }}
                    </span>
                  </div>
                  <p class="event-card__title">{{ item.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-events {
  background: var(--color-surface-white);
  border-top: var(--rule-hairline);
  padding-block: clamp(2.75rem, 4.5vw, 3.75rem) clamp(3.5rem, 5.5vw, 4.75rem);
  scroll-margin-top: calc(var(--header-height) + var(--space-xs));
}

.featured-events__stage {
  width: 100%;
  max-width: 62.5rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2rem);
}

.featured-events__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.featured-events__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.65vw + 0.875rem, 2.375rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  overflow-wrap: anywhere;
  min-width: 0;
}

.featured-events__viewport {
  margin-inline: calc(var(--page-gutter) * -1);
  padding-inline: var(--page-gutter);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.featured-events__viewport::-webkit-scrollbar {
  display: none;
}

.featured-events__viewport.is-manual {
  scroll-snap-type: none;
  scrollbar-width: thin;
}

.featured-events__track {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  width: max-content;
  padding-block: var(--space-2xs);
  will-change: transform;
}

.featured-events__viewport.is-static .featured-events__track {
  width: 100%;
  justify-content: center;
  will-change: auto;
}

.featured-events__set {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.featured-events__slot {
  flex: 0 0 clamp(14.5rem, 68vw, 17.5rem);
  scroll-snap-align: start;
  min-width: 0;
}

.event-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-ink);
  text-decoration: none;
  border-radius: var(--radius-sm);
  min-width: 0;
}

.event-card__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 15;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-paper-2);
  border: var(--rule-hairline);
  transition:
    transform var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out);
}

.event-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-long) var(--ease-out);
}

.event-card__badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  padding: var(--space-3xs) var(--space-xs);
  border-radius: var(--radius-pill);
  background: var(--color-stage-badge-bg);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
}

.event-card__title {
  margin: 0;
  padding-inline: var(--space-2xs);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.45;
  text-align: center;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

@media (hover: hover) and (pointer: fine) {
  .event-card.is-linked:hover .event-card__media {
    transform: translateY(-2px);
    border-color: var(--color-ink-2);
  }

  .event-card.is-linked:hover .event-card__img {
    transform: scale(1.03);
  }
}

/* Desktop (>= 48rem): ~300px (18.75rem) per card -> sees ~3 cards at once inside 1000px stage */
@media (min-width: 48rem) {
  .featured-events__viewport {
    margin-inline: 0;
    padding-inline: 0;
  }

  .featured-events__viewport.is-masked {
    mask-image: linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
  }

  .featured-events__track,
  .featured-events__set {
    gap: 1.75rem;
  }

  .featured-events__slot {
    flex: 0 0 18.75rem;
  }

  .event-card__title {
    font-size: var(--text-base);
  }
}

@media (prefers-reduced-motion: reduce) {
  .featured-events__track {
    transform: none !important;
    will-change: auto;
  }
}
</style>

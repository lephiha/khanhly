<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Play } from 'lucide-vue-next'
import { VIDEO_SERIES, VIDEO_SERIES_SECTION, type VideoSeriesItem } from '../config/siteContent'

interface RenderedSlide {
  key: string
  slotIndex: number
  logicalIndex: number
  isClone: boolean
  item: VideoSeriesItem
}

const TOTAL = VIDEO_SERIES.length
const CLONE_COUNT = TOTAL // 7 bản sao đầu + 7 thẻ gốc + 7 bản sao cuối => lặp liền mạch từ Reel 7 sang Reel 1

const shellRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const slideRefs = ref<HTMLElement[]>([])

const isReducedMotion = ref(false)
const isHovered = ref(false)
const isFocusWithin = ref(false)
const isSwiping = ref(false)
const isPageHidden = ref(false)

// Vị trí bắt đầu ở thẻ gốc đầu tiên (slotIndex = CLONE_COUNT = 7 => hiển thị từ Reel 1)
const trackIndex = ref(CLONE_COUNT)
const isAnimated = ref(false)
const stridePx = ref(0)
const dragOffsetPx = ref(0)
const visibleCardsCount = ref(4)
const arrowTopPx = ref(200)

let autoTimerId: number | null = null
let normalizeFallbackId: number | null = null
let resizeObserver: ResizeObserver | null = null
let reducedMotionMql: MediaQueryList | null = null

let touchStartX = 0
let touchStartY = 0
let touchAxisLocked: 'x' | 'y' | null = null
let suppressClickUntil = 0

const renderedSlides = computed<RenderedSlide[]>(() => {
  if (isReducedMotion.value) {
    return VIDEO_SERIES.map((item, idx) => ({
      key: `real-${item.reelId}`,
      slotIndex: idx,
      logicalIndex: idx,
      isClone: false,
      item,
    }))
  }

  const slides: RenderedSlide[] = []
  // 1. Bản sao phía trước (R1..R7)
  for (let i = 0; i < CLONE_COUNT; i++) {
    const item = VIDEO_SERIES[i]!
    slides.push({
      key: `pre-${i}-${item.reelId}`,
      slotIndex: slides.length,
      logicalIndex: i,
      isClone: true,
      item,
    })
  }
  // 2. Dải 7 thẻ gốc chính thức (R1..R7)
  for (let i = 0; i < TOTAL; i++) {
    const item = VIDEO_SERIES[i]!
    slides.push({
      key: `real-${i}-${item.reelId}`,
      slotIndex: slides.length,
      logicalIndex: i,
      isClone: false,
      item,
    })
  }
  // 3. Bản sao phía sau (R1..R7)
  for (let i = 0; i < CLONE_COUNT; i++) {
    const item = VIDEO_SERIES[i]!
    slides.push({
      key: `post-${i}-${item.reelId}`,
      slotIndex: slides.length,
      logicalIndex: i,
      isClone: true,
      item,
    })
  }
  return slides
})

const activeLogicalIndex = computed(() => {
  return (((trackIndex.value - CLONE_COUNT) % TOTAL) + TOTAL) % TOTAL
})

const isAutoAdvanceActive = computed(() => {
  return (
    !isReducedMotion.value &&
    !isHovered.value &&
    !isFocusWithin.value &&
    !isSwiping.value &&
    !isPageHidden.value &&
    TOTAL > 1
  )
})

const trackStyle = computed(() => {
  if (isReducedMotion.value) {
    return {}
  }
  const offset = -(trackIndex.value * stridePx.value) + dragOffsetPx.value
  return {
    transform: `translate3d(${offset.toFixed(3)}px, 0, 0)`,
    transition:
      isAnimated.value && !isSwiping.value
        ? 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1)'
        : 'none',
  }
})

function hasCover(item: VideoSeriesItem): item is VideoSeriesItem & { coverSrc: string } {
  return typeof item.coverSrc === 'string' && item.coverSrc.trim().length > 0
}

function measureLayout() {
  if (typeof window === 'undefined') return

  if (window.innerWidth >= 1216) {
    visibleCardsCount.value = 4
  } else if (window.innerWidth >= 928) {
    visibleCardsCount.value = 3
  } else if (window.innerWidth >= 640) {
    visibleCardsCount.value = 2
  } else {
    visibleCardsCount.value = 1
  }

  const vpEl = viewportRef.value
  const cardEl = vpEl?.querySelector('.series-card') as HTMLElement | null
  if (vpEl && cardEl) {
    arrowTopPx.value = Math.round(vpEl.offsetTop + cardEl.offsetHeight / 2)
  }

  if (isReducedMotion.value) return

  const trackEl = trackRef.value
  const els = slideRefs.value
  if (!trackEl || els.length < CLONE_COUNT + TOTAL) return

  // Đo khoảng cách chính xác (gồm cả subpixel) giữa slot [CLONE_COUNT] và [CLONE_COUNT + TOTAL] chia đều cho TOTAL
  const firstReal = els[CLONE_COUNT]
  const firstPostClone = els[CLONE_COUNT + TOTAL]
  if (firstReal && firstPostClone) {
    const exactSpan =
      firstPostClone.getBoundingClientRect().left - firstReal.getBoundingClientRect().left
    if (exactSpan > 0) {
      stridePx.value = exactSpan / TOTAL
      return
    }
  }

  if (els[0] && els[1]) {
    stridePx.value = els[1].offsetLeft - els[0].offsetLeft
  }
}

function clearAutoTimer() {
  if (autoTimerId !== null) {
    window.clearInterval(autoTimerId)
    autoTimerId = null
  }
}

function resetAutoTimer() {
  clearAutoTimer()
  if (!isAutoAdvanceActive.value) return
  autoTimerId = window.setInterval(() => {
    stepCarousel(1)
  }, VIDEO_SERIES_SECTION.autoAdvanceMs)
}

/**
 * Đưa trackIndex từ vùng clone về đúng vùng thẻ gốc tương ứng [CLONE_COUNT .. CLONE_COUNT + TOTAL - 1]
 * với transition = none để nối liền mạch từ Reel 7 sang Reel 1 không giật hình.
 */
function normalizeTrackInstant() {
  if (normalizeFallbackId !== null) {
    window.clearTimeout(normalizeFallbackId)
    normalizeFallbackId = null
  }
  if (isReducedMotion.value) return

  if (trackIndex.value < CLONE_COUNT || trackIndex.value >= CLONE_COUNT + TOTAL) {
    const canonical = CLONE_COUNT + activeLogicalIndex.value
    isAnimated.value = false
    trackIndex.value = canonical
  }
}

function scheduleNormalizeFallback() {
  if (normalizeFallbackId !== null) {
    window.clearTimeout(normalizeFallbackId)
  }
  normalizeFallbackId = window.setTimeout(() => {
    normalizeTrackInstant()
  }, 580)
}

function stepCarousel(delta: -1 | 1, manual = false) {
  if (isReducedMotion.value) {
    const vp = viewportRef.value
    if (!vp) return
    const firstSlide = slideRefs.value[0]
    const secondSlide = slideRefs.value[1]
    const step =
      firstSlide && secondSlide
        ? secondSlide.offsetLeft - firstSlide.offsetLeft
        : vp.clientWidth * 0.85
    vp.scrollBy({ left: delta * step, behavior: 'auto' })
    return
  }

  if (
    (delta > 0 && trackIndex.value >= CLONE_COUNT + TOTAL * 2 - visibleCardsCount.value) ||
    (delta < 0 && trackIndex.value <= 1)
  ) {
    normalizeTrackInstant()
    void trackRef.value?.offsetHeight
  }

  isAnimated.value = true
  trackIndex.value += delta
  scheduleNormalizeFallback()

  if (manual) {
    resetAutoTimer()
  }
}

function onTrackTransitionEnd(event: TransitionEvent) {
  if (event.target !== trackRef.value || event.propertyName !== 'transform') return
  normalizeTrackInstant()
}

function onShellFocusIn() {
  isFocusWithin.value = true
}

function onShellFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null
  if (shellRef.value && nextTarget && shellRef.value.contains(nextTarget)) {
    return
  }
  isFocusWithin.value = false
}

function onRealCardFocus(logicalIdx: number) {
  if (isReducedMotion.value) return
  if (viewportRef.value && viewportRef.value.scrollLeft !== 0) {
    viewportRef.value.scrollLeft = 0
  }

  const canonical = CLONE_COUNT + logicalIdx
  const start = trackIndex.value
  const end = start + visibleCardsCount.value - 1
  if (canonical < start || canonical > end) {
    isAnimated.value = true
    trackIndex.value = canonical
    scheduleNormalizeFallback()
  }
}

function onTouchStart(event: TouchEvent) {
  if (isReducedMotion.value || event.touches.length !== 1) return
  const touch = event.touches[0]!
  normalizeTrackInstant()
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchAxisLocked = null
  isSwiping.value = true
  isAnimated.value = false
  dragOffsetPx.value = 0
}

function onTouchMove(event: TouchEvent) {
  if (!isSwiping.value || isReducedMotion.value || event.touches.length !== 1) return
  const touch = event.touches[0]!
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY

  if (!touchAxisLocked) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    touchAxisLocked = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
  }

  if (touchAxisLocked === 'y') {
    isSwiping.value = false
    dragOffsetPx.value = 0
    return
  }

  if (event.cancelable) {
    event.preventDefault()
  }
  dragOffsetPx.value = dx
}

function onTouchEnd() {
  if (!isSwiping.value || isReducedMotion.value) return
  const dx = dragOffsetPx.value
  isSwiping.value = false
  dragOffsetPx.value = 0

  if (Math.abs(dx) > 12) {
    suppressClickUntil = performance.now() + 320
  }

  const threshold = Math.min(56, Math.max(28, stridePx.value * 0.16))
  if (dx <= -threshold) {
    stepCarousel(1, true)
  } else if (dx >= threshold) {
    stepCarousel(-1, true)
  } else {
    isAnimated.value = true
    resetAutoTimer()
  }
}

function onCardClick(event: MouseEvent) {
  if (performance.now() < suppressClickUntil) {
    event.preventDefault()
  }
}

function onVisibilityChange() {
  isPageHidden.value = document.hidden
  if (!document.hidden) {
    normalizeTrackInstant()
  }
}

function syncReducedMotion() {
  isReducedMotion.value = Boolean(reducedMotionMql?.matches)
  isAnimated.value = false
  trackIndex.value = isReducedMotion.value ? 0 : CLONE_COUNT
  nextTick(() => {
    measureLayout()
    resetAutoTimer()
  })
}

watch(isAutoAdvanceActive, () => {
  resetAutoTimer()
})

onMounted(() => {
  reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReducedMotion.value = reducedMotionMql.matches
  isPageHidden.value = document.hidden

  reducedMotionMql.addEventListener('change', syncReducedMotion)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', measureLayout, { passive: true })

  nextTick(() => {
    measureLayout()
    resetAutoTimer()
    if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
      resizeObserver = new ResizeObserver(() => {
        isAnimated.value = false
        measureLayout()
      })
      resizeObserver.observe(viewportRef.value)
    }
  })
})

onBeforeUnmount(() => {
  clearAutoTimer()
  if (normalizeFallbackId !== null) {
    window.clearTimeout(normalizeFallbackId)
  }
  reducedMotionMql?.removeEventListener('change', syncReducedMotion)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', measureLayout)
  resizeObserver?.disconnect()
})
</script>

<template>
  <section
    :id="VIDEO_SERIES_SECTION.id"
    class="video-series"
    aria-labelledby="video-series-heading"
  >
    <div class="video-series__curtain" aria-hidden="true"></div>

    <div class="container video-series__inner">
      <header class="video-series__head">
        <h2 id="video-series-heading" class="video-series__title">
          {{ VIDEO_SERIES_SECTION.heading }}
        </h2>
      </header>

      <div
        ref="shellRef"
        class="video-series__shell"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @focusin="onShellFocusIn"
        @focusout="onShellFocusOut"
      >
        <div class="video-series__stage" :style="{ '--arrow-top': `${arrowTopPx}px` }">
          <!-- Nút mũi tên Trái -->
          <button
            type="button"
            class="video-series__arrow video-series__arrow--prev"
            :aria-label="VIDEO_SERIES_SECTION.prevLabel"
            @click="stepCarousel(-1, true)"
          >
            <ChevronLeft :size="20" :stroke-width="1.9" aria-hidden="true" />
          </button>

          <!-- Khung hiển thị thẻ dọc 9:16: 4 thẻ (desktop rộng) · 3 thẻ (desktop hẹp) · 2 thẻ (tablet) · 1 thẻ vuốt ngang (mobile) -->
          <div
            ref="viewportRef"
            class="video-series__viewport"
            :class="{ 'is-manual': isReducedMotion }"
            @touchstart.passive="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @touchcancel="onTouchEnd"
          >
            <div
              ref="trackRef"
              class="video-series__track"
              :class="{ 'is-manual': isReducedMotion }"
              :style="trackStyle"
              @transitionend="onTrackTransitionEnd"
            >
              <div
                v-for="slide in renderedSlides"
                :key="slide.key"
                ref="slideRefs"
                class="video-series__slide"
                :data-logical-index="slide.logicalIndex"
                :data-clone="slide.isClone ? 'true' : 'false'"
                :aria-hidden="slide.isClone ? 'true' : undefined"
              >
                <a
                  class="series-card"
                  :href="slide.item.reelUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  :tabindex="slide.isClone ? -1 : undefined"
                  :data-reel-id="slide.item.reelId"
                  :aria-label="
                    slide.isClone
                      ? undefined
                      : `${slide.item.title} · ${VIDEO_SERIES_SECTION.readyActionLabel}`
                  "
                  @focus="!slide.isClone && onRealCardFocus(slide.logicalIndex)"
                  @click="onCardClick"
                >
                  <img
                    v-if="hasCover(slide.item)"
                    class="series-card__poster"
                    :src="slide.item.coverSrc"
                    :alt="slide.isClone ? '' : slide.item.coverAlt"
                    :width="slide.item.coverWidth"
                    :height="slide.item.coverHeight"
                    :style="{ objectPosition: slide.item.coverObjectPosition ?? '50% 50%' }"
                    loading="eager"
                    decoding="sync"
                  />

                  <div v-else class="series-card__fallback">
                    <span class="series-card__fallback-badge">
                      {{ VIDEO_SERIES_SECTION.missingCoverBadge }}
                    </span>
                  </div>

                  <!-- Nút Play hồng ở góc trên bên phải -->
                  <span class="series-card__play" aria-hidden="true">
                    <Play class="series-card__play-icon" :size="14" :stroke-width="2" />
                  </span>

                  <!-- Lớp nền tối nhẹ ở chân ảnh -->
                  <div class="series-card__scrim" aria-hidden="true"></div>

                  <!-- Tiêu đề nằm ở chân ảnh -->
                  <span class="series-card__caption">
                    <span class="series-card__title">{{ slide.item.title }}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <!-- Nút mũi tên Phải -->
          <button
            type="button"
            class="video-series__arrow video-series__arrow--next"
            :aria-label="VIDEO_SERIES_SECTION.nextLabel"
            @click="stepCarousel(1, true)"
          >
            <ChevronRight :size="20" :stroke-width="1.9" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.video-series {
  --vs-lift-max: -0.625rem;
  position: relative;
  z-index: calc(var(--z-base) + 1);
  background: var(--color-surface-bright);
  padding-block: clamp(2.5rem, 4vw, 3.25rem) clamp(2.25rem, 3.5vw, 3rem);
  scroll-margin-top: calc(var(--header-height) + 0.625rem + var(--space-2xs));
}

/* Tấm nền sáng trượt lên che dần mép dưới Hero, đi cùng nhịp với tiêu đề và dải thumbnail */
.video-series__curtain {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--color-surface-bright);
  border-top: var(--rule-hairline);
  transform: translate3d(
    0,
    calc(var(--hero-handoff-p, 0) * var(--vs-lift-max, 0px)),
    0
  );
  will-change: transform;
  pointer-events: none;
}

.video-series__curtain::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: var(--shadow-sheet-overlap);
  clip-path: inset(-4rem 0 100% 0);
  opacity: var(--hero-handoff-p, 0);
  pointer-events: none;
}

.video-series__inner {
  position: relative;
  z-index: var(--z-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.5rem, 2.5vw, 2rem);
  transform: translate3d(
    0,
    calc(var(--hero-handoff-p, 0) * var(--vs-lift-max, 0px)),
    0
  );
  will-change: transform;
}

@media (min-width: 44rem) {
  .video-series {
    --vs-lift-max: -0.875rem;
    scroll-margin-top: calc(var(--header-height) + 0.875rem + var(--space-2xs));
  }
}

@media (min-width: 60rem) {
  .video-series {
    --vs-lift-max: -1.5rem;
    scroll-margin-top: calc(var(--header-height) + 1.5rem + var(--space-2xs));
  }
}

@media (prefers-reduced-motion: reduce) {
  .video-series {
    --vs-lift-max: 0px;
    scroll-margin-top: calc(var(--header-height) + var(--space-xs));
  }

  .video-series__curtain,
  .video-series__inner {
    transform: none !important;
    will-change: auto;
  }

  .video-series__curtain::after {
    display: none;
  }
}

.video-series__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.video-series__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.65vw + 0.875rem, 2.375rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

.video-series__shell {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Mobile-first (< 40rem / 640px): 1 thẻ dọc 9:16 căn giữa + vuốt ngang, chừa khoảng cho 2 nút mũi tên */
.video-series__stage {
  --cards-per-view: 1;
  --card-gap: 1rem;
  position: relative;
  width: 100%;
  max-width: 17.75rem;
  margin-inline: auto;
  padding-inline: 1.25rem;
}

.video-series__viewport {
  container-type: inline-size;
  width: 100%;
  overflow: hidden;
  padding-block: var(--space-2xs) var(--space-xs);
  touch-action: pan-y pinch-zoom;
}

.video-series__viewport.is-manual {
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  touch-action: auto;
  scrollbar-width: thin;
}

.video-series__track {
  display: flex;
  align-items: stretch;
  gap: var(--card-gap);
  will-change: transform;
}

.video-series__track.is-manual {
  will-change: auto;
}

.video-series__slide {
  flex: 0 0
    calc(
      (100% - (var(--cards-per-view) - 1) * var(--card-gap)) /
        var(--cards-per-view)
    );
  min-width: 0;
  scroll-snap-align: start;
}

/* Thẻ dọc 9:16 đồng bộ ngôn ngữ với khối 4 clip: bìa lấp đầy thẻ, play hồng góc trên phải, tiêu đề ở chân ảnh trên nền tối nhẹ */
.series-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-paper-3);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card);
  color: var(--color-stage-ink);
  text-decoration: none;
  user-select: none;
  -webkit-user-drag: none;
  transition:
    transform var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out);
}

.series-card__poster {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transition: transform var(--dur-long) var(--ease-out);
}

.series-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--space-md);
  background: var(--color-paper-blush);
}

.series-card__fallback-badge {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-ink-2);
}

.series-card__play {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: var(--z-raised);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-accent-ink);
  box-shadow: var(--shadow-play);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color var(--dur-short) var(--ease-out),
    transform var(--dur-short) var(--ease-out);
}

.series-card__play-icon {
  fill: currentColor;
  transform: translateX(1px);
}

.series-card__scrim {
  position: absolute;
  inset: 46% 0 0 0;
  background: linear-gradient(
    to top,
    var(--color-stage-scrim-strong) 0%,
    var(--color-stage-scrim-mid) 56%,
    transparent 100%
  );
  pointer-events: none;
}

.series-card__caption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-raised);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
}

.series-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem);
  font-weight: 500;
  line-height: 1.28;
  color: var(--color-stage-ink);
  text-align: left;
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

/* Hai nút mũi tên đặt ngay hai mép trái/phải, căn đúng tâm dọc của dải thẻ 9:16 */
.video-series__arrow {
  position: absolute;
  top: var(--arrow-top, 50%);
  z-index: var(--z-raised);
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-rule);
  background: var(--color-surface-white);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}

.video-series__arrow--prev {
  left: 0;
}

.video-series__arrow--next {
  right: 0;
}

.video-series__arrow:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (hover: hover) and (pointer: fine) {
  .series-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-ink-2);
  }

  .series-card:hover .series-card__poster {
    transform: scale(1.03);
  }

  .series-card:hover .series-card__play {
    background: var(--color-accent-hover);
    transform: scale(1.06);
  }

  .video-series__arrow:hover:not(:disabled) {
    background: var(--color-paper-2);
    border-color: var(--color-ink);
  }
}

.video-series__arrow:active:not(:disabled) {
  background: var(--color-paper-3);
}

/* Tablet (>= 40rem / 640px): hiển thị 2 thẻ dọc căn giữa */
@media (min-width: 40rem) {
  .video-series__stage {
    --cards-per-view: 2;
    --card-gap: 1.25rem;
    max-width: 30.25rem;
    padding-inline: 0;
  }

  .video-series__arrow--prev {
    left: 0;
    transform: translate(-50%, -50%);
  }

  .video-series__arrow--next {
    right: 0;
    transform: translate(50%, -50%);
  }
}

/* Desktop hẹp (>= 58rem / 928px): hiển thị 3 thẻ dọc căn giữa */
@media (min-width: 58rem) {
  .video-series__stage {
    --cards-per-view: 3;
    --card-gap: 1.375rem;
    max-width: 45rem;
  }
}

/* Desktop rộng (>= 76rem / 1216px): hiển thị 4 thẻ dọc căn giữa, đồng bộ bề rộng cột với 4 clip bên dưới */
@media (min-width: 76rem) {
  .video-series__stage {
    --cards-per-view: 4;
    --card-gap: 1.5rem;
    max-width: calc(4 * clamp(13rem, 15.6vw, 14.5rem) + 3 * 1.5rem);
  }
}
</style>

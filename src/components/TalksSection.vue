<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { TALKS_SECTION, TALKS_TOPICS, type TalkTopicItem } from '../config/siteContent'
import { navigateToContact } from '../composables/useContactNavigation'

const slotRefs = ref<HTMLElement[]>([])
const stackDepth = ref<number[]>(TALKS_TOPICS.map(() => 0))
const slotHeights = ref<number[]>(TALKS_TOPICS.map(() => 0))
const activePendingTopicId = ref<string | null>(null)

let rafId: number | null = null
let desktopQuery: MediaQueryList | null = null
let reducedMotionQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null

function hasValidHref(topic: TalkTopicItem): topic is TalkTopicItem & { contactHref: string } {
  return typeof topic.contactHref === 'string' && topic.contactHref.trim().length > 0
}

function hasConfirmedMeta(topic: TalkTopicItem): boolean {
  return Boolean(topic.programName?.trim() || topic.duration?.trim())
}

function handleTopicAction(topic: TalkTopicItem) {
  if (hasValidHref(topic)) return
  activePendingTopicId.value = topic.id
}

function measureSlotHeights() {
  slotHeights.value = TALKS_TOPICS.map((_, idx) => {
    const el = slotRefs.value[idx]
    return el ? Math.round(el.offsetHeight) : 0
  })
}

function computeStackDepth() {
  rafId = null

  if (!desktopQuery?.matches || reducedMotionQuery?.matches) {
    if (stackDepth.value.some((v) => v !== 0)) {
      stackDepth.value = TALKS_TOPICS.map(() => 0)
    }
    return
  }

  const slots = slotRefs.value
  const pairOverlaps = TALKS_TOPICS.map((_, idx) => {
    const current = slots[idx]
    const next = slots[idx + 1]
    if (!current || !next) return 0

    const currentRect = current.getBoundingClientRect()
    const nextRect = next.getBoundingClientRect()
    const startOverlapY = currentRect.bottom
    const endOverlapY = currentRect.top + 20
    const span = Math.max(startOverlapY - endOverlapY, 1)
    const raw = (startOverlapY - nextRect.top) / span
    return Math.max(0, Math.min(1, raw))
  })

  const cumulativeDepth = TALKS_TOPICS.map((_, idx) => {
    let sum = 0
    for (let k = idx; k < pairOverlaps.length; k += 1) {
      sum += pairOverlaps[k] ?? 0
    }
    return Number(sum.toFixed(3))
  })

  stackDepth.value = cumulativeDepth
}

function scheduleDepthUpdate() {
  if (rafId === null) {
    rafId = window.requestAnimationFrame(computeStackDepth)
  }
}

function onViewportResize() {
  measureSlotHeights()
  scheduleDepthUpdate()
}

onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 60rem)')
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('scroll', scheduleDepthUpdate, { passive: true })
  window.addEventListener('resize', onViewportResize, { passive: true })

  nextTick(() => {
    measureSlotHeights()
    scheduleDepthUpdate()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureSlotHeights()
        scheduleDepthUpdate()
      })
      for (const el of slotRefs.value) {
        if (el) resizeObserver.observe(el)
      }
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleDepthUpdate)
  window.removeEventListener('resize', onViewportResize)
  resizeObserver?.disconnect()
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId)
  }
})
</script>

<template>
  <section :id="TALKS_SECTION.id" class="talks" aria-labelledby="talks-heading">
    <div class="container talks__inner">
      <header class="talks__head">
        <h2 id="talks-heading" class="talks__title">
          {{ TALKS_SECTION.heading }}
        </h2>
        <p v-if="TALKS_SECTION.subtitle" class="talks__subtitle">
          {{ TALKS_SECTION.subtitle }}
        </p>
      </header>

      <div class="talks__stack">
        <div
          v-for="(topic, index) in TALKS_TOPICS"
          :key="topic.id"
          ref="slotRefs"
          class="talks__card-slot"
          :style="{
            '--card-index': String(index),
            '--stack-depth': String(stackDepth[index] ?? 0),
            '--slot-height': slotHeights[index] ? `${slotHeights[index]}px` : undefined,
          }"
        >
          <article
            class="talk-card"
            :class="{
              'is-alt': index % 2 === 1,
              'talk-card--wide': topic.mediaLayout === 'wide',
            }"
          >
            <div class="talk-card__veil" aria-hidden="true"></div>

            <!-- 1 & 2. Tiêu đề chủ đề + Mô tả ngắn -->
            <div class="talk-card__intro">
              <p v-if="hasConfirmedMeta(topic)" class="talk-card__meta">
                <span v-if="topic.programName?.trim()" class="talk-card__program">
                  {{ topic.programName }}
                </span>
                <span
                  v-if="topic.programName?.trim() && topic.duration?.trim()"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span v-if="topic.duration?.trim()">{{ topic.duration }}</span>
              </p>

              <h3 class="talk-card__title">{{ topic.title }}</h3>
              <p class="talk-card__desc">{{ topic.description }}</p>

              <p v-if="topic.confirmedOutcome?.trim()" class="talk-card__outcome">
                {{ topic.confirmedOutcome }}
              </p>
            </div>

            <!-- 3. Nội dung chính: Người tham dự nhận được gì / Nội dung thực hành -->
            <div class="talk-card__takeaways">
              <p class="talk-card__takeaways-head">
                {{ topic.takeawaysHeading ?? TALKS_SECTION.takeawaysHeading }}
              </p>
              <ul class="talk-card__list">
                <li
                  v-for="(point, pIdx) in topic.takeaways"
                  :key="pIdx"
                  class="talk-card__list-item"
                >
                  <ArrowRight
                    class="talk-card__list-icon"
                    :size="16"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>

            <!-- 4. Ảnh dọc (Thẻ 1 & 2) hoặc hàng ảnh ngang rộng nguyên tỷ lệ gốc (Thẻ 3 Workshop) -->
            <figure class="talk-card__media">
              <img
                class="talk-card__img"
                :src="topic.imageSrc"
                :alt="topic.imageAlt"
                :width="topic.imageWidth"
                :height="topic.imageHeight"
                :style="
                  topic.mediaLayout === 'wide'
                    ? undefined
                    : { objectPosition: topic.imageObjectPosition ?? '50% 28%' }
                "
                loading="lazy"
                decoding="async"
                @load="measureSlotHeights"
              />
              <span v-if="topic.isPlaceholderImage" class="talk-card__badge">
                {{ TALKS_SECTION.placeholderBadge }}
              </span>
            </figure>

            <!-- 5. Nút liên hệ -->
            <div class="talk-card__cta">
              <div class="talk-card__cta-row">
                <span v-if="topic.fee?.trim()" class="talk-card__fee">
                  {{ topic.fee }}
                </span>

                <a
                  v-if="hasValidHref(topic)"
                  class="talk-btn"
                  :href="topic.contactHref"
                  @click="navigateToContact(topic.contactTopic, $event)"
                >
                  <span class="talk-btn__label">{{ topic.ctaLabel ?? TALKS_SECTION.ctaLabel }}</span>
                  <span class="talk-btn__icon" aria-hidden="true">
                    <ArrowRight :size="16" :stroke-width="2" />
                  </span>
                </a>

                <button
                  v-else
                  type="button"
                  class="talk-btn"
                  data-connection="pending"
                  :aria-describedby="
                    activePendingTopicId === topic.id ? `talk-pending-${topic.id}` : undefined
                  "
                  :title="TALKS_SECTION.pendingHint"
                  @click="handleTopicAction(topic)"
                >
                  <span class="talk-btn__label">{{ topic.ctaLabel ?? TALKS_SECTION.ctaLabel }}</span>
                  <span class="talk-btn__icon" aria-hidden="true">
                    <ArrowRight :size="16" :stroke-width="2" />
                  </span>
                </button>
              </div>

              <p
                v-if="activePendingTopicId === topic.id"
                :id="`talk-pending-${topic.id}`"
                class="talk-card__pending is-visible"
                role="status"
                aria-live="polite"
              >
                <span class="talk-card__pending-dot" aria-hidden="true"></span>
                <span>
                  Đang chờ kết nối phần Liên hệ cho chủ đề “{{ topic.title }}”.
                </span>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.talks {
  background: var(--color-surface-bright);
  border-top: var(--rule-hairline);
  padding-block: clamp(3rem, 5vw, 4.5rem) clamp(4rem, 7vw, 6rem);
  scroll-margin-top: calc(var(--header-height) + var(--space-xs));
}

.talks__inner {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 1.8vw, 1.5rem);
}

.talks__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  max-width: 44rem;
}

.talks__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 1.8vw + 0.9rem, 2.5rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  overflow-wrap: anywhere;
  min-width: 0;
}

.talks__subtitle {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-ink-2);
  max-width: 54ch;
}

/* Mobile-first & reduced-motion baseline: vertical non-overlapping stack */
.talks__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.talks__card-slot {
  position: relative;
}

/* Mobile reading order (portrait cards): intro -> takeaways -> media -> cta */
.talk-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'intro'
    'takeaways'
    'media'
    'cta';
  gap: var(--space-lg);
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border-radius: var(--radius-lg);
  background: var(--color-talks-card);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card), var(--edge-highlight);
  overflow: hidden;
  transform-origin: top center;
}

/* Thẻ có ảnh tập thể ngang: đặt hàng ảnh rộng ngay bên dưới toàn bộ nội dung thẻ */
.talk-card--wide {
  grid-template-areas:
    'intro'
    'takeaways'
    'cta'
    'media';
}

.talk-card.is-alt {
  background: var(--color-talks-card-alt);
}

.talk-card__veil {
  position: absolute;
  inset: 0;
  background: var(--color-stack-veil);
  opacity: 0;
  pointer-events: none;
  z-index: var(--z-raised);
}

.talk-card__intro {
  grid-area: intro;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  min-width: 0;
}

.talk-card__meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.talk-card__program {
  color: var(--color-ink);
}

.talk-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.5vw + 0.95rem, 2.25rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

.talk-card__desc {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.62;
  color: var(--color-ink-2);
  max-width: 44ch;
}

.talk-card__outcome {
  margin: var(--space-2xs) 0 0;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-ink);
}

.talk-card__takeaways {
  grid-area: takeaways;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: var(--rule-hairline);
  min-width: 0;
}

.talk-card__takeaways-head {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.talk-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.talk-card__list-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: var(--space-sm);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.55;
  color: var(--color-ink);
}

.talk-card__list-icon {
  color: var(--color-accent);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

/* Mặc định (Thẻ 1 & Thẻ 2): giữ khung ảnh dọc 3:4 cả trên mobile lẫn desktop */
.talk-card__media {
  grid-area: media;
  position: relative;
  margin: 0;
  width: 100%;
  max-width: 23rem;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-paper-3);
  border: var(--rule-hairline);
}

.talk-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Thẻ 3 (Workshop tập luyện FitX): hàng ảnh rộng toàn bề ngang thẻ, giữ nguyên tỷ lệ ngang gốc 1024×683, thấy đủ người hai mép */
.talk-card--wide .talk-card__media {
  max-width: none;
  width: 100%;
  aspect-ratio: auto;
}

.talk-card--wide .talk-card__img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.talk-card__badge {
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

.talk-card__cta {
  grid-area: cta;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-xs);
  min-width: 0;
}

.talk-card__cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
}

.talk-card__fee {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.talk-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  min-height: 3rem;
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-lg);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-ink);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.talk-btn__label {
  white-space: nowrap;
}

.talk-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  flex-shrink: 0;
  transition: transform var(--dur-short) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .talk-btn:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    transform: translateY(-1.5px);
  }

  .talk-btn:hover .talk-btn__icon {
    transform: translateX(2px);
  }
}

.talk-btn:active {
  transform: translateY(0);
  background: var(--color-accent-active);
}

.talk-card__pending {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-xs);
  min-height: 1.125rem;
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.45;
  color: var(--color-ink-2);
}

.talk-card__pending-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
  transform: translateY(-1px);
}

@media (min-width: 30rem) {
  .talk-btn {
    width: auto;
    justify-content: center;
  }
}

/* Desktop (>= 60rem): natural scroll sticky-stacking; thẻ cao hơn khung nhìn tự cuộn tiếp để thấy trọn ảnh ngang */
@media (min-width: 60rem) {
  .talks__stack {
    gap: clamp(5rem, 11vh, 7.5rem);
    padding-bottom: clamp(2rem, 5vh, 3.5rem);
  }

  .talks__card-slot {
    position: sticky;
    top: min(
      calc(var(--header-height) + 1.5rem + (var(--card-index, 0) * 1.25rem)),
      calc(100dvh - var(--slot-height, 32rem) - 1.5rem)
    );
    z-index: calc(var(--z-base) + var(--card-index, 0));
  }

  .talk-card {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr) minmax(0, 0.76fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      'intro     takeaways media'
      'cta       takeaways media';
    column-gap: clamp(2rem, 3.2vw, 3.25rem);
    row-gap: var(--space-xl);
    align-items: start;
    padding: clamp(2rem, 3vw, 2.75rem);
    box-shadow: var(--shadow-stack), var(--edge-highlight);
    transform: scale(calc(1 - (var(--stack-depth, 0) * 0.022)));
    will-change: transform;
  }

  /* Thẻ 3 (Workshop tập luyện FitX): phần chữ + nút chia 2 cột phía trên, hàng ảnh tập thể rộng toàn chiều ngang thẻ bên dưới */
  .talk-card--wide {
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'intro     takeaways'
      'cta       takeaways'
      'media     media';
    row-gap: clamp(1.5rem, 2.5vw, 2rem);
  }

  .talk-card__veil {
    opacity: clamp(0, calc(var(--stack-depth, 0) * 0.75), 1);
  }

  .talk-card__takeaways {
    padding-top: 0;
    padding-inline-start: clamp(1.5rem, 2.5vw, 2.5rem);
    border-top: 0;
    border-inline-start: var(--rule-hairline);
    align-self: stretch;
  }

  .talk-card__media {
    max-width: none;
    aspect-ratio: 3 / 4;
    align-self: center;
  }

  .talk-card--wide .talk-card__media {
    aspect-ratio: auto;
    align-self: stretch;
  }

  .talk-card__cta {
    align-self: end;
  }
}

/* Reduced motion: disable sticky overlap & scaling; stack cards vertically in clean reading order */
@media (prefers-reduced-motion: reduce) {
  .talks__stack {
    gap: var(--space-xl);
    padding-bottom: 0;
  }

  .talks__card-slot {
    position: relative;
    top: auto;
  }

  .talk-card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    grid-template-areas:
      'intro'
      'takeaways'
      'media'
      'cta';
    transform: none !important;
    will-change: auto;
  }

  .talk-card--wide {
    grid-template-areas:
      'intro'
      'takeaways'
      'cta'
      'media';
  }

  .talk-card__takeaways {
    padding-inline-start: 0;
    padding-top: var(--space-md);
    border-inline-start: 0;
    border-top: var(--rule-hairline);
  }

  .talk-card__media {
    max-width: 23rem;
    aspect-ratio: 3 / 4;
  }

  .talk-card--wide .talk-card__media {
    max-width: none;
    aspect-ratio: auto;
  }

  .talk-card__veil {
    display: none;
  }
}
</style>

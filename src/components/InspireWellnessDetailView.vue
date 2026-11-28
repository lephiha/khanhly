<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import {
  INSPIRE_WELLNESS_BASE_PATH,
  INSPIRE_WELLNESS_PAGE_COPY,
  buildFacebookReelEmbedUrl,
  findInspireWellnessEpisodeBySlug,
} from '../config/inspireWellness'
import { navigateApp } from '../composables/useAppRouter'
import InspireWellnessCompanionSection from './InspireWellnessCompanionSection.vue'

const props = defineProps<{
  slug: string
}>()

const headerOffsetPx = ref(72)
let headerResizeObserver: ResizeObserver | null = null

const episode = computed(() => findInspireWellnessEpisodeBySlug(props.slug))

const embedUrl = computed(() => {
  if (!episode.value) return ''
  return buildFacebookReelEmbedUrl(episode.value.reelUrl)
})

function measureHeaderOffset() {
  if (typeof document === 'undefined') return
  const headerEl = document.querySelector<HTMLElement>('.site-header')
  if (!headerEl) return
  const h = Math.floor(headerEl.getBoundingClientRect().height)
  if (h > 0) {
    headerOffsetPx.value = h
  }
}

onMounted(() => {
  window.addEventListener('resize', measureHeaderOffset, { passive: true })
  nextTick(() => {
    measureHeaderOffset()
    if (typeof ResizeObserver !== 'undefined') {
      const headerEl = document.querySelector<HTMLElement>('.site-header')
      if (headerEl) {
        headerResizeObserver = new ResizeObserver(measureHeaderOffset)
        headerResizeObserver.observe(headerEl)
      }
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureHeaderOffset)
  headerResizeObserver?.disconnect()
})
</script>

<template>
  <main
    id="main-content"
    class="wellness-detail"
    :style="{ '--detail-header-height': `${headerOffsetPx}px` }"
    tabindex="-1"
  >
    <section class="wellness-detail__section" aria-labelledby="wellness-detail-heading">
      <div class="container wellness-detail__inner">
        <!-- Dùng chung đúng 1 cây DOM / 1 iframe cho cả mobile lẫn desktop, render ngay khi mở trang -->
        <article v-if="episode" class="detail-grid">
          <!-- Điều hướng quay lại thư viện (Desktop: hàng đầu toàn chiều ngang; Mobile: ngay dưới khung video ghim) -->
          <nav class="wellness-detail__breadcrumb" aria-label="Điều hướng quay lại">
            <a
              class="wellness-detail__back"
              :href="INSPIRE_WELLNESS_BASE_PATH"
              @click="navigateApp(INSPIRE_WELLNESS_BASE_PATH, $event)"
            >
              <ArrowLeft :size="16" :stroke-width="2" aria-hidden="true" />
              <span>{{ INSPIRE_WELLNESS_PAGE_COPY.backToLibraryLabel }}</span>
            </a>

            <!-- Link dự phòng mở trực tiếp trên Facebook đặt cạnh nút quay lại trên mobile -->
            <a
              class="wellness-detail__mobile-fb"
              :href="episode.reelUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ INSPIRE_WELLNESS_PAGE_COPY.watchOnFacebookLabel }}</span>
              <ArrowUpRight :size="14" :stroke-width="2" aria-hidden="true" />
            </a>
          </nav>

          <!-- Khung phát video 9:16: render trực tiếp iframe Facebook Reel ngay khi mở trang (không tự phát) -->
          <div class="detail-grid__player">
            <div class="detail-player__frame">
              <iframe
                :key="episode.slug"
                class="detail-player__iframe"
                :src="embedUrl"
                :title="episode.title"
                allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowfullscreen="true"
                scrolling="no"
                frameborder="0"
              ></iframe>
            </div>
          </div>

          <!-- Hộp liên kết dự phòng bên dưới video ở cột trái trên Desktop -->
          <div class="detail-grid__fallback">
            <span class="detail-player__fallback-hint">
              {{ INSPIRE_WELLNESS_PAGE_COPY.watchOnFacebookHint }}
            </span>
            <a
              class="detail-player__fb-link"
              :href="episode.reelUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ INSPIRE_WELLNESS_PAGE_COPY.watchOnFacebookLabel }}</span>
              <ArrowUpRight :size="15" :stroke-width="2" aria-hidden="true" />
            </a>
          </div>

          <!-- Cột nội dung chính: Tiêu đề riêng của tập + Phần giới thiệu dùng chung “Đồng hành cùng Khánh Ly” -->
          <div class="detail-grid__main">
            <header class="detail-grid__header">
              <span class="detail-grid__eyebrow">{{ INSPIRE_WELLNESS_PAGE_COPY.heading }}</span>
              <h1 id="wellness-detail-heading" class="detail-grid__title">
                {{ episode.title }}
              </h1>
            </header>

            <InspireWellnessCompanionSection />
          </div>
        </article>

        <!-- Khi slug không tồn tại -->
        <div v-else class="detail-empty">
          <h1 id="wellness-detail-heading" class="detail-empty__title">
            {{ INSPIRE_WELLNESS_PAGE_COPY.notFoundHeading }}
          </h1>
          <p class="detail-empty__desc">
            {{ INSPIRE_WELLNESS_PAGE_COPY.notFoundDescription }}
          </p>
          <a
            class="detail-empty__btn"
            :href="INSPIRE_WELLNESS_BASE_PATH"
            @click="navigateApp(INSPIRE_WELLNESS_BASE_PATH, $event)"
          >
            <span class="detail-empty__btn-label">
              {{ INSPIRE_WELLNESS_PAGE_COPY.backToLibraryLabel }}
            </span>
            <span class="detail-empty__btn-icon" aria-hidden="true">
              <ArrowRight :size="16" :stroke-width="2" />
            </span>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wellness-detail {
  background: var(--color-paper-blush);
  min-height: calc(100svh - var(--header-height));
}

/* Mobile (< 56rem): không chừa khoảng trống phía trên để khung video nằm sát ngay dưới thanh header */
.wellness-detail__section {
  padding-block: 0 clamp(3.5rem, 6.5vw, 5rem);
}

.wellness-detail__inner {
  width: 100%;
  max-width: 66rem;
  margin-inline: auto;
}

/* Mobile (< 56rem): Khung video ghim trên đầu -> thanh Quay lại + Xem trên Facebook -> Tiêu đề & Nội dung */
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'player'
    'breadcrumb'
    'main';
  row-gap: var(--space-lg);
  align-items: start;
}

/* Khung phát trên mobile: tràn hết chiều rộng màn hình, cao 42svh (trong vùng 40–45%), nền đen, ghim ngay dưới header */
.detail-grid__player {
  grid-area: player;
  position: sticky;
  top: var(--detail-header-height, var(--header-height));
  z-index: var(--z-sticky);
  margin-inline: calc(var(--page-gutter) * -1);
  width: calc(100% + (var(--page-gutter) * 2));
  height: 42vh;
  height: 42svh;
  min-height: 15.25rem;
  max-height: 45svh;
  background: var(--color-video-stage-bg);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Khung 9:16 căn chính giữa trên nền đen trên mobile */
.detail-player__frame {
  position: relative;
  height: 100%;
  width: auto;
  max-width: 100%;
  aspect-ratio: 9 / 16;
  margin-inline: auto;
  overflow: hidden;
  background: var(--color-video-stage-bg);
}

.detail-player__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--color-video-stage-bg);
}

.wellness-detail__breadcrumb {
  grid-area: breadcrumb;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs) var(--space-sm);
  padding-top: var(--space-xs);
}

.wellness-detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  min-height: 40px;
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-pill);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .wellness-detail__back:hover {
    background: var(--color-paper-2);
    border-color: var(--color-accent);
    transform: translateX(-2px);
  }
}

.wellness-detail__mobile-fb {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  min-height: 40px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 1.5px solid var(--color-accent);
}

/* Hộp fallback riêng cho cột trái Desktop (ẩn trên mobile vì đã có link Xem trên Facebook ngay dưới video) */
.detail-grid__fallback {
  display: none;
}

.detail-player__fallback-hint {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.45;
  color: var(--color-muted);
}

.detail-player__fb-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  min-height: 36px;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 1.5px solid var(--color-accent);
}

@media (hover: hover) and (pointer: fine) {
  .detail-player__fb-link:hover,
  .wellness-detail__mobile-fb:hover {
    color: var(--color-brand-given);
  }
}

.detail-grid__main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

.detail-grid__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  min-width: 0;
}

.detail-grid__eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-brand-given);
}

.detail-grid__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.1vw + 0.95rem, 2.5rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.detail-empty {
  margin-top: var(--space-xl);
  padding: var(--space-2xl) var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
}

.detail-empty__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--color-ink);
}

.detail-empty__desc {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-ink-2);
}

.detail-empty__btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
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
}

.detail-empty__btn-icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ==========================================================================
   Desktop (>= 56rem): Giữ nguyên bố cục 2 cột (Video dọc bên trái, Tiêu đề & Nội dung bên phải)
   ========================================================================== */
@media (min-width: 56rem) {
  .wellness-detail__section {
    padding-block: clamp(2rem, 4vw, 3.25rem) clamp(4rem, 7vw, 6rem);
  }

  .detail-grid {
    grid-template-columns: minmax(19rem, 23rem) minmax(0, 1fr);
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      'breadcrumb breadcrumb'
      'player     main'
      'fallback   main';
    column-gap: clamp(2.25rem, 4.5vw, 3.75rem);
    row-gap: 0;
  }

  .wellness-detail__breadcrumb {
    padding-top: 0;
    margin-bottom: clamp(1.5rem, 3vw, 2.25rem);
    justify-content: flex-start;
  }

  .wellness-detail__back {
    gap: var(--space-xs);
    min-height: 44px;
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);
  }

  .wellness-detail__mobile-fb {
    display: none;
  }

  .detail-grid__player {
    position: static;
    top: auto;
    z-index: auto;
    margin-inline: 0;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    background: transparent;
    box-shadow: none;
    display: block;
  }

  .detail-player__frame {
    width: 100%;
    height: auto;
    aspect-ratio: 9 / 16;
    border-radius: var(--radius-lg);
    border: var(--rule-hairline);
    box-shadow: var(--shadow-card);
    background: var(--color-ink);
  }

  .detail-grid__fallback {
    grid-area: fallback;
    margin-top: var(--space-sm);
    align-self: start;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs) var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    background: var(--color-surface-white);
    border: var(--rule-hairline);
  }

  .detail-grid__main {
    gap: var(--space-xl);
  }
}
</style>

<script setup lang="ts">
import { ArrowRight, Play } from 'lucide-vue-next'
import {
  INSPIRE_WELLNESS_EPISODES,
  INSPIRE_WELLNESS_PAGE_COPY,
  type InspireWellnessEpisode,
} from '../config/inspireWellness'
import { navigateApp } from '../composables/useAppRouter'

function hasCover(ep: InspireWellnessEpisode): ep is InspireWellnessEpisode & { coverSrc: string } {
  return typeof ep.coverSrc === 'string' && ep.coverSrc.trim().length > 0
}
</script>

<template>
  <main id="main-content" class="wellness-library" tabindex="-1">
    <section class="wellness-library__section" aria-labelledby="inspire-library-heading">
      <div class="container wellness-library__inner">
        <header class="wellness-library__head">
          <span class="wellness-library__accent-rule" aria-hidden="true"></span>
          <h1 id="inspire-library-heading" class="wellness-library__title">
            {{ INSPIRE_WELLNESS_PAGE_COPY.heading }}
          </h1>
          <p class="wellness-library__intro">
            {{ INSPIRE_WELLNESS_PAGE_COPY.intro }}
          </p>
        </header>

        <ul class="wellness-library__grid">
          <li
            v-for="episode in INSPIRE_WELLNESS_EPISODES"
            :key="episode.slug"
            class="wellness-library__item"
          >
            <a
              class="wellness-card"
              :href="episode.detailPath"
              :data-episode-slug="episode.slug"
              @click="navigateApp(episode.detailPath, $event)"
            >
              <div class="wellness-card__media">
                <img
                  v-if="hasCover(episode)"
                  class="wellness-card__cover"
                  :src="episode.coverSrc"
                  :alt="episode.coverAlt"
                  :width="episode.coverWidth"
                  :height="episode.coverHeight"
                  :style="{ objectPosition: episode.coverObjectPosition ?? '50% 50%' }"
                  decoding="async"
                />
                <div v-else class="wellness-card__fallback">
                  <span>{{ episode.title }}</span>
                </div>

                <span class="wellness-card__play" aria-hidden="true">
                  <Play class="wellness-card__play-icon" :size="15" :stroke-width="2" />
                </span>
              </div>

              <div class="wellness-card__body">
                <h2 class="wellness-card__title">{{ episode.title }}</h2>
                <span class="wellness-card__action" aria-hidden="true">
                  <span>{{ INSPIRE_WELLNESS_PAGE_COPY.cardActionHint }}</span>
                  <ArrowRight :size="15" :stroke-width="2" />
                </span>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wellness-library {
  background: var(--color-paper-blush);
  min-height: calc(100svh - var(--header-height));
}

.wellness-library__section {
  padding-block: clamp(2.75rem, 5vw, 4.5rem) clamp(4rem, 7vw, 6rem);
}

.wellness-library__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2.25rem, 4.5vw, 3.25rem);
}

.wellness-library__head {
  width: 100%;
  max-width: 48rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.wellness-library__accent-rule {
  display: block;
  width: 2.25rem;
  height: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
}

.wellness-library__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 2.6vw + 1.1rem, 3.125rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
}

.wellness-library__intro {
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(1rem, 0.35vw + 0.925rem, 1.125rem);
  line-height: 1.62;
  color: var(--color-ink-2);
  max-width: 52ch;
}

/* Mobile: 1 thẻ mỗi hàng; Desktop (>= 48rem): 2 thẻ mỗi hàng */
.wellness-library__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 24rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 3.5vw, 2.25rem);
}

.wellness-library__item {
  display: flex;
  min-width: 0;
}

.wellness-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card), var(--edge-highlight);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-ink);
  transition:
    transform var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out);
}

.wellness-card__media {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: var(--color-paper-3);
  overflow: hidden;
  border-bottom: var(--rule-hairline);
}

.wellness-card__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-long) var(--ease-out);
}

.wellness-card__fallback {
  width: 100%;
  height: 100%;
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--font-display);
  font-size: var(--text-md);
  color: var(--color-ink-2);
}

.wellness-card__play {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 2.5rem;
  height: 2.5rem;
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

.wellness-card__play-icon {
  fill: currentColor;
  transform: translateX(1px);
}

.wellness-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

.wellness-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 0.35vw + 1.02rem, 1.3125rem);
  font-weight: 500;
  line-height: 1.32;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.wellness-card__action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink-2);
  white-space: nowrap;
  transition: color var(--dur-micro) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .wellness-card:hover {
    transform: translateY(-3px);
    border-color: var(--color-accent);
  }

  .wellness-card:hover .wellness-card__cover {
    transform: scale(1.025);
  }

  .wellness-card:hover .wellness-card__play {
    background: var(--color-accent-hover);
    transform: scale(1.06);
  }

  .wellness-card:hover .wellness-card__action {
    color: var(--color-ink);
  }
}

@media (min-width: 48rem) {
  .wellness-library__grid {
    max-width: 48rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .wellness-card,
  .wellness-card__cover,
  .wellness-card__play {
    transition: none;
  }
}
</style>


<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { HERO_PORTRAIT } from '../config/heroPortrait'
import { HERO_CONTENT, type HeroAction } from '../config/siteContent'
import { navigateToContact } from '../composables/useContactNavigation'

const pendingFeedback = ref<string | null>(null)

const portraitVars = computed(() => ({
  '--portrait-fit': HERO_PORTRAIT.crop.objectFit,
  '--portrait-pos-desktop': HERO_PORTRAIT.crop.objectPositionDesktop,
  '--portrait-pos-mobile': HERO_PORTRAIT.crop.objectPositionMobile,
  '--portrait-scale': String(HERO_PORTRAIT.crop.scale),
  '--portrait-ratio-desktop': HERO_PORTRAIT.crop.desktopAspectRatio,
  '--portrait-ratio-mobile': HERO_PORTRAIT.crop.mobileAspectRatio,
}))

function handleReadyLinkClick(action: HeroAction, event: MouseEvent) {
  if (action.contactTopic) {
    navigateToContact(action.contactTopic, event)
  }
}

function handleActionClick(action: HeroAction) {
  if (action.status === 'ready' && action.href) {
    window.location.assign(action.href)
    return
  }

  pendingFeedback.value = `“${action.label}” đang ở trạng thái chờ kết nối — sẽ gắn liên kết ở phase tiếp theo.`
}
</script>

<template>
  <section id="hero" class="hero" aria-labelledby="hero-heading">
    <div class="hero__inner">
      <div class="hero__copy">
        <span class="hero__accent-rule reveal" style="--i: 0" aria-hidden="true"></span>

        <h1 id="hero-heading" class="hero__title reveal" style="--i: 1">
          <span
            v-for="(line, index) in HERO_CONTENT.nameLines"
            :key="index"
            class="hero__title-line"
          >
            {{ line }}
          </span>
        </h1>

        <p class="hero__lead reveal" style="--i: 2">
          {{ HERO_CONTENT.description }}
        </p>

        <div class="hero__actions reveal" style="--i: 3">
          <template v-for="action in HERO_CONTENT.actions" :key="action.id">
            <a
              v-if="action.status === 'ready' && action.href"
              :href="action.href"
              class="hero-btn"
              :class="`hero-btn--${action.variant}`"
              @click="handleReadyLinkClick(action, $event)"
            >
              <span class="hero-btn__label">{{ action.label }}</span>
              <span class="hero-btn__icon" aria-hidden="true">
                <ArrowRight :size="16" :stroke-width="2" />
              </span>
            </a>

            <button
              v-else
              type="button"
              class="hero-btn"
              :class="`hero-btn--${action.variant}`"
              :aria-describedby="pendingFeedback ? 'hero-pending-status' : undefined"
              :data-connection="action.status"
              :title="action.pendingNote || undefined"
              @click="handleActionClick(action)"
            >
              <span class="hero-btn__label">{{ action.label }}</span>
              <span class="hero-btn__icon" aria-hidden="true">
                <ArrowRight :size="16" :stroke-width="2" />
              </span>
            </button>
          </template>
        </div>

        <p
          v-if="pendingFeedback"
          id="hero-pending-status"
          class="hero__status is-visible"
          role="status"
          aria-live="polite"
        >
          <span class="hero__status-dot" aria-hidden="true"></span>
          <span>{{ pendingFeedback }}</span>
        </p>
      </div>

      <div class="hero__media reveal" style="--i: 2">
        <figure class="hero__figure" :style="portraitVars">
          <div class="hero__portrait-frame">
            <img
              class="hero__portrait-img"
              :src="HERO_PORTRAIT.src"
              :alt="HERO_PORTRAIT.alt"
              :width="HERO_PORTRAIT.width"
              :height="HERO_PORTRAIT.height"
              loading="eager"
              decoding="sync"
              fetchpriority="high"
            />
          </div>

          <figcaption v-if="HERO_PORTRAIT.isPlaceholder" class="hero__portrait-caption">
            Ảnh chân dung mẫu (sẽ thay ảnh thật)
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Mobile-first (< 60rem): xếp chữ và ảnh theo chiều dọc trên nền trắng ánh hồng */
.hero {
  --hero-portrait-lag: 1.25rem;
  position: relative;
  z-index: var(--z-base);
  width: 100%;
  background: var(--color-hero-bg);
  padding-block: clamp(1.75rem, 4vw, 2.5rem) clamp(2rem, 4.5vw, 3rem);
  scroll-margin-top: var(--header-height);
  overflow: visible;
}

.hero::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-raised);
  height: clamp(4rem, 12vh, 8rem);
  background: linear-gradient(to bottom, transparent, var(--color-hero-exit-veil));
  opacity: var(--hero-handoff-p, 0);
  pointer-events: none;
}

.hero__inner {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.75rem, 4.5vw, 2.5rem);
  align-items: center;
}

.hero__copy {
  position: relative;
  z-index: calc(var(--z-base) + 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.hero__accent-rule {
  display: block;
  width: 2.75rem;
  height: 2.5px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  margin-bottom: var(--space-lg);
}

.hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: 500;
  font-variation-settings: 'opsz' 144, 'SOFT' 30;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--color-ink);
  overflow-wrap: anywhere;
  min-width: 0;
}

.hero__title-line {
  display: block;
}

.hero__lead {
  margin: var(--space-lg) 0 0;
  max-width: 34ch;
  font-family: var(--font-body);
  font-size: clamp(1.0625rem, 0.55vw + 0.925rem, 1.25rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-ink-2);
}

.hero__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-sm);
  width: 100%;
  margin-top: var(--space-xl);
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  min-height: 3rem;
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-lg);
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.hero-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hero-btn__label {
  white-space: nowrap;
}

.hero-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
  transition: transform var(--dur-short) var(--ease-out);
}

.hero-btn--primary {
  background: var(--color-accent);
  color: var(--color-accent-ink);
  border-color: var(--color-accent);
}

.hero-btn--primary .hero-btn__icon {
  background: var(--color-ink);
  color: var(--color-paper);
}

.hero-btn--secondary {
  background: var(--color-surface-white);
  color: var(--color-ink);
  border-color: var(--color-rule);
}

.hero-btn--secondary .hero-btn__icon {
  background: var(--color-paper-2);
  color: var(--color-ink);
}

@media (hover: hover) and (pointer: fine) {
  .hero-btn:hover {
    transform: translateY(-1.5px);
  }

  .hero-btn--primary:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .hero-btn--secondary:hover {
    border-color: var(--color-ink);
    background: var(--color-paper-2);
  }

  .hero-btn:hover .hero-btn__icon {
    transform: translateX(2px);
  }
}

.hero-btn:active {
  transform: translateY(0);
}

.hero-btn--primary:active {
  background: var(--color-accent-active);
}

.hero__status {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-xs);
  min-height: 1.25rem;
  margin: var(--space-sm) 0 0;
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--color-ink-2);
}

.hero__status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
  transform: translateY(-1px);
}

/* Mobile portrait: giữ trọn khung 1:1 (960 × 960) thấy đủ đỉnh đầu và hai vai */
.hero__media {
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
  min-width: 0;
}

.hero__figure {
  margin: 0;
  transform: translate3d(
    0,
    calc(var(--hero-handoff-p, 0) * var(--hero-portrait-lag, 0px)),
    0
  );
  will-change: transform;
}

.hero__portrait-frame {
  position: relative;
  aspect-ratio: var(--portrait-ratio-mobile);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-paper-2);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card);
}

.hero__portrait-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--portrait-fit);
  object-position: var(--portrait-pos-mobile);
  transform: scale(var(--portrait-scale));
  transform-origin: center top;
}

.hero__portrait-caption {
  margin-top: var(--space-xs);
  text-align: end;
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--color-muted);
}

/* Breakpoint >= 30rem (480px): hai nút nằm cạnh nhau */
@media (min-width: 30rem) {
  .hero__actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    width: auto;
  }

  .hero-btn {
    justify-content: center;
    padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-lg);
  }
}

/* Breakpoint >= 44rem (704px): tablet */
@media (min-width: 44rem) {
  .hero {
    --hero-portrait-lag: 2.25rem;
  }

  .hero__media {
    max-width: 31rem;
  }
}

/* Breakpoint >= 60rem (960px): Banner ngang tràn chiều rộng — chữ trái trên nền trắng ánh hồng, chân dung lớn bên phải hòa mép trái vào nền sáng */
@media (min-width: 60rem) {
  .hero {
    --hero-portrait-lag: 4.25rem;
    min-height: clamp(35rem, calc(100dvh - var(--header-height)), 54rem);
    display: flex;
    align-items: center;
    padding-block: clamp(2.5rem, 4vw, 3.75rem);
    clip-path: inset(0 0 -10rem 0);
  }

  .hero__inner {
    position: static;
    grid-template-columns: minmax(0, 1fr);
    padding-inline: var(--page-gutter);
  }

  .hero__copy {
    position: relative;
    z-index: calc(var(--z-base) + 2);
    max-width: clamp(27rem, 42vw, 35rem);
  }

  .hero__title-line {
    white-space: nowrap;
  }

  .hero__media {
    position: absolute;
    top: 0;
    bottom: 0;
    right: -3.5rem;
    z-index: var(--z-base);
    width: auto;
    max-width: none;
    margin: 0;
    pointer-events: none;
  }

  .hero__media.reveal {
    transform: none;
    animation-name: hero-media-fade;
  }

  .hero__figure {
    height: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .hero__portrait-frame {
    position: relative;
    height: 100%;
    width: auto;
    aspect-ratio: var(--portrait-ratio-desktop);
    border-radius: 0;
    border: 0;
    box-shadow: none;
    background: transparent;
    -webkit-mask-image: var(--mask-hero-portrait-left);
    mask-image: var(--mask-hero-portrait-left);
  }

  .hero__portrait-frame::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: var(--z-base);
    background: var(--glow-hero-portrait-upper-left);
    pointer-events: none;
  }

  .hero__portrait-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: var(--portrait-pos-desktop);
    transform: none;
  }
}

@media (min-width: 76rem) {
  .hero__media {
    right: 0;
  }
}

/* Reveal orchestration */
.reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: hero-reveal var(--dur-long) var(--ease-out) forwards;
  animation-delay: calc(var(--i, 0) * 80ms);
}

@keyframes hero-reveal {
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-media-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero::after {
    display: none;
  }

  .hero__figure {
    transform: none !important;
    will-change: auto;
  }

  .reveal {
    opacity: 0;
    transform: none;
    animation: hero-reveal-reduced 150ms linear forwards;
    animation-delay: 0ms;
  }

  @keyframes hero-reveal-reduced {
    to {
      opacity: 1;
      transform: none;
    }
  }
}
</style>

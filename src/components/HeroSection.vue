<script setup lang="ts">
import { computed } from 'vue'
import { HERO_PORTRAIT } from '../config/heroPortrait'
import { HERO_CONTENT } from '../config/siteContent'

const portraitVars = computed(() => ({
  '--portrait-fit': HERO_PORTRAIT.crop.objectFit,
  '--portrait-pos-desktop': HERO_PORTRAIT.crop.objectPositionDesktop,
  '--portrait-pos-mobile': HERO_PORTRAIT.crop.objectPositionMobile,
  '--portrait-scale': String(HERO_PORTRAIT.crop.scale),
  '--portrait-ratio-desktop': HERO_PORTRAIT.crop.desktopAspectRatio,
  '--portrait-ratio-mobile': HERO_PORTRAIT.crop.mobileAspectRatio,
}))
</script>

<template>
  <section id="hero" class="hero" :style="portraitVars" aria-labelledby="hero-heading">
    <div class="hero__media reveal" style="--i: 0">
      <figure class="hero__figure">
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
          <div class="hero__mobile-scrim" aria-hidden="true"></div>
        </div>
      </figure>
    </div>

    <div class="hero__inner">
      <div class="hero__copy">
        <h1 id="hero-heading" class="hero__title reveal" style="--i: 1">
          {{ HERO_CONTENT.title }}
        </h1>

        <p class="hero__role reveal" style="--i: 2">
          {{ HERO_CONTENT.roleLine }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Mobile-first (< 60rem): chân dung thật phủ toàn bộ khung hero ngay dưới header, chữ trắng đặt trực tiếp ở góc dưới bên trái */
.hero {
  --hero-portrait-lag: 1.25rem;
  position: relative;
  z-index: var(--z-base);
  width: 100%;
  aspect-ratio: var(--portrait-ratio-mobile, 3 / 4);
  max-height: min(84dvh, 42rem);
  display: flex;
  align-items: flex-end;
  background: var(--color-ink);
  scroll-margin-top: var(--header-height);
  clip-path: inset(0 0 -6rem 0);
}

.hero::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-raised);
  height: clamp(3.5rem, 10vh, 7rem);
  background: linear-gradient(to bottom, transparent, var(--color-hero-exit-veil));
  opacity: var(--hero-handoff-p, 0);
  pointer-events: none;
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
}

.hero__media.reveal {
  transform: none;
  animation-name: hero-media-fade;
}

.hero__figure {
  margin: 0;
  width: 100%;
  height: 100%;
  transform: translate3d(
    0,
    calc(var(--hero-handoff-p, 0) * var(--hero-portrait-lag, 0px)),
    0
  );
  will-change: transform;
}

.hero__portrait-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero__portrait-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--portrait-fit, cover);
  object-position: var(--portrait-pos-mobile, 53% 6%);
  transform: scale(var(--portrait-scale, 1));
  transform-origin: center top;
}

/* Gradient tối nhẹ chỉ phủ phần dưới ảnh trên mobile, giữ nguyên độ sáng tự nhiên của vùng mặt ở nửa trên */
.hero__mobile-scrim {
  position: absolute;
  inset: 48% 0 0 0;
  background: var(--scrim-hero-mobile-bottom);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  z-index: calc(var(--z-base) + 2);
  width: 100%;
  padding: clamp(1.25rem, 5.5vw, 1.5rem);
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  min-width: 0;
}

.hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 6.4vw, 2.25rem);
  font-weight: 700;
  font-variation-settings: 'opsz' 96, 'SOFT' 20;
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: var(--color-hero-overlay-ink);
  overflow-wrap: anywhere;
  min-width: 0;
}

.hero__role {
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(0.875rem, 3.6vw, 1.0625rem);
  font-weight: 500;
  line-height: 1.45;
  color: var(--color-hero-overlay-role);
  max-width: 38ch;
  overflow-wrap: break-word;
}

@media (min-width: 44rem) {
  .hero {
    --hero-portrait-lag: 2.25rem;
  }
}

/* Desktop (>= 60rem / 960px): nền trắng ánh hồng, chữ căn giữa theo chiều cao bên trái, tên in đậm 1 dòng, chân dung thật bên phải */
@media (min-width: 60rem) {
  .hero {
    --hero-portrait-lag: 4.25rem;
    aspect-ratio: auto;
    max-height: none;
    min-height: clamp(35rem, calc(100dvh - var(--header-height)), 54rem);
    align-items: center;
    background: var(--color-hero-bg);
    padding-block: clamp(2.5rem, 4vw, 3.75rem);
    clip-path: inset(0 0 -10rem 0);
  }

  .hero__media {
    inset: 0 -3.5rem 0 auto;
    width: auto;
  }

  .hero__figure {
    width: auto;
    height: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .hero__portrait-frame {
    width: auto;
    height: 100%;
    aspect-ratio: var(--portrait-ratio-desktop, 1 / 1);
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
    object-fit: contain;
    object-position: var(--portrait-pos-desktop, 100% 100%);
    transform: none;
  }

  .hero__mobile-scrim {
    display: none;
  }

  .hero__inner {
    position: static;
    max-width: var(--container-max);
    margin-inline: auto;
    padding-block: 0;
    padding-inline: var(--page-gutter);
  }

  .hero__copy {
    position: relative;
    z-index: calc(var(--z-base) + 2);
    gap: var(--space-md);
    max-width: clamp(28rem, 47vw, 42rem);
  }

  .hero__title {
    font-size: clamp(2.125rem, 2.85vw + 0.55rem, 3.625rem);
    font-weight: 700;
    font-variation-settings: 'opsz' 144, 'SOFT' 20;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--color-ink);
  }

  .hero__role {
    font-size: clamp(1.0625rem, 0.45vw + 0.9rem, 1.25rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--color-ink-2);
    max-width: none;
  }
}

@media (min-width: 76rem) {
  .hero__media {
    inset: 0 0 0 auto;
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

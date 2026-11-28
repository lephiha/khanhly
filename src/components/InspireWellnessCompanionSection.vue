<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import { INSPIRE_WELLNESS_COMPANION } from '../config/inspireWellness'
import { buildHomeContactHref } from '../composables/useContactNavigation'
import { navigateApp } from '../composables/useAppRouter'

const hasPackagesPage = computed(() => {
  const url = INSPIRE_WELLNESS_COMPANION.wellness.packagesPageUrl?.trim()
  return Boolean(url && url.length > 0)
})

const isExternalPackagesUrl = computed(() => {
  const url = INSPIRE_WELLNESS_COMPANION.wellness.packagesPageUrl?.trim() ?? ''
  return /^https?:\/\//i.test(url)
})

const primaryCtaLabel = computed(() =>
  hasPackagesPage.value
    ? INSPIRE_WELLNESS_COMPANION.wellness.packagesCtaLabel
    : INSPIRE_WELLNESS_COMPANION.wellness.fallbackCtaLabel
)

const primaryCtaHref = computed(() => {
  if (hasPackagesPage.value && INSPIRE_WELLNESS_COMPANION.wellness.packagesPageUrl) {
    return INSPIRE_WELLNESS_COMPANION.wellness.packagesPageUrl.trim()
  }
  return buildHomeContactHref(INSPIRE_WELLNESS_COMPANION.wellness.contactTopic)
})

const secondaryCtaHref = computed(() =>
  buildHomeContactHref(INSPIRE_WELLNESS_COMPANION.advisory.contactTopic)
)

function handlePrimaryCtaClick(event: MouseEvent) {
  if (hasPackagesPage.value && isExternalPackagesUrl.value) return
  navigateApp(primaryCtaHref.value, event)
}
</script>

<template>
  <section class="detail-companion" aria-labelledby="detail-companion-heading">
    <!-- Mở đầu: Đồng hành cùng Khánh Ly -->
    <div class="detail-companion__intro-block">
      <span class="detail-companion__rule" aria-hidden="true"></span>
      <h2 id="detail-companion-heading" class="detail-companion__heading">
        {{ INSPIRE_WELLNESS_COMPANION.heading }}
      </h2>
      <p class="detail-companion__lead">
        {{ INSPIRE_WELLNESS_COMPANION.intro }}
      </p>
    </div>

    <!-- Khối 1: Nắng Wellness — Dinh dưỡng và chăm sóc sức khỏe -->
    <section
      class="detail-pillar detail-pillar--primary"
      aria-labelledby="detail-wellness-heading"
    >
      <h3 id="detail-wellness-heading" class="detail-pillar__title">
        {{ INSPIRE_WELLNESS_COMPANION.wellness.heading }}
      </h3>

      <div class="detail-pillar__body">
        <p
          v-for="(paragraph, idx) in INSPIRE_WELLNESS_COMPANION.wellness.paragraphs"
          :key="idx"
          class="detail-pillar__text"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="detail-pillar__actions">
        <a
          class="detail-cta detail-cta--primary"
          data-detail-cta="wellness"
          :href="primaryCtaHref"
          :target="isExternalPackagesUrl ? '_blank' : undefined"
          :rel="isExternalPackagesUrl ? 'noopener noreferrer' : undefined"
          @click="handlePrimaryCtaClick"
        >
          <span class="detail-cta__label">{{ primaryCtaLabel }}</span>
          <span class="detail-cta__badge" aria-hidden="true">
            <ArrowUpRight v-if="isExternalPackagesUrl" :size="16" :stroke-width="2" />
            <ArrowRight v-else :size="16" :stroke-width="2" />
          </span>
        </a>
      </div>
    </section>

    <!-- Khối 2: Cố vấn khởi nghiệp trong lĩnh vực sức khỏe chủ động -->
    <section
      class="detail-pillar detail-pillar--secondary"
      aria-labelledby="detail-advisory-heading"
    >
      <h3 id="detail-advisory-heading" class="detail-pillar__title">
        {{ INSPIRE_WELLNESS_COMPANION.advisory.heading }}
      </h3>

      <div class="detail-pillar__body">
        <p
          v-for="(paragraph, idx) in INSPIRE_WELLNESS_COMPANION.advisory.paragraphs"
          :key="idx"
          class="detail-pillar__text"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="detail-pillar__actions">
        <a
          class="detail-cta detail-cta--secondary"
          data-detail-cta="advisory"
          :href="secondaryCtaHref"
          @click="navigateApp(secondaryCtaHref, $event)"
        >
          <span class="detail-cta__label">{{ INSPIRE_WELLNESS_COMPANION.advisory.ctaLabel }}</span>
          <span class="detail-cta__arrow" aria-hidden="true">
            <ArrowRight :size="16" :stroke-width="2" />
          </span>
        </a>
      </div>
    </section>
  </section>
</template>

<style scoped>
.detail-companion {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

.detail-companion__intro-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  padding-top: var(--space-xs);
  border-top: var(--rule-hairline);
  min-width: 0;
}

.detail-companion__rule {
  display: block;
  width: 2.25rem;
  height: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  margin-top: var(--space-xs);
}

.detail-companion__heading {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.375rem, 1.3vw + 0.95rem, 1.875rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.24;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
}

.detail-companion__lead {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.68;
  color: var(--color-ink-2);
  max-width: 64ch;
}

.detail-pillar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border-radius: var(--radius-lg);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-whisper), var(--edge-highlight);
  min-width: 0;
}

.detail-pillar--secondary {
  background: var(--color-paper);
}

.detail-pillar__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.1875rem, 0.7vw + 0.98rem, 1.4375rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 48, 'SOFT' 30;
  line-height: 1.3;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  text-wrap: balance;
}

.detail-pillar__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
}

.detail-pillar__text {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.68;
  color: var(--color-ink-2);
  max-width: 64ch;
}

.detail-pillar__actions {
  width: 100%;
  padding-top: var(--space-2xs);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.detail-cta {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  max-width: 100%;
  min-height: 3rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    color var(--dur-short) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.detail-cta__label {
  overflow-wrap: anywhere;
}

/* Nút chính: Hồng chủ đạo giống CTA của Khánh Ly */
.detail-cta--primary {
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-lg);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-ink);
}

.detail-cta__badge {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform var(--dur-short) var(--ease-out);
}

/* Nút phụ: Viền tối rõ ràng trên nền trắng tinh tế */
.detail-cta--secondary {
  padding: var(--space-xs) var(--space-md) var(--space-xs) var(--space-lg);
  border: 1px solid var(--color-ink);
  background: var(--color-surface-white);
  color: var(--color-ink);
}

.detail-cta__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink);
  flex-shrink: 0;
  transition: transform var(--dur-short) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .detail-cta--primary:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    transform: translateY(-1.5px);
  }

  .detail-cta--primary:hover .detail-cta__badge {
    transform: translateX(2px);
  }

  .detail-cta--secondary:hover {
    background: var(--color-paper-blush);
    border-color: var(--color-brand-given);
    color: var(--color-brand-given);
    transform: translateY(-1.5px);
  }

  .detail-cta--secondary:hover .detail-cta__arrow {
    color: var(--color-brand-given);
    transform: translateX(2px);
  }
}

.detail-cta--primary:active {
  background: var(--color-accent-active);
  transform: translateY(0);
}

.detail-cta--secondary:active {
  background: var(--color-paper-2);
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .detail-cta,
  .detail-cta__badge,
  .detail-cta__arrow {
    transition: none;
  }
}
</style>


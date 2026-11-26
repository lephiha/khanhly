<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import {
  MEDIA_CHANNELS,
  MEDIA_NETWORK_SECTION,
  type MediaChannelItem,
} from '../config/siteContent'
import { navigateToContact } from '../composables/useContactNavigation'

const showPendingStatus = ref(false)

const hasCtaDestination = computed(() => {
  return (
    typeof MEDIA_NETWORK_SECTION.ctaHref === 'string' &&
    MEDIA_NETWORK_SECTION.ctaHref.trim().length > 0
  )
})

const allChannelsPreviewOnly = computed(() => {
  return MEDIA_CHANNELS.every((ch) => !hasChannelUrl(ch))
})

function hasChannelUrl(
  channel: MediaChannelItem
): channel is MediaChannelItem & { url: string } {
  return typeof channel.url === 'string' && channel.url.trim().length > 0
}

function handleCtaClick() {
  if (hasCtaDestination.value) return
  showPendingStatus.value = true
}
</script>

<template>
  <section
    :id="MEDIA_NETWORK_SECTION.id"
    class="media-network"
    aria-labelledby="media-network-heading"
  >
    <div class="container media-network__inner">
      <header class="media-network__head">
        <h2 id="media-network-heading" class="media-network__title">
          {{ MEDIA_NETWORK_SECTION.heading }}
        </h2>
        <p v-if="allChannelsPreviewOnly" class="media-network__preview-note">
          {{ MEDIA_NETWORK_SECTION.previewNote }}
        </p>
      </header>

      <ul class="media-network__list">
        <li
          v-for="channel in MEDIA_CHANNELS"
          :key="channel.id"
          class="media-network__item"
        >
          <!-- Một thẻ liên kết bao trọn cả ô biểu tượng/logo lẫn dòng tên bên dưới -->
          <a
            v-if="hasChannelUrl(channel)"
            class="channel-card is-linked"
            :href="channel.url"
            target="_blank"
            rel="noopener noreferrer"
            :data-channel-id="channel.id"
            :aria-label="channel.platform === 'fitx' ? 'FitX — Mở trang chủ fitx.vn' : `${channel.name} của Nguyễn Khánh Ly`"
          >
            <span class="channel-card__icon-box" aria-hidden="true">
              <img
                v-if="channel.logoSrc"
                class="channel-card__logo"
                :src="channel.logoSrc"
                alt=""
                :width="channel.logoWidth"
                :height="channel.logoHeight"
                decoding="async"
              />

              <svg
                v-else-if="channel.platform === 'facebook'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>

              <svg
                v-else-if="channel.platform === 'tiktok'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>

              <svg
                v-else-if="channel.platform === 'instagram'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>

              <svg
                v-else-if="channel.platform === 'youtube'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="4" ry="4" />
                <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
              </svg>
            </span>

            <span class="channel-card__name">{{ channel.name }}</span>

            <span v-if="channel.followers?.trim()" class="channel-card__stats">
              <strong class="channel-card__count">{{ channel.followers }}</strong>
              <span class="channel-card__stats-label">
                {{ MEDIA_NETWORK_SECTION.followersUnitLabel }}
              </span>
            </span>
          </a>

          <!-- Khi chưa gắn link kênh thật: hiển thị bản minh họa tĩnh -->
          <div v-else class="channel-card is-preview" :data-channel-id="channel.id">
            <span class="channel-card__icon-box" aria-hidden="true">
              <img
                v-if="channel.logoSrc"
                class="channel-card__logo"
                :src="channel.logoSrc"
                alt=""
                :width="channel.logoWidth"
                :height="channel.logoHeight"
                decoding="async"
              />

              <svg
                v-else-if="channel.platform === 'facebook'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>

              <svg
                v-else-if="channel.platform === 'tiktok'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>

              <svg
                v-else-if="channel.platform === 'instagram'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>

              <svg
                v-else-if="channel.platform === 'youtube'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="4" ry="4" />
                <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
              </svg>
            </span>

            <span class="channel-card__name">{{ channel.name }}</span>

            <span v-if="channel.followers?.trim()" class="channel-card__stats">
              <strong class="channel-card__count">{{ channel.followers }}</strong>
              <span class="channel-card__stats-label">
                {{ MEDIA_NETWORK_SECTION.followersUnitLabel }}
              </span>
            </span>
          </div>
        </li>
      </ul>

      <div class="media-network__cta">
        <a
          v-if="hasCtaDestination"
          class="collab-btn"
          :href="MEDIA_NETWORK_SECTION.ctaHref!"
          @click="navigateToContact(MEDIA_NETWORK_SECTION.contactTopic, $event)"
        >
          <span class="collab-btn__label">{{ MEDIA_NETWORK_SECTION.ctaLabel }}</span>
          <span class="collab-btn__icon" aria-hidden="true">
            <ArrowRight :size="16" :stroke-width="2" />
          </span>
        </a>

        <button
          v-else
          type="button"
          class="collab-btn"
          data-connection="pending"
          :aria-describedby="showPendingStatus ? 'media-network-pending' : undefined"
          :title="MEDIA_NETWORK_SECTION.pendingHint"
          @click="handleCtaClick"
        >
          <span class="collab-btn__label">{{ MEDIA_NETWORK_SECTION.ctaLabel }}</span>
          <span class="collab-btn__icon" aria-hidden="true">
            <ArrowRight :size="16" :stroke-width="2" />
          </span>
        </button>

        <p
          v-if="showPendingStatus"
          id="media-network-pending"
          class="media-network__pending is-visible"
          role="status"
          aria-live="polite"
        >
          <span class="media-network__pending-dot" aria-hidden="true"></span>
          <span>{{ MEDIA_NETWORK_SECTION.pendingStatusMessage }}</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-network {
  background: var(--color-powder-pink);
  border-top: var(--rule-hairline);
  padding-block: clamp(3rem, 5vw, 4.25rem) clamp(3.75rem, 6.5vw, 5.25rem);
  scroll-margin-top: calc(var(--header-height) + var(--space-xs));
}

.media-network__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.75rem, 3.5vw, 2.5rem);
}

.media-network__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  text-align: center;
}

.media-network__title {
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

.media-network__preview-note {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.45;
  color: var(--color-muted);
  text-wrap: balance;
}

/* Mobile wraps naturally into centered rows; Desktop lines up horizontally */
.media-network__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-lg) clamp(1.25rem, 4.5vw, 3.75rem);
  width: 100%;
  max-width: 52rem;
}

.media-network__item {
  flex: 0 0 auto;
  min-width: 5.25rem;
}

.channel-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-ink);
  text-decoration: none;
  border-radius: var(--radius-md);
}

.channel-card.is-linked {
  cursor: pointer;
}

.channel-card__icon-box {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-whisper);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    color var(--dur-short) var(--ease-out);
}

/* Logo PNG nền trong suốt căn chính giữa ô, giữ nguyên tỷ lệ gốc */
.channel-card__logo {
  display: block;
  width: 78%;
  height: 78%;
  object-fit: contain;
  background: transparent;
}

.channel-card__name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-ink);
  white-space: nowrap;
}

.channel-card__stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3xs);
  font-variant-numeric: tabular-nums;
}

.channel-card__count {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-ink);
}

.channel-card__stats-label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.3;
  color: var(--color-muted);
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .channel-card.is-linked:hover .channel-card__icon-box {
    transform: translateY(-2px);
    border-color: var(--color-accent);
  }
}

.media-network__cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
}

.collab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  max-width: 18rem;
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

.collab-btn__label {
  white-space: nowrap;
}

.collab-btn__icon {
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
  .collab-btn:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    transform: translateY(-1.5px);
  }

  .collab-btn:hover .collab-btn__icon {
    transform: translateX(2px);
  }
}

.collab-btn:active {
  transform: translateY(0);
  background: var(--color-accent-active);
}

.media-network__pending {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-xs);
  min-height: 1.125rem;
  margin: 0;
  text-align: center;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.45;
  color: var(--color-ink-2);
}

.media-network__pending-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
  transform: translateY(-1px);
}

@media (min-width: 30rem) {
  .collab-btn {
    width: auto;
    max-width: none;
    justify-content: center;
  }
}

@media (min-width: 48rem) {
  .channel-card__icon-box {
    width: 4.5rem;
    height: 4.5rem;
  }
}
</style>

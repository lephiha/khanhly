<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { ArrowRight, Play, X } from 'lucide-vue-next'
import {
  ON_STAGE_CLIPS,
  ON_STAGE_SECTION,
  type StageClipItem,
} from '../config/siteContent'

const dialogRef = ref<HTMLDialogElement | null>(null)
const frameRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const activeClip = ref<StageClipItem | null>(null)
let lastTriggerEl: HTMLElement | null = null

const hasMoreFacebookUrl = computed(() => {
  return (
    typeof ON_STAGE_SECTION.moreFacebookUrl === 'string' &&
    ON_STAGE_SECTION.moreFacebookUrl.trim().length > 0
  )
})

function hasVideoSrc(item: StageClipItem): item is StageClipItem & { videoSrc: string } {
  return typeof item.videoSrc === 'string' && item.videoSrc.trim().length > 0
}

function buildCardAriaLabel(item: StageClipItem): string {
  const prefix = item.eventName?.trim() ? `${item.eventName.trim()}: ` : ''
  return `${prefix}${item.title} · ${ON_STAGE_SECTION.openModalLabel}`
}

async function openClipModal(clip: StageClipItem, event: MouseEvent) {
  lastTriggerEl = event.currentTarget as HTMLElement | null
  activeClip.value = clip

  await nextTick()
  const dialogEl = dialogRef.value
  if (!dialogEl) return

  if (!dialogEl.open) {
    dialogEl.showModal()
  }
  document.documentElement.style.overflow = 'hidden'

  await nextTick()
  if (hasVideoSrc(clip) && videoRef.value) {
    videoRef.value.currentTime = 0
    const playPromise = videoRef.value.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Nếu trình duyệt chặn tự phát có tiếng, giữ nguyên controls để người xem bấm phát
      })
    }
  } else {
    closeBtnRef.value?.focus({ preventScroll: true })
  }
}

function stopAndUnloadVideo() {
  const vid = videoRef.value
  if (!vid) return
  vid.pause()
  vid.removeAttribute('src')
  vid.load()
}

function closeModal() {
  stopAndUnloadVideo()
  activeClip.value = null

  const dialogEl = dialogRef.value
  if (dialogEl?.open) {
    dialogEl.close()
  }
  document.documentElement.style.overflow = ''

  const triggerToFocus = lastTriggerEl
  lastTriggerEl = null
  nextTick(() => {
    triggerToFocus?.focus({ preventScroll: true })
  })
}

function onDialogCancel(event: Event) {
  event.preventDefault()
  closeModal()
}

function onDialogBackdropClick(event: MouseEvent) {
  if (!frameRef.value) return
  if (!frameRef.value.contains(event.target as Node)) {
    closeModal()
  }
}

onBeforeUnmount(() => {
  stopAndUnloadVideo()
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <section
    :id="ON_STAGE_SECTION.id"
    class="on-stage"
    aria-labelledby="on-stage-heading"
  >
    <div class="container on-stage__inner">
      <div class="on-stage__cluster">
        <header class="on-stage__head">
          <div class="on-stage__heading-group">
            <h2 id="on-stage-heading" class="on-stage__title">
              {{ ON_STAGE_SECTION.heading }}
            </h2>
            <p v-if="ON_STAGE_SECTION.subtitle" class="on-stage__subtitle">
              {{ ON_STAGE_SECTION.subtitle }}
            </p>
          </div>

          <a
            v-if="hasMoreFacebookUrl"
            class="on-stage__more"
            :href="ON_STAGE_SECTION.moreFacebookUrl!"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{{ ON_STAGE_SECTION.moreLabel }}</span>
            <ArrowRight :size="16" :stroke-width="2" aria-hidden="true" />
          </a>
        </header>

        <div class="on-stage__viewport">
          <div class="on-stage__rail" role="list">
            <div
              v-for="clip in ON_STAGE_CLIPS"
              :key="clip.id"
              class="on-stage__item"
              role="listitem"
            >
              <button
                type="button"
                class="stage-card"
                :data-clip-id="clip.id"
                aria-haspopup="dialog"
                :aria-label="buildCardAriaLabel(clip)"
                @click="openClipModal(clip, $event)"
              >
                <img
                  class="stage-card__img"
                  :src="clip.coverSrc"
                  :alt="clip.coverAlt"
                  :width="clip.coverWidth"
                  :height="clip.coverHeight"
                  :style="{ objectPosition: clip.coverObjectPosition ?? '50% 20%' }"
                  loading="lazy"
                  decoding="async"
                />

                <span v-if="clip.isPlaceholder" class="stage-card__badge">
                  {{ ON_STAGE_SECTION.placeholderBadge }}
                </span>

                <span class="stage-card__play" aria-hidden="true">
                  <Play class="stage-card__play-icon" :size="14" :stroke-width="2" />
                </span>

                <div class="stage-card__scrim" aria-hidden="true"></div>

                <span class="stage-card__caption">
                  <span v-if="clip.eventName?.trim()" class="stage-card__event">
                    {{ clip.eventName }}
                  </span>
                  <span class="stage-card__clip-title">{{ clip.title }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hộp thoại xem video 9:16 ở giữa màn hình — chỉ nạp thẻ <video> khi người xem bấm mở thẻ -->
    <dialog
      ref="dialogRef"
      class="stage-modal"
      :aria-label="activeClip ? activeClip.title : ON_STAGE_SECTION.heading"
      @cancel="onDialogCancel"
      @click="onDialogBackdropClick"
    >
      <div v-if="activeClip" ref="frameRef" class="stage-modal__frame">
        <button
          ref="closeBtnRef"
          type="button"
          class="stage-modal__close"
          :aria-label="ON_STAGE_SECTION.closeModalLabel"
          @click="closeModal"
        >
          <X :size="20" :stroke-width="2" aria-hidden="true" />
        </button>

        <!-- Khi đã gắn videoSrc (MP4): phát một lần với controls & playsinline, giữ hộp thoại mở sau khi phát xong -->
        <video
          v-if="hasVideoSrc(activeClip)"
          ref="videoRef"
          :key="activeClip.id"
          class="stage-modal__video"
          :src="activeClip.videoSrc"
          :poster="activeClip.coverSrc"
          controls
          playsinline
          preload="metadata"
        ></video>

        <!-- Khi chưa gắn clip MP4: hiển thị ảnh bìa gốc 9:16 kèm dòng “Video sẽ được cập nhật” -->
        <div v-else class="stage-modal__pending" data-video-state="pending">
          <img
            class="stage-modal__poster"
            :src="activeClip.coverSrc"
            :alt="activeClip.coverAlt"
            :width="activeClip.coverWidth"
            :height="activeClip.coverHeight"
            :style="{ objectPosition: activeClip.coverObjectPosition ?? '50% 20%' }"
          />

          <div class="stage-modal__scrim" aria-hidden="true"></div>

          <div class="stage-modal__pending-body">
            <p class="stage-modal__pending-badge" role="status">
              <span class="stage-modal__pending-dot" aria-hidden="true"></span>
              <span>{{ ON_STAGE_SECTION.videoPendingMessage }}</span>
            </p>
            <h3 class="stage-modal__pending-title">{{ activeClip.title }}</h3>
          </div>
        </div>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.on-stage {
  background: var(--color-paper-blush);
  border-top: var(--rule-hairline);
  padding-block: clamp(2.75rem, 4.5vw, 4rem) clamp(3.75rem, 6vw, 5.5rem);
  scroll-margin-top: calc(var(--header-height) + var(--space-xs));
}

.on-stage__inner {
  display: flex;
  flex-direction: column;
}

.on-stage__cluster {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.25rem);
  min-width: 0;
}

.on-stage__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  width: 100%;
}

.on-stage__heading-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  min-width: 0;
}

.on-stage__title {
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

.on-stage__subtitle {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-ink-2);
  max-width: 58ch;
}

.on-stage__more {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 44px;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 1.5px solid var(--color-accent);
  transition: color var(--dur-micro) var(--ease-out);
}

.on-stage__more:hover {
  color: var(--color-ink-2);
}

/* Mobile horizontal swipe rail — vuốt ngang trong khung, không gây tràn ngang toàn trang */
.on-stage__viewport {
  margin-inline: calc(var(--page-gutter) * -1);
  padding-inline: var(--page-gutter);
  padding-block: var(--space-2xs) var(--space-sm);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scroll-padding-inline-start: var(--page-gutter);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.on-stage__viewport::-webkit-scrollbar {
  display: none;
}

.on-stage__rail {
  display: flex;
  align-items: stretch;
  gap: var(--space-md);
  width: max-content;
}

.on-stage__item {
  flex: 0 0 clamp(11.5rem, 53vw, 13.5rem);
  scroll-snap-align: start;
  min-width: 0;
}

.stage-card {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  aspect-ratio: 9 / 16;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-paper-3);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card);
  color: var(--color-stage-ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition:
    transform var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out);
}

.stage-card:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.stage-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-long) var(--ease-out);
}

.stage-card__badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  z-index: var(--z-raised);
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

.stage-card__play {
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

.stage-card__play-icon {
  fill: currentColor;
  transform: translateX(1px);
}

.stage-card__scrim {
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

.stage-card__caption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-raised);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

.stage-card__event {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.35;
  color: var(--color-stage-meta);
  overflow-wrap: anywhere;
}

.stage-card__clip-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem);
  font-weight: 500;
  line-height: 1.28;
  color: var(--color-stage-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

@media (hover: hover) and (pointer: fine) {
  .stage-card:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: var(--color-ink-2);
  }

  .stage-card:hover:not(:disabled) .stage-card__img {
    transform: scale(1.03);
  }

  .stage-card:hover:not(:disabled) .stage-card__play {
    background: var(--color-accent-hover);
    transform: scale(1.06);
  }
}

.stage-card:active:not(:disabled) {
  transform: translateY(0);
}

/* Hộp thoại xem video dọc 9:16 ở chính giữa màn hình */
.stage-modal {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: clamp(0.75rem, 3vw, 1.5rem);
  border: 0;
  background: transparent;
  overflow: hidden;
}

.stage-modal[open] {
  display: grid;
  place-items: center;
}

.stage-modal::backdrop {
  background: var(--color-modal-backdrop);
  backdrop-filter: blur(3px);
  animation: modal-backdrop-in var(--dur-short) var(--ease-out) forwards;
}

/* Tự co theo cả chiều rộng lẫn chiều cao màn hình để trên điện thoại luôn thấy trọn khung 9:16 + nút đóng */
.stage-modal__frame {
  position: relative;
  width: min(calc(100vw - 1.75rem), calc((100dvh - 2.5rem) * 9 / 16), 24.5rem);
  aspect-ratio: 9 / 16;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-ink);
  border: 1px solid var(--color-modal-close-border);
  box-shadow: var(--shadow-modal);
  animation: modal-frame-in var(--dur-short) var(--ease-out) forwards;
}

.stage-modal__close {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: var(--z-sticky);
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-modal-close-border);
  background: var(--color-modal-close-bg);
  color: var(--color-stage-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.stage-modal__close:hover {
  background: var(--color-modal-close-hover);
}

.stage-modal__close:active {
  transform: scale(0.97);
}

.stage-modal__close:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.stage-modal__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--color-ink);
}

.stage-modal__pending {
  position: relative;
  width: 100%;
  height: 100%;
}

.stage-modal__poster {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-modal__scrim {
  position: absolute;
  inset: 38% 0 0 0;
  background: linear-gradient(
    to top,
    var(--color-stage-scrim-strong) 0%,
    var(--color-stage-scrim-mid) 58%,
    transparent 100%
  );
  pointer-events: none;
}

.stage-modal__pending-body {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-raised);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.stage-modal__pending-badge {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-pill);
  background: var(--color-stage-badge-bg);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.4;
}

.stage-modal__pending-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
}

.stage-modal__pending-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 0.5vw + 1rem, 1.375rem);
  font-weight: 500;
  line-height: 1.28;
  color: var(--color-stage-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
}

@keyframes modal-backdrop-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-frame-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-modal__frame {
    animation: modal-backdrop-in 150ms linear forwards;
    transform: none;
  }
}

@media (min-width: 40rem) {
  .on-stage__head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

@media (min-width: 62rem) {
  .on-stage__cluster {
    width: fit-content;
    max-width: 100%;
    margin-inline: auto;
  }

  .on-stage__viewport {
    margin-inline: calc(var(--space-md) * -1);
    padding-inline: var(--space-md);
    padding-block: var(--space-xs) var(--space-lg);
    scrollbar-width: thin;
  }

  .on-stage__rail {
    gap: var(--space-lg);
  }

  .on-stage__item {
    flex: 0 0 clamp(13rem, 15.6vw, 14.5rem);
  }
}
</style>

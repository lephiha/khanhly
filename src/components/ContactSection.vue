<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
} from 'lucide-vue-next'
import {
  CONTACT_DIRECT_INFO,
  CONTACT_FORM_INTEGRATION,
  CONTACT_SECTION_COPY,
  CONTACT_TOPIC_OPTIONS,
  buildGoogleMapsDirectionsUrl,
  hasConfiguredContactEndpoint,
  isValidContactTopic,
  type ContactTopicId,
} from '../config/contactForm'
import { useContactNavigation } from '../composables/useContactNavigation'

type FieldKey = 'name' | 'email' | 'topic' | 'message'

interface SubmitOutcome {
  kind: 'preview' | 'success' | 'error'
  message: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const { selectedTopicIntent, selectionRevision, syncContactIntentFromLocation } =
  useContactNavigation()

const form = reactive<{
  name: string
  email: string
  topic: ContactTopicId | ''
  message: string
}>({
  name: '',
  email: '',
  topic: '',
  message: '',
})

const touched = reactive<Record<FieldKey, boolean>>({
  name: false,
  email: false,
  topic: false,
  message: false,
})

const errors = reactive<Record<FieldKey, string>>({
  name: '',
  email: '',
  topic: '',
  message: '',
})

const isSubmitting = ref(false)
const submitOutcome = ref<SubmitOutcome | null>(null)

const nameInputRef = ref<HTMLInputElement | null>(null)
const emailInputRef = ref<HTMLInputElement | null>(null)
const topicSelectRef = ref<HTMLSelectElement | null>(null)
const messageTextareaRef = ref<HTMLTextAreaElement | null>(null)

const isPreviewMode = computed(() => !hasConfiguredContactEndpoint())

const hasMessengerUrl = computed(() => {
  return Boolean(
    CONTACT_DIRECT_INFO.messengerUrl && CONTACT_DIRECT_INFO.messengerUrl.trim().length > 0
  )
})

const googleMapsDirectionsUrl = computed(() => buildGoogleMapsDirectionsUrl(CONTACT_DIRECT_INFO))

function validateField(field: FieldKey): string {
  switch (field) {
    case 'name': {
      return form.name.trim().length > 0 ? '' : CONTACT_SECTION_COPY.errors.nameRequired
    }
    case 'email': {
      const trimmed = form.email.trim()
      if (!trimmed) return CONTACT_SECTION_COPY.errors.emailRequired
      return EMAIL_PATTERN.test(trimmed) ? '' : CONTACT_SECTION_COPY.errors.emailInvalid
    }
    case 'topic': {
      return isValidContactTopic(form.topic) ? '' : CONTACT_SECTION_COPY.errors.topicRequired
    }
    case 'message': {
      return form.message.trim().length > 0 ? '' : CONTACT_SECTION_COPY.errors.messageRequired
    }
  }
}

function handleBlur(field: FieldKey) {
  touched[field] = true
  errors[field] = validateField(field)
}

function handleInput(field: FieldKey) {
  if (submitOutcome.value?.kind === 'success') {
    submitOutcome.value = null
  }
  if (touched[field]) {
    errors[field] = validateField(field)
  }
}

function validateAllFields(): boolean {
  const fields: FieldKey[] = ['name', 'email', 'topic', 'message']
  let firstInvalid: FieldKey | null = null

  for (const field of fields) {
    touched[field] = true
    const err = validateField(field)
    errors[field] = err
    if (err && !firstInvalid) {
      firstInvalid = field
    }
  }

  if (firstInvalid) {
    focusField(firstInvalid)
    return false
  }

  return true
}

function focusField(field: FieldKey) {
  const map: Record<FieldKey, HTMLElement | null> = {
    name: nameInputRef.value,
    email: emailInputRef.value,
    topic: topicSelectRef.value,
    message: messageTextareaRef.value,
  }
  map[field]?.focus()
}

function getSelectedTopicLabel(topicId: ContactTopicId | ''): string {
  return CONTACT_TOPIC_OPTIONS.find((opt) => opt.value === topicId)?.label ?? ''
}

async function handleSubmit() {
  if (isSubmitting.value) return

  submitOutcome.value = null
  const isValid = validateAllFields()
  if (!isValid) return

  // Chế độ xem trước khi chưa gắn endpoint: thông báo rõ và giữ nguyên toàn bộ dữ liệu khách đã nhập
  if (isPreviewMode.value || !CONTACT_FORM_INTEGRATION.endpointUrl) {
    submitOutcome.value = {
      kind: 'preview',
      message: CONTACT_SECTION_COPY.messages.previewSubmitted,
    }
    return
  }

  isSubmitting.value = true
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), CONTACT_FORM_INTEGRATION.timeoutMs)

  try {
    const payload: Record<string, string> = {
      name: form.name.trim(),
      email: form.email.trim(),
      topic: form.topic,
      topicLabel: getSelectedTopicLabel(form.topic),
      message: form.message.trim(),
    }

    if (CONTACT_FORM_INTEGRATION.publicFormKey) {
      payload.access_key = CONTACT_FORM_INTEGRATION.publicFormKey
    }

    const response = await fetch(CONTACT_FORM_INTEGRATION.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as Record<string, unknown>
      if (data.ok === false || data.success === false) {
        throw new Error('Endpoint rejected submission')
      }
    }

    submitOutcome.value = {
      kind: 'success',
      message: CONTACT_SECTION_COPY.messages.liveSuccess,
    }
    form.name = ''
    form.email = ''
    form.topic = ''
    form.message = ''
    touched.name = false
    touched.email = false
    touched.topic = false
    touched.message = false
  } catch {
    submitOutcome.value = {
      kind: 'error',
      message: CONTACT_SECTION_COPY.messages.liveError,
    }
  } finally {
    window.clearTimeout(timer)
    isSubmitting.value = false
  }
}

watch(
  [selectedTopicIntent, selectionRevision],
  ([nextTopic]) => {
    if (nextTopic && isValidContactTopic(nextTopic)) {
      form.topic = nextTopic
      errors.topic = ''
      if (submitOutcome.value) {
        submitOutcome.value = null
      }
    }
  },
  { immediate: true }
)

function onHashChange() {
  syncContactIntentFromLocation()
}

onMounted(() => {
  syncContactIntentFromLocation()
  window.addEventListener('hashchange', onHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<template>
  <section
    :id="CONTACT_SECTION_COPY.id"
    class="contact"
    aria-labelledby="contact-heading"
    tabindex="-1"
  >
    <div class="container contact__inner">
      <!-- Cột trái trên desktop / xếp phía trên form trên mobile -->
      <div class="contact__intro">
        <span class="contact__accent-rule" aria-hidden="true"></span>

        <h2 id="contact-heading" class="contact__title">
          {{ CONTACT_SECTION_COPY.heading }}
        </h2>

        <p class="contact__lead">
          {{ CONTACT_SECTION_COPY.lead }}
        </p>

        <!-- Các hàng liên hệ trực tiếp có icon, bấm toàn hàng -->
        <ul class="contact__direct-list" aria-label="Thông tin liên hệ trực tiếp">
          <!-- Hotline -->
          <li class="contact__direct-item">
            <a
              class="contact-row"
              :href="CONTACT_DIRECT_INFO.hotlineHref"
              data-contact-channel="hotline"
            >
              <span class="contact-row__icon" aria-hidden="true">
                <Phone :size="18" :stroke-width="1.85" />
              </span>
              <span class="contact-row__body">
                <span class="contact-row__label">{{ CONTACT_DIRECT_INFO.hotlineLabel }}</span>
                <span class="contact-row__value contact-row__value--num">
                  {{ CONTACT_DIRECT_INFO.hotlineDisplay }}
                </span>
              </span>
            </a>
          </li>

          <!-- Zalo -->
          <li class="contact__direct-item">
            <a
              class="contact-row"
              :href="CONTACT_DIRECT_INFO.zaloHref"
              target="_blank"
              rel="noopener noreferrer"
              data-contact-channel="zalo"
            >
              <span class="contact-row__icon" aria-hidden="true">
                <MessageCircle :size="18" :stroke-width="1.85" />
              </span>
              <span class="contact-row__body">
                <span class="contact-row__label">{{ CONTACT_DIRECT_INFO.zaloLabel }}</span>
                <span class="contact-row__value contact-row__value--num">
                  {{ CONTACT_DIRECT_INFO.zaloDisplay }}
                </span>
              </span>
              <ArrowUpRight
                class="contact-row__ext"
                :size="15"
                :stroke-width="1.85"
                aria-hidden="true"
              />
            </a>
          </li>

          <!-- Email -->
          <li class="contact__direct-item">
            <a
              class="contact-row"
              :href="CONTACT_DIRECT_INFO.emailHref"
              data-contact-channel="email"
            >
              <span class="contact-row__icon" aria-hidden="true">
                <Mail :size="18" :stroke-width="1.85" />
              </span>
              <span class="contact-row__body">
                <span class="contact-row__label">{{ CONTACT_DIRECT_INFO.emailLabel }}</span>
                <span class="contact-row__value">
                  {{ CONTACT_DIRECT_INFO.emailDisplay }}
                </span>
              </span>
            </a>
          </li>

          <!-- Facebook Messenger — chỉ hiện khi có link chat chính xác của chị Ly -->
          <li v-if="hasMessengerUrl" class="contact__direct-item">
            <a
              class="contact-row"
              :href="CONTACT_DIRECT_INFO.messengerUrl!"
              target="_blank"
              rel="noopener noreferrer"
              data-contact-channel="messenger"
            >
              <span class="contact-row__icon" aria-hidden="true">
                <MessageSquare :size="18" :stroke-width="1.85" />
              </span>
              <span class="contact-row__body">
                <span class="contact-row__label">{{ CONTACT_DIRECT_INFO.messengerLabel }}</span>
                <span class="contact-row__value">
                  {{ CONTACT_DIRECT_INFO.messengerDisplay }}
                </span>
              </span>
              <ArrowUpRight
                class="contact-row__ext"
                :size="15"
                :stroke-width="1.85"
                aria-hidden="true"
              />
            </a>
          </li>

          <!-- Địa chỉ + Chỉ đường trên Google Maps -->
          <li class="contact__direct-item">
            <a
              class="contact-row contact-row--address"
              :href="googleMapsDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              data-contact-channel="address"
            >
              <span class="contact-row__icon" aria-hidden="true">
                <MapPin :size="18" :stroke-width="1.85" />
              </span>
              <span class="contact-row__body">
                <span class="contact-row__label-line">
                  <span class="contact-row__label">{{ CONTACT_DIRECT_INFO.addressLabel }}</span>
                  <span class="contact-row__directions">
                    <span>{{ CONTACT_DIRECT_INFO.directionsLabel }}</span>
                    <ArrowUpRight :size="13" :stroke-width="2" aria-hidden="true" />
                  </span>
                </span>
                <span class="contact-row__value contact-row__value--address">
                  {{ CONTACT_DIRECT_INFO.addressDisplay }}
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Cột phải trên desktop / bên dưới thông tin liên hệ trên mobile -->
      <div class="contact__panel">
        <form class="contact-form" novalidate @submit.prevent="handleSubmit">
          <div class="contact-form__row">
            <!-- Họ tên -->
            <div class="contact-field">
              <label class="contact-field__label" for="contact-name">
                {{ CONTACT_SECTION_COPY.fields.nameLabel }}
              </label>
              <input
                id="contact-name"
                ref="nameInputRef"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="name"
                required
                class="contact-field__control contact-field__control--single"
                :class="{ 'is-invalid': Boolean(errors.name) }"
                :placeholder="CONTACT_SECTION_COPY.fields.namePlaceholder"
                :disabled="isSubmitting"
                :aria-disabled="isSubmitting ? 'true' : undefined"
                :aria-invalid="errors.name ? 'true' : undefined"
                :aria-describedby="errors.name ? 'contact-name-error' : undefined"
                @blur="handleBlur('name')"
                @input="handleInput('name')"
              />
              <p
                id="contact-name-error"
                class="contact-field__feedback"
                :class="{ 'is-visible': Boolean(errors.name) }"
              >
                <template v-if="errors.name">
                  <AlertCircle
                    class="contact-field__feedback-icon"
                    :size="14"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  <span>{{ errors.name }}</span>
                </template>
              </p>
            </div>

            <!-- Email -->
            <div class="contact-field">
              <label class="contact-field__label" for="contact-email">
                {{ CONTACT_SECTION_COPY.fields.emailLabel }}
              </label>
              <input
                id="contact-email"
                ref="emailInputRef"
                v-model="form.email"
                type="email"
                name="email"
                inputmode="email"
                autocomplete="email"
                required
                class="contact-field__control contact-field__control--single"
                :class="{ 'is-invalid': Boolean(errors.email) }"
                :placeholder="CONTACT_SECTION_COPY.fields.emailPlaceholder"
                :disabled="isSubmitting"
                :aria-disabled="isSubmitting ? 'true' : undefined"
                :aria-invalid="errors.email ? 'true' : undefined"
                :aria-describedby="errors.email ? 'contact-email-error' : undefined"
                @blur="handleBlur('email')"
                @input="handleInput('email')"
              />
              <p
                id="contact-email-error"
                class="contact-field__feedback"
                :class="{ 'is-visible': Boolean(errors.email) }"
              >
                <template v-if="errors.email">
                  <AlertCircle
                    class="contact-field__feedback-icon"
                    :size="14"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  <span>{{ errors.email }}</span>
                </template>
              </p>
            </div>
          </div>

          <!-- Chủ đề -->
          <div class="contact-field">
            <label class="contact-field__label" for="contact-topic">
              {{ CONTACT_SECTION_COPY.fields.topicLabel }}
            </label>
            <div class="contact-field__select-wrap">
              <select
                id="contact-topic"
                ref="topicSelectRef"
                v-model="form.topic"
                name="topic"
                required
                class="contact-field__control contact-field__control--single contact-field__control--select"
                :class="{
                  'is-placeholder': !form.topic,
                  'is-invalid': Boolean(errors.topic),
                }"
                :disabled="isSubmitting"
                :aria-disabled="isSubmitting ? 'true' : undefined"
                :aria-invalid="errors.topic ? 'true' : undefined"
                :aria-describedby="errors.topic ? 'contact-topic-error' : undefined"
                @blur="handleBlur('topic')"
                @change="handleInput('topic')"
              >
                <option value="" disabled>
                  {{ CONTACT_SECTION_COPY.fields.topicPlaceholder }}
                </option>
                <option
                  v-for="option in CONTACT_TOPIC_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <ChevronDown
                class="contact-field__select-icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </div>
            <p
              id="contact-topic-error"
              class="contact-field__feedback"
              :class="{ 'is-visible': Boolean(errors.topic) }"
            >
              <template v-if="errors.topic">
                <AlertCircle
                  class="contact-field__feedback-icon"
                  :size="14"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <span>{{ errors.topic }}</span>
              </template>
            </p>
          </div>

          <!-- Lời nhắn -->
          <div class="contact-field">
            <label class="contact-field__label" for="contact-message">
              {{ CONTACT_SECTION_COPY.fields.messageLabel }}
            </label>
            <textarea
              id="contact-message"
              ref="messageTextareaRef"
              v-model="form.message"
              name="message"
              rows="4"
              required
              class="contact-field__control contact-field__control--textarea"
              :class="{ 'is-invalid': Boolean(errors.message) }"
              :placeholder="CONTACT_SECTION_COPY.fields.messagePlaceholder"
              :disabled="isSubmitting"
              :aria-disabled="isSubmitting ? 'true' : undefined"
              :aria-invalid="errors.message ? 'true' : undefined"
              :aria-describedby="errors.message ? 'contact-message-error' : undefined"
              @blur="handleBlur('message')"
              @input="handleInput('message')"
            ></textarea>
            <p
              id="contact-message-error"
              class="contact-field__feedback"
              :class="{ 'is-visible': Boolean(errors.message) }"
            >
              <template v-if="errors.message">
                <AlertCircle
                  class="contact-field__feedback-icon"
                  :size="14"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <span>{{ errors.message }}</span>
              </template>
            </p>
          </div>

          <!-- Nút gửi & trạng thái chế độ xem trước đặt ngay cạnh nút gửi -->
          <div class="contact-form__footer">
            <div class="contact-form__actions">
              <button
                type="submit"
                class="contact-submit"
                :disabled="isSubmitting"
                :aria-disabled="isSubmitting ? 'true' : undefined"
              >
                <span class="contact-submit__label">
                  {{
                    isSubmitting
                      ? CONTACT_SECTION_COPY.submittingLabel
                      : CONTACT_SECTION_COPY.submitLabel
                  }}
                </span>
                <span class="contact-submit__icon" aria-hidden="true">
                  <ArrowRight :size="16" :stroke-width="2" />
                </span>
              </button>

              <p
                v-if="isPreviewMode"
                class="contact-form__mode-inline"
                data-form-mode="preview"
              >
                <span class="contact-form__mode-dot" aria-hidden="true"></span>
                <span>{{ CONTACT_SECTION_COPY.previewModeBadge }}</span>
              </p>
            </div>

            <div
              class="contact-form__status-slot"
              :role="submitOutcome?.kind === 'error' ? 'alert' : 'status'"
              aria-live="polite"
            >
              <div
                v-if="submitOutcome"
                class="contact-status"
                :class="`contact-status--${submitOutcome.kind}`"
                :data-submit-state="submitOutcome.kind"
              >
                <CheckCircle2
                  v-if="submitOutcome.kind === 'success'"
                  class="contact-status__icon"
                  :size="18"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <AlertCircle
                  v-else-if="submitOutcome.kind === 'error'"
                  class="contact-status__icon"
                  :size="18"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <Info
                  v-else
                  class="contact-status__icon"
                  :size="18"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <p class="contact-status__text">{{ submitOutcome.message }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: var(--color-paper);
  border-top: var(--rule-hairline);
  padding-block: clamp(3.25rem, 5.5vw, 5rem) clamp(3.75rem, 6.5vw, 5.5rem);
  scroll-margin-top: calc(var(--header-height) + var(--space-xs));
}

.contact:focus:not(:focus-visible) {
  outline: none;
}

.contact__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.75rem, 4vw, 3.5rem);
  max-width: 74rem;
}

.contact__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.contact__accent-rule {
  display: block;
  width: 2.5rem;
  height: 2.5px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  margin-bottom: var(--space-md);
}

.contact__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 1.85vw + 0.9rem, 2.5rem);
  font-weight: 500;
  font-variation-settings: 'opsz' 72, 'SOFT' 30;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-wrap: balance;
  overflow-wrap: anywhere;
  min-width: 0;
}

.contact__lead {
  margin: var(--space-md) 0 0;
  max-width: 46ch;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.62;
  color: var(--color-ink-2);
}

/* Danh sách các hàng liên hệ trực tiếp bên dưới lời giới thiệu */
.contact__direct-list {
  list-style: none;
  margin: var(--space-lg) 0 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.contact__direct-item {
  width: 100%;
  min-width: 0;
}

.contact-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  min-height: 3.5rem;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-surface-white);
  border: 1px solid var(--color-rule);
  color: var(--color-ink);
  text-decoration: none;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}

.contact-row--address {
  align-items: flex-start;
  padding-block: var(--space-md);
}

.contact-row__icon {
  width: 2.375rem;
  height: 2.375rem;
  border-radius: var(--radius-sm);
  background: var(--color-paper-blush);
  border: 1px solid var(--color-rule-2);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}

.contact-row--address .contact-row__icon {
  margin-top: 0.125rem;
}

.contact-row__body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.contact-row__label-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
}

.contact-row__label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.35;
  color: var(--color-muted);
}

.contact-row__value {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.45;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}

.contact-row__value--num {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.contact-row__value--address {
  font-weight: 500;
  line-height: 1.5;
}

.contact-row__ext {
  color: var(--color-muted);
  flex-shrink: 0;
  transition:
    color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.contact-row__directions {
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.125rem var(--space-xs);
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  transition: background-color var(--dur-micro) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .contact-row:hover {
    background: var(--color-paper-blush);
    border-color: var(--color-ink-2);
  }

  .contact-row:hover .contact-row__icon {
    background: var(--color-accent-soft);
    border-color: var(--color-accent);
  }

  .contact-row:hover .contact-row__ext {
    color: var(--color-ink);
    transform: translate(1px, -1px);
  }

  .contact-row:hover .contact-row__directions {
    background: var(--color-accent);
  }
}

.contact-row:active {
  background: var(--color-paper-2);
}

.contact__panel {
  min-width: 0;
}

.contact-form {
  padding: clamp(1.25rem, 3.5vw, 2.25rem);
  border-radius: var(--radius-lg);
  background: var(--color-surface-white);
  border: var(--rule-hairline);
  box-shadow: var(--shadow-card), var(--edge-highlight);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

/* Mobile-first (< 40rem): 1 cột cho toàn bộ trường */
.contact-form__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-2xs);
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  min-width: 0;
}

.contact-field__label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-ink);
}

/* Hallmark Gates 41, 42, 43, 45 */
.contact-field__control {
  width: 100%;
  min-width: 0;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-rule);
  outline: 2px solid transparent;
  outline-offset: 1px;
  background: var(--color-field-bg);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.5;
  transition:
    border-color var(--dur-micro) var(--ease-out),
    background-color var(--dur-micro) var(--ease-out);
}

.contact-field__control--single {
  height: 3rem;
  min-height: 3rem;
}

.contact-field__control--textarea {
  min-height: 7.5rem;
  resize: vertical;
}

.contact-field__control::placeholder {
  color: var(--color-neutral);
}

@media (hover: hover) and (pointer: fine) {
  .contact-field__control:hover:not(:disabled):not(.is-invalid) {
    border-color: var(--color-field-hover-border);
  }
}

.contact-field__control:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
  border-color: var(--color-ink);
}

.contact-field__control.is-invalid {
  border-color: var(--color-error-border);
  background: var(--color-error-bg);
}

.contact-field__control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: var(--color-field-disabled-bg);
}

.contact-field__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.contact-field__control--select {
  appearance: none;
  padding-inline-end: var(--space-xl);
  cursor: pointer;
}

.contact-field__control--select.is-placeholder {
  color: var(--color-muted);
}

.contact-field__control--select option {
  color: var(--color-ink);
  background: var(--color-field-bg);
}

.contact-field__select-icon {
  position: absolute;
  right: var(--space-md);
  color: var(--color-ink-2);
  pointer-events: none;
}

.contact-field__feedback {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  min-height: 1.25rem;
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-error);
}

.contact-field__feedback-icon {
  flex-shrink: 0;
}

.contact-form__footer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-md);
  margin-top: var(--space-xs);
}

.contact-form__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-sm);
}

/* Nút Gửi lời nhắn: chiều cao 3rem (48px) khớp với các trường input & select */
.contact-submit {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  height: 3rem;
  min-height: 3rem;
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-lg);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-ink);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}

.contact-submit__label {
  white-space: nowrap;
}

.contact-submit__icon {
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

.contact-form__mode-inline {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-muted);
}

.contact-form__mode-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  flex-shrink: 0;
}

@media (hover: hover) and (pointer: fine) {
  .contact-submit:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    transform: translateY(-1.5px);
  }

  .contact-submit:hover:not(:disabled) .contact-submit__icon {
    transform: translateX(2px);
  }
}

.contact-submit:active:not(:disabled) {
  transform: translateY(0);
  background: var(--color-accent-active);
}

.contact-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.contact-form__status-slot {
  min-height: 0.25rem;
}

.contact-status {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-rule);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.contact-status--preview {
  background: var(--color-status-preview-bg);
  border-color: var(--color-status-preview-border);
  color: var(--color-ink);
}

.contact-status--success {
  background: var(--color-status-success-bg);
  border-color: var(--color-status-success-border);
  color: var(--color-status-success);
}

.contact-status--error {
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error);
}

.contact-status__icon {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.contact-status--preview .contact-status__icon {
  color: var(--color-ink);
}

.contact-status__text {
  margin: 0;
}

/* Tablet & Desktop (>= 40rem): Họ tên + Email trên cùng hàng; trạng thái xem trước nằm ngay cạnh nút Gửi */
@media (min-width: 40rem) {
  .contact-form__row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-md);
  }

  .contact-form__actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md);
  }

  .contact-submit {
    width: auto;
    justify-content: center;
  }
}

/* Desktop (>= 60rem): Bố cục 2 cột — thông tin liên hệ bên trái, form bên phải */
@media (min-width: 60rem) {
  .contact__inner {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
  }

  .contact__intro {
    padding-top: var(--space-2xs);
  }
}
</style>

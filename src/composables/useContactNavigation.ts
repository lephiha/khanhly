import { ref } from 'vue'
import {
  CONTACT_SECTION_COPY,
  isValidContactTopic,
  type ContactTopicId,
} from '../config/contactForm'

const selectedTopicIntent = ref<ContactTopicId | ''>('')
const selectionRevision = ref(0)

export function parseContactHash(hash: string): {
  isContactTarget: boolean
  topic: ContactTopicId | null
} {
  if (!hash || !hash.startsWith('#')) {
    return { isContactTarget: false, topic: null }
  }

  const raw = hash.slice(1)
  const [sectionId, queryString = ''] = raw.split('?')
  if (sectionId !== CONTACT_SECTION_COPY.id) {
    return { isContactTarget: false, topic: null }
  }

  const params = new URLSearchParams(queryString)
  const topicParam = params.get('topic') ?? ''
  return {
    isContactTarget: true,
    topic: isValidContactTopic(topicParam) ? topicParam : null,
  }
}

export function buildContactHref(topic?: ContactTopicId): string {
  if (!topic) {
    return `#${CONTACT_SECTION_COPY.id}`
  }
  return `#${CONTACT_SECTION_COPY.id}?topic=${topic}`
}

export function syncContactIntentFromLocation(): void {
  if (typeof window === 'undefined') return
  const parsed = parseContactHash(window.location.hash)
  if (parsed.isContactTarget && parsed.topic) {
    selectedTopicIntent.value = parsed.topic
    selectionRevision.value += 1
  }
}

export function navigateToContact(topic?: ContactTopicId, event?: Event): void {
  if (typeof window === 'undefined') return

  if (event) {
    event.preventDefault()
  }

  // Khi nút truyền `topic` -> chọn sẵn chủ đề đó; khi không truyền `topic` (ví dụ “Liên hệ hợp tác”) -> để trống cho khách tự chọn
  selectedTopicIntent.value = topic ?? ''
  selectionRevision.value += 1

  const targetHref = buildContactHref(topic)
  if (window.location.hash !== targetHref) {
    window.history.replaceState(null, '', targetHref)
  }

  const sectionEl = document.getElementById(CONTACT_SECTION_COPY.id)
  if (!sectionEl) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  sectionEl.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  })

  sectionEl.focus({ preventScroll: true })
}

export function useContactNavigation() {
  return {
    selectedTopicIntent,
    selectionRevision,
    navigateToContact,
    syncContactIntentFromLocation,
  }
}

import { onBeforeUnmount, onMounted, type Ref } from 'vue'

function smoothstep(edge0: number, edge1: number, x: number): number {
  const span = Math.max(edge1 - edge0, 0.0001)
  const t = Math.max(0, Math.min(1, (x - edge0) / span))
  return t * t * (3 - 2 * t)
}

/**
 * Điều phối chuyển cảnh cuộn tự nhiên từ cuối #hero sang #video-series:
 * - Xuất biến CSS `--hero-handoff-p` (0 -> 1) lên phần tử gốc `<main>` qua 1 RAF/frame.
 * - Giữ tiến độ = 0 ở đầu trang, tập trung chuyển động ở đoạn cuối hero và đảo chiều mượt khi cuộn lên.
 * - Khi bật `prefers-reduced-motion: reduce`, đặt cứng `0` để hai mục cuộn bình thường.
 */
export function useHeroVideoHandoff(stageRef: Ref<HTMLElement | null>) {
  let rafId: number | null = null
  let reducedMotionMql: MediaQueryList | null = null
  let lastApplied = -1

  function applyProgress(nextValue: number) {
    const el = stageRef.value
    if (!el) return
    const rounded = Number(nextValue.toFixed(4))
    if (rounded === lastApplied) return
    lastApplied = rounded
    el.style.setProperty('--hero-handoff-p', String(rounded))
  }

  function updateHandoff() {
    rafId = null

    if (reducedMotionMql?.matches) {
      applyProgress(0)
      return
    }

    const heroEl = document.getElementById('hero')
    if (!heroEl) return

    const headerEl = document.querySelector('.site-header') as HTMLElement | null
    const headerHeight = headerEl ? headerEl.offsetHeight : 72
    const heroRect = heroEl.getBoundingClientRect()
    const heroHeight = Math.max(heroEl.offsetHeight, 1)

    // Khoảng đã cuộn qua vị trí nghỉ ban đầu của #hero (tại scrollY = 0 thì heroRect.top === headerHeight => scrolled = 0)
    const scrolled = Math.max(0, headerHeight - heroRect.top)
    const raw = scrolled / heroHeight

    // Tối ưu: khi ở đầu trang hoặc đã cuộn hẳn qua vùng chuyển cảnh, không ghi lại DOM nếu giá trị đã chốt
    if (raw <= 0) {
      applyProgress(0)
      return
    }
    if (raw >= 1.05) {
      applyProgress(1)
      return
    }

    const isDesktop = window.innerWidth >= 960
    const startRatio = isDesktop ? 0.16 : 0.36
    const endRatio = 0.96

    applyProgress(smoothstep(startRatio, endRatio, raw))
  }

  function scheduleUpdate() {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updateHandoff)
    }
  }

  function onReducedMotionChange() {
    lastApplied = -1
    scheduleUpdate()
  }

  onMounted(() => {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionMql.addEventListener('change', onReducedMotionChange)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    updateHandoff()
  })

  onBeforeUnmount(() => {
    reducedMotionMql?.removeEventListener('change', onReducedMotionChange)
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
    }
  })
}


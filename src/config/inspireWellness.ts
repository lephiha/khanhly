import reelCover2383579015791551 from '../assets/images/reels/2383579015791551.jpg'
import reelCover1818842979364024 from '../assets/images/reels/1818842979364024.jpg'
import reelCover2377447369675924 from '../assets/images/reels/2377447369675924.jpg'
import reelCover1137207755955189 from '../assets/images/reels/1137207755955189.jpg'
import reelCover3261278167408762 from '../assets/images/reels/3261278167408762.jpg'
import reelCover1636549751555465 from '../assets/images/reels/1636549751555465.jpg'
import reelCover1484135439826750 from '../assets/images/reels/1484135439826750.jpg'
import reelCover1443435894073407 from '../assets/images/reels/1443435894073407.jpg'
import reelCover1180628557746539 from '../assets/images/reels/1180628557746539.jpg'
import {
  INSPIRE_WELLNESS_BASE_PATH,
  INSPIRE_WELLNESS_ROUTE_META,
  buildInspireWellnessDetailPath,
  dedupeInspireWellnessBatches,
  extractFacebookReelId,
  normalizeFacebookReelUrl,
  type InspireWellnessBatchEntry,
  type InspireWellnessRouteMeta,
  type RelatedCarePackage,
} from './inspireWellnessRoutes'
import type { ContactTopicId } from './contactForm'

export {
  INSPIRE_WELLNESS_BASE_PATH,
  buildInspireWellnessDetailPath,
  dedupeInspireWellnessBatches,
  extractFacebookReelId,
  normalizeFacebookReelUrl,
  type InspireWellnessBatchEntry,
  type RelatedCarePackage,
}

export interface InspireWellnessEpisode extends InspireWellnessRouteMeta {
  /** Ảnh bìa dọc 9:16 cục bộ (`null` nếu tập mới chưa có ảnh bìa gốc) */
  coverSrc: string | null
}

/**
 * Bảng ánh xạ ảnh bìa cục bộ theo mã `reelId`.
 */
export const REEL_COVER_BY_ID: Readonly<Record<string, string>> = {
  '2383579015791551': reelCover2383579015791551,
  '1818842979364024': reelCover1818842979364024,
  '2377447369675924': reelCover2377447369675924,
  '1137207755955189': reelCover1137207755955189,
  '3261278167408762': reelCover3261278167408762,
  '1636549751555465': reelCover1636549751555465,
  '1484135439826750': reelCover1484135439826750,
  '1443435894073407': reelCover1443435894073407,
  '1180628557746539': reelCover1180628557746539,
}

export const INSPIRE_WELLNESS_PAGE_COPY = {
  heading: 'Inspire Wellness',
  intro: 'Video ngắn từ Khánh Ly về dinh dưỡng và chăm sóc sức khỏe chủ động.',
  cardActionHint: 'Xem chi tiết',
  backToLibraryLabel: 'Quay lại Inspire Wellness',
  watchOnFacebookLabel: 'Xem trên Facebook',
  watchOnFacebookHint: 'Nếu trình duyệt chặn khung nhúng, bạn có thể mở trực tiếp trên Facebook:',
  notFoundHeading: 'Không tìm thấy video này',
  notFoundDescription:
    'Đường dẫn có thể đã thay đổi. Mời bạn quay lại thư viện Inspire Wellness để chọn tập khác.',
} as const

export interface InspireWellnessCompanionConfig {
  heading: string
  intro: string
  wellness: {
    heading: string
    paragraphs: readonly string[]
    /**
     * Đường dẫn trang giới thiệu các gói chăm sóc Nắng Wellness.
     * - Khi đã có trang gói (URL hợp lệ): nút chính hiển thị `packagesCtaLabel` và mở trang gói.
     * - Khi `null` (chưa có trang gói): nút chính hiển thị `fallbackCtaLabel`, dẫn về form Liên hệ trên Home
     *   và chọn sẵn chủ đề sức khỏe (`contactTopic`).
     */
    packagesPageUrl: string | null
    packagesCtaLabel: string
    fallbackCtaLabel: string
    contactTopic: ContactTopicId
  }
  advisory: {
    heading: string
    paragraphs: readonly string[]
    ctaLabel: string
    contactTopic: ContactTopicId
  }
}

/**
 * Nội dung giới thiệu dùng chung hiển thị trên tất cả các trang chi tiết video Inspire Wellness
 * (kể cả các Reel được thêm ở các đợt sau).
 */
export const INSPIRE_WELLNESS_COMPANION: InspireWellnessCompanionConfig = {
  heading: 'Đồng hành cùng Khánh Ly',
  intro:
    'Tôi xây dựng Inspire Wellness để đưa kiến thức về dinh dưỡng và chăm sóc sức khỏe chủ động đến gần hơn với cuộc sống hằng ngày. Qua mỗi video, tôi mong bạn có thêm một góc nhìn để hiểu thói quen của mình và biết có thể bắt đầu thay đổi từ đâu. Đôi khi, bước đầu tiên chỉ là sắp xếp lại một bữa ăn trong ngày hoặc chọn cách chuẩn bị bữa tối phù hợp hơn với lịch làm việc của mình.',
  wellness: {
    heading: 'Nắng Wellness — Dinh dưỡng và chăm sóc sức khỏe',
    paragraphs: [
      'Có thể bạn đã xem nhiều video về ăn uống lành mạnh, nhưng khi tự lên thực đơn cho một tuần bận rộn, bạn vẫn chưa biết nên bắt đầu từ đâu. Tôi phát triển Nắng Wellness để đồng hành với những người muốn áp dụng kiến thức dinh dưỡng vào chính bữa ăn và lịch sinh hoạt của mình.',
      'Nếu bạn đang tìm một gói chăm sóc, hãy bắt đầu bằng việc chia sẻ mục tiêu và điều khiến bạn khó duy trì thói quen ăn uống hiện tại. Từ đó, chúng ta có thể trao đổi về hình thức đồng hành phù hợp với nhu cầu của bạn.',
    ],
    packagesPageUrl: null,
    packagesCtaLabel: 'Tìm hiểu các gói chăm sóc',
    fallbackCtaLabel: 'Trao đổi về dinh dưỡng',
    contactTopic: 'cham-soc-tu-van-suc-khoe',
  },
  advisory: {
    heading: 'Cố vấn khởi nghiệp trong lĩnh vực sức khỏe chủ động',
    paragraphs: [
      'Tôi cũng đồng hành cùng những người muốn xây dựng sản phẩm, dịch vụ hoặc mô hình kinh doanh trong lĩnh vực sức khỏe chủ động. Nếu bạn đang có ý tưởng hoặc đã bắt đầu triển khai, chúng ta có thể trao đổi về nhóm khách hàng bạn muốn phục vụ, dịch vụ đầu tiên nên thử nghiệm và những việc cần ưu tiên khi đưa mô hình vào vận hành.',
    ],
    ctaLabel: 'Trao đổi về cố vấn',
    contactTopic: 'co-van-khoi-nghiep',
  },
}

/**
 * Nguồn dữ liệu duy nhất cho toàn bộ video Inspire Wellness (đợt mới xếp trước, khử trùng theo `reelId`) —
 * dùng chung cho:
 * 1. Carousel trên Trang chủ (`VIDEO_SERIES`)
 * 2. Trang thư viện `/inspire-wellness/`
 * 3. Tất cả các trang chi tiết `/inspire-wellness/<slug>/`
 */
export const INSPIRE_WELLNESS_EPISODES: InspireWellnessEpisode[] = INSPIRE_WELLNESS_ROUTE_META.map(
  (meta) => ({
    ...meta,
    coverSrc: REEL_COVER_BY_ID[meta.reelId] ?? null,
  })
)

export function findInspireWellnessEpisodeBySlug(
  slug: string
): InspireWellnessEpisode | undefined {
  const normalized = slug.trim().toLowerCase()
  return INSPIRE_WELLNESS_EPISODES.find((ep) => ep.slug === normalized)
}

export function normalizeApprovedSummary(
  summary: InspireWellnessEpisode['approvedSummary']
): string[] {
  if (!summary) return []
  if (typeof summary === 'string') {
    const trimmed = summary.trim()
    return trimmed.length > 0 ? [trimmed] : []
  }
  return summary.map((line) => line.trim()).filter((line) => line.length > 0)
}

export function hasValidRelatedPackageUrl(
  pkg: RelatedCarePackage | null | undefined
): pkg is RelatedCarePackage & { url: string } {
  if (!pkg || !pkg.name?.trim() || !pkg.url) return false
  const trimmed = pkg.url.trim()
  return /^https?:\/\/.+/i.test(trimmed)
}

export function buildFacebookReelEmbedUrl(reelUrl: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(reelUrl)}&show_text=false&autoplay=false`
}

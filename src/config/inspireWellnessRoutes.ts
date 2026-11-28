export const INSPIRE_WELLNESS_BASE_PATH = '/inspire-wellness/'

export interface RelatedCarePackage {
  /** Tên gói chăm sóc sức khỏe từ Nắng Wellness */
  name: string
  /** Mô tả ngắn đã duyệt của gói chăm sóc (tùy chọn) */
  description?: string | null
  /** URL thật dẫn tới gói chăm sóc Nắng Wellness (chỉ hiện nút “Xem gói chăm sóc” khi có URL thật hợp lệ) */
  url: string | null
}

export interface InspireWellnessBatchEntry {
  /** URL Facebook Reel hoặc mã Reel ID (dùng để rút trích `reelId` chuẩn và khử trùng lặp) */
  reelUrl: string
  /** Mã Reel ID tường minh (tùy chọn — tự động kiểm tra khớp với `reelUrl`) */
  reelId?: string
  /** Đường dẫn định danh của tập (ví dụ: `'that-bai-chua-phai-la-thu-te-nhat'`) */
  slug: string
  /** Tiêu đề video dùng chung trên Trang chủ, trang thư viện và trang chi tiết */
  title: string
  /** Alt text mô tả ảnh bìa dọc 9:16 */
  coverAlt: string
  coverWidth: number
  coverHeight: number
  coverObjectPosition?: string
  /** Tóm tắt nội dung chính đã được duyệt (`null` khi chưa có nội dung duyệt) */
  approvedSummary?: string | readonly string[] | null
  /** Gói chăm sóc Nắng Wellness phù hợp (`null` khi chưa xác nhận gói liên quan & URL thật) */
  relatedPackage?: RelatedCarePackage | null
}

export interface InspireWellnessRouteMeta {
  reelId: string
  slug: string
  detailPath: string
  title: string
  reelUrl: string
  coverAlt: string
  coverWidth: number
  coverHeight: number
  coverObjectPosition?: string
  approvedSummary: string | readonly string[] | null
  relatedPackage: RelatedCarePackage | null
}

export function buildInspireWellnessDetailPath(slug: string): string {
  return `${INSPIRE_WELLNESS_BASE_PATH}${slug}/`
}

/**
 * Rút trích mã Reel ID duy nhất từ link Facebook Reel (hoặc chuỗi ID thuần)
 * để chuẩn hóa URL và chống trùng lặp khi thêm lại cùng một link ở các đợt sau.
 */
export function extractFacebookReelId(urlOrId: string): string {
  const raw = urlOrId.trim()
  const reelPathMatch = raw.match(/\/reel\/(\d+)/i)
  if (reelPathMatch?.[1]) {
    return reelPathMatch[1]
  }
  const videosPathMatch = raw.match(/\/videos\/(?:[^/]+\/)?(\d+)/i)
  if (videosPathMatch?.[1]) {
    return videosPathMatch[1]
  }
  const digitsOnly = raw.match(/^(\d+)$/)
  if (digitsOnly?.[1]) {
    return digitsOnly[1]
  }
  return raw
}

export function normalizeFacebookReelUrl(reelId: string): string {
  return `https://www.facebook.com/reel/${reelId}/`
}

/**
 * Gộp các đợt Reel theo quy tắc:
 * 1. Đợt mới đặt ở đầu mảng `batches` sẽ hiển thị trước các đợt cũ.
 * 2. Trong cùng một đợt, giữ nguyên thứ tự các link được gửi (1 → 2 → ...).
 * 3. Khử trùng theo `reelId`: nếu cùng một Reel ID xuất hiện lại, chỉ giữ bản ghi đầu tiên.
 */
export function dedupeInspireWellnessBatches(
  batches: readonly (readonly InspireWellnessBatchEntry[])[]
): InspireWellnessRouteMeta[] {
  const seenReelIds = new Set<string>()
  const seenSlugs = new Set<string>()
  const result: InspireWellnessRouteMeta[] = []

  for (const batch of batches) {
    for (const entry of batch) {
      const resolvedId = extractFacebookReelId(entry.reelId ?? entry.reelUrl)
      if (!resolvedId || seenReelIds.has(resolvedId)) {
        continue
      }
      seenReelIds.add(resolvedId)

      const normalizedSlug = entry.slug.trim().toLowerCase()
      const finalSlug = seenSlugs.has(normalizedSlug)
        ? `${normalizedSlug}-${resolvedId}`
        : normalizedSlug
      seenSlugs.add(finalSlug)

      result.push({
        reelId: resolvedId,
        slug: finalSlug,
        detailPath: buildInspireWellnessDetailPath(finalSlug),
        title: entry.title.trim(),
        reelUrl: normalizeFacebookReelUrl(resolvedId),
        coverAlt: entry.coverAlt,
        coverWidth: entry.coverWidth,
        coverHeight: entry.coverHeight,
        coverObjectPosition: entry.coverObjectPosition,
        approvedSummary: entry.approvedSummary ?? null,
        relatedPackage: entry.relatedPackage ?? null,
      })
    }
  }

  return result
}

/**
 * Danh sách các đợt video Inspire Wellness (đợt mới nhất đặt lên đầu mảng ngoài;
 * trong mỗi đợt giữ nguyên thứ tự người dùng gửi).
 * File này không import ảnh tĩnh để cả trình duyệt lẫn plugin build trong `vite.config.ts` dùng chung một nguồn.
 */
export const INSPIRE_WELLNESS_BATCHES: readonly (readonly InspireWellnessBatchEntry[])[] = [
  // Đợt 2 (mới nhất): hiển thị đầu tiên theo thứ tự 1 → 2
  [
    {
      reelId: '2383579015791551',
      reelUrl: 'https://www.facebook.com/reel/2383579015791551/',
      slug: 'that-bai-chua-phai-la-thu-te-nhat',
      title: 'Thất bại chưa phải là thứ tệ nhất',
      coverAlt: 'Bìa Reel Inspire Talk – Mật mã kinh doanh: Thất bại không định nghĩa bạn',
      coverWidth: 1080,
      coverHeight: 1920,
    },
    {
      reelId: '1818842979364024',
      reelUrl: 'https://www.facebook.com/reel/1818842979364024/',
      slug: 'khong-beo-co-nghia-la-khoe',
      title: 'Không béo có nghĩa là khỏe?',
      coverAlt:
        'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Bạn không béo nhưng bạn có thực sự khỏe?',
      coverWidth: 1080,
      coverHeight: 1920,
    },
  ],

  // Đợt 1 (7 video ban đầu, giữ nguyên thứ tự 1 → 7)
  [
    {
      reelId: '2377447369675924',
      reelUrl: 'https://www.facebook.com/reel/2377447369675924/',
      slug: 'dot-quy-co-phai-la-bat-ngo',
      title: 'Đột quỵ có phải là bất ngờ?',
      coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Đột quỵ xảy ra khi',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '1137207755955189',
      reelUrl: 'https://www.facebook.com/reel/1137207755955189/',
      slug: '4-dau-hieu-nguy-co-dot-quy',
      title: '4 dấu hiệu nguy cơ đột quỵ',
      coverAlt:
        'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Hãy nghĩ ngay đến nguy cơ đột quỵ',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '3261278167408762',
      reelUrl: 'https://www.facebook.com/reel/3261278167408762/',
      slug: 'an-uong-vo-toi-va-va-ton-thuong-mach-mau',
      title: 'Ăn uống vô tội vạ và tổn thương mạch máu',
      coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: 2 Ăn uống vô tội vạ',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '1636549751555465',
      reelUrl: 'https://www.facebook.com/reel/1636549751555465/',
      slug: 'mi-goi-va-dot-quy-co-lien-quan-khong',
      title: 'Mì gói và đột quỵ có liên quan không?',
      coverAlt:
        'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Bạn có thường xuyên ăn mì gói hay không?',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '1484135439826750',
      reelUrl: 'https://www.facebook.com/reel/1484135439826750/',
      slug: '3-su-that-ve-mach-mau-ma-rat-it-ai-biet',
      title: '3 sự thật về mạch máu mà rất ít ai biết',
      coverAlt:
        'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: 3 sự thật về mạch máu mà rất ít ai biết',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '1443435894073407',
      reelUrl: 'https://www.facebook.com/reel/1443435894073407/',
      slug: 'ca-phe-tot-hay-khong-tot',
      title: 'Cà phê tốt hay không tốt?',
      coverAlt:
        'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Hàng triệu người uống cafe mỗi ngày nhưng bỏ qua điều này',
      coverWidth: 720,
      coverHeight: 1280,
    },
    {
      reelId: '1180628557746539',
      reelUrl: 'https://www.facebook.com/reel/1180628557746539/',
      slug: 'top-5-nguy-co-suc-khoe-den-tu-mo-noi-tang',
      title: 'Top 5 nguy cơ sức khỏe đến từ mỡ nội tạng',
      coverAlt:
        'Bìa Reel Inspire Tips – Điều cơ thể chưa nói: Top 5 nguy cơ sức khoẻ đáng sợ đến từ mỡ nội tạng',
      coverWidth: 1080,
      coverHeight: 1920,
    },
  ],
] as const

export const INSPIRE_WELLNESS_ROUTE_META: readonly InspireWellnessRouteMeta[] =
  dedupeInspireWellnessBatches(INSPIRE_WELLNESS_BATCHES)

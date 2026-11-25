import reelCover2377447369675924 from '../assets/images/reels/2377447369675924.jpg'
import reelCover1137207755955189 from '../assets/images/reels/1137207755955189.jpg'
import reelCover3261278167408762 from '../assets/images/reels/3261278167408762.jpg'
import reelCover1636549751555465 from '../assets/images/reels/1636549751555465.jpg'
import reelCover1484135439826750 from '../assets/images/reels/1484135439826750.jpg'
import reelCover1443435894073407 from '../assets/images/reels/1443435894073407.jpg'
import reelCover1180628557746539 from '../assets/images/reels/1180628557746539.jpg'
import stagePlaceholder01 from '../assets/images/stage-placeholder-01.jpg'
import stagePlaceholder02 from '../assets/images/stage-placeholder-02.jpg'
import stagePlaceholder03 from '../assets/images/stage-placeholder-03.jpg'
import stagePlaceholder04 from '../assets/images/stage-placeholder-04.jpg'
import talksCoVanKhoiNghiep from '../assets/images/talks-co-van-khoi-nghiep.jpg'
import talksChamSocSucKhoe from '../assets/images/talks-cham-soc-suc-khoe.jpg'
import talksWorkshopFitx from '../assets/images/talks-workshop-fitx.jpg'
import eventPlaceholder01 from '../assets/images/event-placeholder-01.jpg'
import eventPlaceholder02 from '../assets/images/event-placeholder-02.jpg'
import eventPlaceholder03 from '../assets/images/event-placeholder-03.jpg'
import eventPlaceholder04 from '../assets/images/event-placeholder-04.jpg'
import { buildContactHref } from '../composables/useContactNavigation'
import type { ContactTopicId } from './contactForm'

export interface NavDestination {
  id: string
  label: string
  href: string
}

export interface HeroAction {
  id: 'inspire-tips' | 'mentoring'
  label: string
  variant: 'primary' | 'secondary'
  /** Khi có link thật, gán URL hoặc `#section` và đổi `status` thành `'ready'` */
  href: string | null
  status: 'pending' | 'ready'
  pendingNote: string
  /** Chủ đề tự động chọn sẵn khi điều hướng tới form Liên hệ (#lien-he) */
  contactTopic?: ContactTopicId
}

export interface VideoSeriesItem {
  /** Mã Reel ID trên Facebook (dùng để đối chiếu trực tiếp với tên file ảnh bìa cục bộ) */
  reelId: string
  /** Tên video hiển thị ngay dưới khung bìa 16:9 */
  title: string
  /**
   * Ảnh bìa gốc 9:16 cục bộ (import từ `src/assets/images/reels/<reelId>.jpg`).
   * Nếu chưa có ảnh bìa (`null`), thẻ vẫn giữ nguyên kích thước với ô tạm gọn và mở đúng `reelUrl`.
   */
  coverSrc: string | null
  /** Alt text mô tả đúng nội dung chữ trên ảnh bìa gốc */
  coverAlt: string
  /** Kích thước gốc của ảnh bìa để giữ khung ổn định */
  coverWidth: number
  coverHeight: number
  /** Vị trí căn khung ảnh (mặc định `'50% 50%'` giữ trọn bìa 9:16 gốc) */
  coverObjectPosition?: string
  /** URL trực tiếp tới Facebook Reel */
  reelUrl: string
}

export interface StageClipItem {
  id: string
  /** Tên clip chia sẻ tại sự kiện / lớp học / workshop */
  title: string
  /** Tên sự kiện / lớp học (chỉ điền khi đã xác nhận thông tin thật; để `null` sẽ tự ẩn) */
  eventName: string | null
  /** Ảnh bìa dọc 9:16 cục bộ (import từ `src/assets/images/...`) */
  coverSrc: string
  /** Alt text cho ảnh bìa */
  coverAlt: string
  /** Kích thước gốc của ảnh bìa */
  coverWidth: number
  coverHeight: number
  /** Tùy chỉnh điểm căn khung ảnh 9:16 (mặc định `'50% 20%'`) */
  coverObjectPosition?: string
  /** Đánh dấu thẻ đang dùng ảnh minh họa tạm (hiện nhãn “Ảnh minh họa”) */
  isPlaceholder?: boolean
  /**
   * Đường dẫn file video MP4 riêng của từng thẻ (ví dụ import từ `src/assets/videos/chia-se-01.mp4`
   * hoặc đường dẫn `/videos/chia-se-01.mp4` trong `public/videos/`).
   * - Khi `null`: bấm thẻ vẫn mở hộp thoại 9:16 hiển thị ảnh bìa và dòng “Video sẽ được cập nhật”.
   * - Khi gắn đường dẫn MP4: bấm thẻ mở hộp thoại và phát clip HTML `<video controls playsinline>` (chỉ tải khi mở thẻ).
   */
  videoSrc: string | null
  /** Liên kết Facebook Reel dự phòng nếu cần tham chiếu thêm */
  reelUrl?: string | null
}

export interface TalkTopicItem {
  id: string
  /** Mã chủ đề chọn sẵn trên form Liên hệ (#lien-he) */
  contactTopic: ContactTopicId
  /** Tên chủ đề chia sẻ / workshop */
  title: string
  /** Mô tả ngắn về chủ đề */
  description: string
  /** Tiêu đề nhóm gạch đầu dòng riêng của thẻ (mặc định dùng `TALKS_SECTION.takeawaysHeading`) */
  takeawaysHeading?: string
  /** Các giá trị chính / nội dung thực hành người tham dự nhận được */
  takeaways: string[]
  /** Nhãn nút hành động riêng của từng thẻ (mặc định dùng `TALKS_SECTION.ctaLabel`) */
  ctaLabel?: string
  /** Kiểu bố cục ảnh của thẻ: `'portrait'` (cột dọc bên phải) hoặc `'wide'` (hàng ngang rộng bên dưới nội dung) */
  mediaLayout?: 'portrait' | 'wide'
  /** Ảnh workshop hoặc chân dung cục bộ (import từ `src/assets/images/...`) */
  imageSrc: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
  /** Vị trí căn khung ảnh (ví dụ `'50% 32%'`) */
  imageObjectPosition?: string
  /** Đánh dấu ảnh minh họa trong bản preview */
  isPlaceholderImage?: boolean
  /** Tên chương trình cụ thể — chỉ hiển thị khi đã chốt (để `null` sẽ tự ẩn) */
  programName: string | null
  /** Thời lượng — chỉ hiển thị khi đã chốt (để `null` sẽ tự ẩn) */
  duration: string | null
  /** Chi phí / mức phí — chỉ hiển thị khi đã chốt (để `null` sẽ tự ẩn) */
  fee: string | null
  /** Kết quả cụ thể — chỉ hiển thị khi đã chốt (để `null` sẽ tự ẩn) */
  confirmedOutcome: string | null
  /**
   * Đích liên hệ (ví dụ `'#lien-he?topic=co-van-khoi-nghiep'`).
   * Khi chưa có form Liên hệ (`null`), nút tự ở trạng thái chờ kết nối.
   */
  contactHref: string | null
}

export interface FeaturedEventItem {
  id: string
  /** Tên sự kiện hiển thị bên dưới ảnh gần vuông */
  title: string
  /** Ảnh sự kiện cục bộ (import từ `src/assets/images/...`) */
  imageSrc: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
  imageObjectPosition?: string
  /** Đánh dấu thẻ đang dùng tư liệu minh họa trong bản preview */
  isPlaceholder?: boolean
  /**
   * Liên kết bài viết / album chi tiết của sự kiện.
   * Chỉ gắn link khi có đích thật (`null` -> hiển thị thẻ tĩnh).
   */
  detailUrl: string | null
}

export type SocialPlatform = 'facebook' | 'tiktok' | 'linkedin' | 'instagram' | 'youtube'

export interface MediaChannelItem {
  id: string
  platform: SocialPlatform
  /** Tên kênh hiển thị dưới icon */
  name: string
  /**
   * URL trang chính thức của Khánh Ly trên từng nền tảng.
   * Khi `null`, kênh hiển thị ở chế độ minh họa tĩnh trong preview.
   */
  url: string | null
  /**
   * Số lượng người theo dõi (ví dụ `'45k+'`).
   * Chỉ hiển thị khi được cung cấp số liệu thật; để `null` sẽ tự ẩn.
   */
  followers: string | null
}

export const SITE_BRAND = {
  fullName: 'Nguyễn Khánh Ly',
  homeHref: '#hero',
} as const

/**
 * Menu chỉ hiển thị các mục đã có đích thực tế trên trang.
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  {
    id: 'hero',
    label: 'Trang đầu',
    href: '#hero',
  },
  {
    id: 'video-series',
    label: 'Inspire Tips',
    href: '#video-series',
  },
  {
    id: 'talks',
    label: 'Talks & Workshop',
    href: '#talks',
  },
  {
    id: 'featured-events',
    label: 'Sự kiện',
    href: '#su-kien',
  },
  {
    id: 'contact',
    label: 'Liên hệ',
    href: '#lien-he',
  },
]

export const HERO_CONTENT = {
  nameLines: ['Nguyễn', 'Khánh Ly'] as const,
  description: 'Chia sẻ về sức khỏe và đồng hành cùng người khởi nghiệp.',
  actions: [
    {
      id: 'inspire-tips',
      label: 'Xem Inspire Tips',
      variant: 'primary',
      href: '#video-series',
      status: 'ready',
      pendingNote: '',
    },
    {
      id: 'mentoring',
      label: 'Trao đổi về cố vấn',
      variant: 'secondary',
      href: buildContactHref('co-van-khoi-nghiep'),
      status: 'ready',
      pendingNote: '',
      contactTopic: 'co-van-khoi-nghiep',
    },
  ] satisfies HeroAction[],
} as const

export const VIDEO_SERIES_SECTION = {
  id: 'video-series',
  heading: 'Video series từ Khánh Ly',
  readyActionLabel: 'Mở Reel trên Facebook',
  prevLabel: 'Reel trước',
  nextLabel: 'Reel tiếp theo',
  pauseLabel: 'Tạm dừng tự trượt',
  resumeLabel: 'Tiếp tục tự trượt',
  missingCoverBadge: 'Đang cập nhật bìa',
  autoAdvanceMs: 4000,
} as const

/**
 * Danh sách 7 Facebook Reel của mục “Video series từ Khánh Ly” theo đúng thứ tự hiển thị (1 → 7).
 * - Ảnh bìa gốc đặt tại `src/assets/images/reels/<reelId>.jpg` để tương thích Vite base path / GitHub Pages.
 * - Bìa dọc 9:16 được đặt nguyên vẹn ở giữa khung ngang 16:9 trên nền cùng tông để giữ rõ khuôn mặt và chữ gốc.
 */
export const VIDEO_SERIES: VideoSeriesItem[] = [
  {
    reelId: '2377447369675924',
    title: 'Đột quỵ có phải là bất ngờ?',
    coverSrc: reelCover2377447369675924,
    coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Đột quỵ xảy ra khi',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/2377447369675924/',
  },
  {
    reelId: '1137207755955189',
    title: '4 dấu hiệu nguy cơ đột quỵ',
    coverSrc: reelCover1137207755955189,
    coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Hãy nghĩ ngay đến nguy cơ đột quỵ',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/1137207755955189/',
  },
  {
    reelId: '3261278167408762',
    title: 'Ăn uống vô tội vạ và tổn thương mạch máu',
    coverSrc: reelCover3261278167408762,
    coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: 2 Ăn uống vô tội vạ',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/3261278167408762/',
  },
  {
    reelId: '1636549751555465',
    title: 'Mì gói và đột quỵ có liên quan không?',
    coverSrc: reelCover1636549751555465,
    coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Bạn có thường xuyên ăn mì gói hay không?',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/1636549751555465/',
  },
  {
    reelId: '1484135439826750',
    title: '3 sự thật về mạch máu mà rất ít ai biết',
    coverSrc: reelCover1484135439826750,
    coverAlt: 'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: 3 sự thật về mạch máu mà rất ít ai biết',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/1484135439826750/',
  },
  {
    reelId: '1443435894073407',
    title: 'Cà phê tốt hay không tốt?',
    coverSrc: reelCover1443435894073407,
    coverAlt:
      'Bìa Reel Inspire Talk – Điều cơ thể chưa nói: Hàng triệu người uống cafe mỗi ngày nhưng bỏ qua điều này',
    coverWidth: 720,
    coverHeight: 1280,
    reelUrl: 'https://www.facebook.com/reel/1443435894073407/',
  },
  {
    reelId: '1180628557746539',
    title: 'Top 5 nguy cơ sức khỏe đến từ mỡ nội tạng',
    coverSrc: reelCover1180628557746539,
    coverAlt:
      'Bìa Reel Inspire Tips – Điều cơ thể chưa nói: Top 5 nguy cơ sức khoẻ đáng sợ đến từ mỡ nội tạng',
    coverWidth: 1080,
    coverHeight: 1920,
    reelUrl: 'https://www.facebook.com/reel/1180628557746539/',
  },
]

export const ON_STAGE_SECTION = {
  id: 'on-stage',
  heading: 'Sức khỏe và Khởi nghiệp',
  subtitle:
    'Những khoảnh khắc Khánh Ly hướng dẫn tập luyện, chia sẻ tại sự kiện và đồng hành cùng người khởi nghiệp.',
  moreLabel: 'Xem thêm trên Facebook',
  moreFacebookUrl: null as string | null,
  placeholderBadge: 'Ảnh minh họa',
  openModalLabel: 'Mở xem video chia sẻ',
  closeModalLabel: 'Đóng hộp thoại video',
  videoPendingMessage: 'Video sẽ được cập nhật',
} as const

/**
 * Danh sách 4 thẻ trong mục “Sức khỏe và Khởi nghiệp”.
 * Cách gắn file MP4 cho từng thẻ:
 * - Cách 1 (khuyên dùng với Vite / GitHub Pages): đặt file vào `src/assets/videos/chia-se-01.mp4`,
 *   thêm `import stageVideo01 from '../assets/videos/chia-se-01.mp4'` ở đầu file và gán `videoSrc: stageVideo01`.
 * - Cách 2: đặt file vào `public/videos/chia-se-01.mp4` và gán `videoSrc: './videos/chia-se-01.mp4'`.
 */
export const ON_STAGE_CLIPS: StageClipItem[] = [
  {
    id: 'stage-01',
    title: 'Giữ nhịp sức khỏe khi điều hành dự án mới',
    eventName: null,
    coverSrc: stagePlaceholder01,
    coverAlt: 'Ảnh minh họa chia sẻ trên sân khấu',
    coverWidth: 768,
    coverHeight: 1376,
    coverObjectPosition: '50% 18%',
    isPlaceholder: true,
    videoSrc: null,
    reelUrl: null,
  },
  {
    id: 'stage-02',
    title: 'Bắt đầu nhỏ nhưng bền vững cho người khởi nghiệp',
    eventName: null,
    coverSrc: stagePlaceholder02,
    coverAlt: 'Ảnh minh họa thảo luận tại buổi workshop',
    coverWidth: 768,
    coverHeight: 1376,
    coverObjectPosition: '50% 22%',
    isPlaceholder: true,
    videoSrc: null,
    reelUrl: null,
  },
  {
    id: 'stage-03',
    title: 'Lắng nghe tín hiệu cơ thể giữa lịch làm việc dày',
    eventName: null,
    coverSrc: stagePlaceholder03,
    coverAlt: 'Ảnh minh họa trò chuyện chuyên đề',
    coverWidth: 768,
    coverHeight: 1376,
    coverObjectPosition: '50% 20%',
    isPlaceholder: true,
    videoSrc: null,
    reelUrl: null,
  },
  {
    id: 'stage-04',
    title: 'Thói quen phục hồi năng lượng sau giờ làm việc',
    eventName: null,
    coverSrc: stagePlaceholder04,
    coverAlt: 'Ảnh minh họa chia sẻ tại lớp học',
    coverWidth: 768,
    coverHeight: 1376,
    coverObjectPosition: '50% 18%',
    isPlaceholder: true,
    videoSrc: null,
    reelUrl: null,
  },
]

export const TALKS_SECTION = {
  id: 'talks',
  heading: 'Talks & Workshop',
  subtitle: '',
  takeawaysHeading: 'Người tham dự nhận được gì',
  ctaLabel: 'Trao đổi về chủ đề này',
  placeholderBadge: 'Ảnh minh họa',
  pendingHint: 'Chờ kết nối với phần Liên hệ',
} as const

/**
 * Danh sách 3 thẻ trong mục “Talks & Workshop” theo đúng thứ tự trên Trang chủ:
 * 1. Cố vấn khởi nghiệp (ảnh dọc chị Ly cầm micro trước phông hoa)
 * 2. Chăm sóc sức khỏe chủ động (ảnh dọc chị Ly hướng dẫn tập với tạ hồng)
 * 3. Workshop tập luyện FitX (ảnh tập thể ngang rộng nguyên tỷ lệ gốc bên dưới nội dung thẻ)
 */
export const TALKS_TOPICS: TalkTopicItem[] = [
  {
    id: 'startup-mentoring',
    contactTopic: 'co-van-khoi-nghiep',
    title: 'Cố vấn khởi nghiệp',
    description:
      'Đồng hành cùng người sáng lập và đội ngũ nhỏ làm rõ ưu tiên, gỡ vướng vận hành và giữ sự tỉnh táo trong giai đoạn xây nền tảng.',
    takeawaysHeading: 'Người tham dự nhận được gì',
    takeaways: [
      'Cách xác định trọng tâm khi nguồn lực và thời gian còn giới hạn',
      'Khung đặt câu hỏi để tự rà soát mô hình kinh doanh và nhịp phối hợp',
      'Thảo luận trực tiếp từ các tình huống thực tế của người tham dự',
    ],
    ctaLabel: 'Trao đổi về chủ đề này',
    mediaLayout: 'portrait',
    imageSrc: talksCoVanKhoiNghiep,
    imageAlt: 'Nguyễn Khánh Ly cầm micro chia sẻ trước phông hoa tại sự kiện',
    imageWidth: 683,
    imageHeight: 1024,
    imageObjectPosition: '56% 24%',
    isPlaceholderImage: false,
    programName: null,
    duration: null,
    fee: null,
    confirmedOutcome: null,
    contactHref: buildContactHref('co-van-khoi-nghiep'),
  },
  {
    id: 'proactive-health',
    contactTopic: 'moi-chia-se-workshop',
    title: 'Chăm sóc sức khỏe chủ động',
    description:
      'Trong các buổi chia sẻ và workshop, Khánh Ly mang kinh nghiệm huấn luyện tại FitX vào việc giúp người tham dự xây dựng thói quen vận động, ăn uống và nghỉ ngơi phù hợp với lịch sinh hoạt.',
    takeawaysHeading: 'Người tham dự nhận được gì',
    takeaways: [
      'Chọn hình thức vận động phù hợp',
      'Sắp xếp tập luyện và nghỉ ngơi trong tuần bận rộn',
      'Lập kế hoạch đơn giản để duy trì thói quen',
    ],
    ctaLabel: 'Mời chia sẻ về sức khỏe',
    mediaLayout: 'portrait',
    imageSrc: talksChamSocSucKhoe,
    imageAlt: 'Nguyễn Khánh Ly cầm đôi tạ hồng hướng dẫn học viên tập luyện tại phòng tập',
    imageWidth: 683,
    imageHeight: 1024,
    imageObjectPosition: '50% 42%',
    isPlaceholderImage: false,
    programName: null,
    duration: null,
    fee: null,
    confirmedOutcome: null,
    contactHref: buildContactHref('moi-chia-se-workshop'),
  },
  {
    id: 'fitx-workshop',
    contactTopic: 'moi-chia-se-workshop',
    title: 'Workshop tập luyện FitX',
    description:
      'Các buổi thực hành cùng Khánh Ly và đội ngũ FitX, như workshop kháng lực kết hợp nhạc.',
    takeawaysHeading: 'Nội dung thực hành',
    takeaways: [
      'Làm quen với kháng lực cơ bản',
      'Tập động tác theo nhịp nhạc',
      'Chọn nhạc phù hợp với động tác',
    ],
    ctaLabel: 'Trao đổi về workshop',
    mediaLayout: 'wide',
    imageSrc: talksWorkshopFitx,
    imageAlt: 'Đông đảo học viên và đội ngũ huấn luyện chụp ảnh tập thể tại buổi Workshop tập luyện FitX',
    imageWidth: 1024,
    imageHeight: 683,
    isPlaceholderImage: false,
    programName: null,
    duration: null,
    fee: null,
    confirmedOutcome: null,
    contactHref: buildContactHref('moi-chia-se-workshop'),
  },
]

export const FEATURED_EVENTS_SECTION = {
  id: 'su-kien',
  heading: 'Sự kiện nổi bật',
  pauseLabel: 'Tạm dừng',
  resumeLabel: 'Tiếp tục chạy',
  placeholderBadge: 'Minh họa',
} as const

/**
 * Danh sách Sự kiện nổi bật.
 * - Khi thay tư liệu thật: đặt ảnh vào `src/assets/images/`, cập nhật `import` ở đầu file,
 *   đổi `isPlaceholder: false`, cập nhật `title`, `imageAlt` và điền `detailUrl` (nếu có link bài viết/album).
 * - Nếu tổng số sự kiện ít đến mức nằm gọn trong khung nhìn, dải sẽ tự chuyển sang hàng tĩnh không chạy vòng lặp.
 */
export const FEATURED_EVENTS: FeaturedEventItem[] = [
  {
    id: 'event-01',
    title: 'Phiên đối thoại cùng người sáng lập trẻ',
    imageSrc: eventPlaceholder01,
    imageAlt: 'Ảnh minh họa phiên đối thoại cùng người sáng lập',
    imageWidth: 1024,
    imageHeight: 1024,
    imageObjectPosition: '50% 25%',
    isPlaceholder: true,
    detailUrl: null,
  },
  {
    id: 'event-02',
    title: 'Workshop chăm sóc sức khỏe chủ động nơi làm việc',
    imageSrc: eventPlaceholder02,
    imageAlt: 'Ảnh minh họa buổi workshop sức khỏe chủ động',
    imageWidth: 1024,
    imageHeight: 1024,
    imageObjectPosition: '50% 22%',
    isPlaceholder: true,
    detailUrl: null,
  },
  {
    id: 'event-03',
    title: 'Buổi gặp gỡ kết nối cố vấn và đội ngũ khởi nghiệp',
    imageSrc: eventPlaceholder03,
    imageAlt: 'Ảnh minh họa buổi gặp gỡ kết nối khởi nghiệp',
    imageWidth: 1024,
    imageHeight: 1024,
    imageObjectPosition: '50% 25%',
    isPlaceholder: true,
    detailUrl: null,
  },
  {
    id: 'event-04',
    title: 'Chia sẻ chuyên đề giữ nhịp năng lượng bền vững',
    imageSrc: eventPlaceholder04,
    imageAlt: 'Ảnh minh họa buổi chia sẻ chuyên đề',
    imageWidth: 1024,
    imageHeight: 1024,
    imageObjectPosition: '50% 20%',
    isPlaceholder: true,
    detailUrl: null,
  },
]

export const MEDIA_NETWORK_SECTION = {
  id: 'mang-luoi',
  heading: 'Mạng lưới truyền thông',
  previewNote: 'Bản minh họa tĩnh · mở trang chính thức khi cập nhật liên kết',
  followersUnitLabel: 'Người theo dõi',
  ctaLabel: 'Liên hệ hợp tác',
  ctaHref: buildContactHref('hop-tac-truyen-thong') as string | null,
  contactTopic: 'hop-tac-truyen-thong' as ContactTopicId,
  pendingHint: 'Chờ kết nối tới mục Liên hệ (#lien-he)',
  pendingStatusMessage:
    '“Liên hệ hợp tác” đang ở trạng thái chờ kết nối · sẽ dẫn tới #lien-he khi hoàn thiện phần Liên hệ.',
} as const

/**
 * Danh sách kênh truyền thông của Nguyễn Khánh Ly.
 * - Khi có URL thật: điền chuỗi URL vào `url` (ví dụ `'https://www.facebook.com/...'`).
 * - Khi có số liệu thật: điền chuỗi vào `followers` (ví dụ `'25k+'`); để `null` sẽ không hiển thị con số.
 */
export const MEDIA_CHANNELS: MediaChannelItem[] = [
  {
    id: 'facebook',
    platform: 'facebook',
    name: 'Facebook',
    url: null,
    followers: null,
  },
  {
    id: 'tiktok',
    platform: 'tiktok',
    name: 'TikTok',
    url: null,
    followers: null,
  },
  {
    id: 'linkedin',
    platform: 'linkedin',
    name: 'LinkedIn',
    url: null,
    followers: null,
  },
  {
    id: 'instagram',
    platform: 'instagram',
    name: 'Instagram',
    url: null,
    followers: null,
  },
  {
    id: 'youtube',
    platform: 'youtube',
    name: 'YouTube',
    url: null,
    followers: null,
  },
]

export const FOOTER_CONTENT = {
  brand: 'Nguyễn Khánh Ly',
  summary: 'Chia sẻ về sức khỏe & đồng hành cùng người khởi nghiệp',
  backToTopLabel: 'Về đầu trang',
  backToTopHref: '#hero',
} as const

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
import fitxLogo from '../assets/images/fitx-logo.png'
import { buildContactHref } from '../composables/useContactNavigation'
import type { ContactTopicId } from './contactForm'
import {
  INSPIRE_WELLNESS_BASE_PATH,
  INSPIRE_WELLNESS_EPISODES,
  type InspireWellnessEpisode,
} from './inspireWellness'

export interface NavDestination {
  id: string
  label: string
  href: string
}

export type VideoSeriesItem = InspireWellnessEpisode

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
  /** Ảnh workshop hoặc chân dung cục bộ (`null` khi dùng khung ảnh tạm trong preview) */
  imageSrc: string | null
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  /** Nhãn hiển thị trong khung ảnh tạm khi chưa có ảnh thật phù hợp */
  placeholderFrameNote?: string
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

export type SocialPlatform = 'facebook' | 'tiktok' | 'fitx' | 'instagram' | 'youtube'

export interface MediaChannelItem {
  id: string
  platform: SocialPlatform
  /** Tên kênh hiển thị dưới icon */
  name: string
  /**
   * URL trang chính thức của kênh / thương hiệu.
   * Khi `null`, kênh hiển thị ở chế độ minh họa tĩnh trong preview.
   */
  url: string | null
  /**
   * Số lượng người theo dõi (ví dụ `'45k+'`).
   * Chỉ hiển thị khi được cung cấp số liệu thật; để `null` sẽ tự ẩn.
   */
  followers: string | null
  /** Logo ảnh PNG nền trong suốt (tùy chọn, dùng cho thương hiệu riêng như FitX) */
  logoSrc?: string
  logoWidth?: number
  logoHeight?: number
}

export const SITE_BRAND = {
  fullName: 'Nguyễn Khánh Ly',
  surname: 'Nguyễn',
  givenName: 'Khánh Ly',
  homeHref: '/',
} as const

/**
 * Menu chỉ hiển thị các mục đã có đích thực tế trên trang.
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  {
    id: 'hero',
    label: 'Trang đầu',
    href: '/#hero',
  },
  {
    id: 'video-series',
    label: 'Inspire Wellness',
    href: INSPIRE_WELLNESS_BASE_PATH,
  },
  {
    id: 'talks',
    label: 'Talks & Workshop',
    href: '/#talks',
  },
  {
    id: 'featured-events',
    label: 'Sự kiện',
    href: '/#su-kien',
  },
  {
    id: 'contact',
    label: 'Liên hệ',
    href: '/#lien-he',
  },
]

export const HERO_CONTENT = {
  title: 'NGUYỄN KHÁNH LY',
  roleLine: 'Doanh nhân – ThS. Dược sĩ – Cố vấn – HLV',
} as const

export const VIDEO_SERIES_SECTION = {
  id: 'video-series',
  heading: 'Inspire Wellness',
  readyActionLabel: 'Mở Reel trên Facebook',
  prevLabel: 'Reel trước',
  nextLabel: 'Reel tiếp theo',
  pauseLabel: 'Tạm dừng tự trượt',
  resumeLabel: 'Tiếp tục tự trượt',
  missingCoverBadge: 'Đang cập nhật bìa',
  autoAdvanceMs: 4000,
} as const

/**
 * Dùng chung danh sách các tập từ `INSPIRE_WELLNESS_EPISODES` (đợt mới xếp trước) cho carousel trên Trang chủ.
 */
export const VIDEO_SERIES: VideoSeriesItem[] = INSPIRE_WELLNESS_EPISODES

export const ON_STAGE_SECTION = {
  id: 'on-stage',
  heading: 'Dinh dưỡng và Khởi nghiệp',
  subtitle:
    'Khánh Ly chia sẻ về dinh dưỡng hằng ngày và đồng hành cùng người xây dựng mô hình kinh doanh trong lĩnh vực sức khỏe chủ động.',
  moreLabel: 'Xem thêm trên Facebook',
  moreFacebookUrl: null as string | null,
  placeholderBadge: 'Ảnh minh họa',
  openModalLabel: 'Mở xem video chia sẻ',
  closeModalLabel: 'Đóng hộp thoại video',
  videoPendingMessage: 'Video sẽ được cập nhật',
} as const

/**
 * Danh sách 4 thẻ trong mục “Dinh dưỡng và Khởi nghiệp”.
 * Cách gắn file MP4 cho từng thẻ:
 * - Cách 1 (khuyên dùng với Vite / GitHub Pages): đặt file vào `src/assets/videos/chia-se-01.mp4`,
 *   thêm `import stageVideo01 from '../assets/videos/chia-se-01.mp4'` ở đầu file và gán `videoSrc: stageVideo01`.
 * - Cách 2: đặt file vào `public/videos/chia-se-01.mp4` và gán `videoSrc: './videos/chia-se-01.mp4'`.
 */
export const ON_STAGE_CLIPS: StageClipItem[] = [
  {
    id: 'stage-01',
    title: 'Xây dựng bữa ăn cân bằng',
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
    title: 'Ăn uống lành mạnh khi bận rộn',
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
    title: 'Tìm khách hàng đầu tiên cho mô hình chăm sóc sức khỏe',
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
    title: 'Vận hành dịch vụ chăm sóc sức khỏe khi mới khởi nghiệp',
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
  takeawaysHeading: 'Nội dung chia sẻ',
  ctaLabel: 'Trao đổi về chủ đề này',
  placeholderBadge: 'Ảnh minh họa',
  placeholderFrameTag: 'Khung ảnh tạm',
  placeholderFrameDefaultNote: 'Ảnh chia sẻ thực tế sẽ được cập nhật',
  pendingHint: 'Chờ kết nối với phần Liên hệ',
} as const

/**
 * Danh sách 2 thẻ hiển thị trong mục “Talks & Workshop” trên Trang chủ:
 * 1. Dinh dưỡng & chăm sóc sức khỏe (khung ảnh tạm trong preview, chờ ảnh thật chị Ly chia sẻ/tư vấn dinh dưỡng)
 * 2. Cố vấn khởi nghiệp trong lĩnh vực sức khỏe chủ động (ảnh dọc chị Ly cầm micro chia sẻ trước phông hoa)
 */
export const TALKS_TOPICS: TalkTopicItem[] = [
  {
    id: 'nutrition-health',
    contactTopic: 'cham-soc-tu-van-suc-khoe',
    title: 'Dinh dưỡng & chăm sóc sức khỏe',
    description:
      'Khánh Ly chia sẻ cách xây dựng thói quen ăn uống phù hợp với lịch sinh hoạt và mục tiêu chăm sóc sức khỏe.',
    takeawaysHeading: 'Nội dung chia sẻ',
    takeaways: [
      'Lên thực đơn cân bằng cho những ngày bận rộn.',
      'Chọn thực phẩm và chuẩn bị bữa ăn dễ áp dụng.',
      'Xây dựng thói quen ăn uống có thể duy trì lâu dài.',
    ],
    ctaLabel: 'Trao đổi về dinh dưỡng',
    mediaLayout: 'portrait',
    imageSrc: null,
    placeholderFrameNote: 'Ảnh Khánh Ly chia sẻ và tư vấn dinh dưỡng sẽ được cập nhật',
    isPlaceholderImage: false,
    programName: null,
    duration: null,
    fee: null,
    confirmedOutcome: null,
    contactHref: buildContactHref('cham-soc-tu-van-suc-khoe'),
  },
  {
    id: 'startup-mentoring',
    contactTopic: 'co-van-khoi-nghiep',
    title: 'Cố vấn khởi nghiệp trong lĩnh vực sức khỏe chủ động',
    description:
      'Khánh Ly đồng hành cùng người sáng lập đang xây dựng mô hình kinh doanh trong lĩnh vực sức khỏe chủ động, từ xác định khách hàng đến thử nghiệm dịch vụ và tổ chức vận hành.',
    takeawaysHeading: 'Nội dung cố vấn',
    takeaways: [
      'Xác định nhóm khách hàng và nhu cầu cần giải quyết.',
      'Rà soát mô hình kinh doanh và chọn dịch vụ đầu tiên để thử nghiệm.',
      'Xác định ưu tiên vận hành khi đội ngũ và nguồn lực còn nhỏ.',
    ],
    ctaLabel: 'Trao đổi về cố vấn',
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
]

/**
 * Dữ liệu & tư liệu ảnh tập luyện / Workshop FitX được bảo lưu để sử dụng cho tab FitX sau.
 */
export const FITX_RESERVED_TOPICS: TalkTopicItem[] = [
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
  {
    id: 'fitx-training-session',
    contactTopic: 'moi-chia-se-workshop',
    title: 'Hướng dẫn tập luyện tại FitX',
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
  ctaHref: buildContactHref() as string | null,
  contactTopic: undefined as ContactTopicId | undefined,
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
    id: 'fitx',
    platform: 'fitx',
    name: 'FitX',
    url: 'https://fitx.vn/',
    followers: null,
    logoSrc: fitxLogo,
    logoWidth: 436,
    logoHeight: 436,
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

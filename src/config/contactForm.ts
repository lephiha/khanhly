export type ContactTopicId =
  | 'co-van-khoi-nghiep'
  | 'moi-chia-se-workshop'
  | 'hop-tac-truyen-thong'

export interface ContactTopicOption {
  value: ContactTopicId
  label: string
}

export interface ContactFormIntegrationConfig {
  /**
   * URL công khai nhận dữ liệu form (ví dụ Formspree `https://formspree.io/f/xxxx`,
   * Web3Forms `https://api.web3forms.com/submit`, hoặc Cloudflare Worker / Google Apps Script).
   *
   * - Tương thích GitHub Pages (chỉ dùng cấu hình công khai ở frontend, không chứa secret key).
   * - Có thể điền trực tiếp tại đây hoặc truyền qua biến môi trường `VITE_CONTACT_FORM_ENDPOINT` khi build.
   * - Khi `null` hoặc chuỗi rỗng: form tự động hiển thị “Form đang ở chế độ xem trước” cạnh nút gửi,
   *   vẫn kiểm tra nhập liệu đầy đủ và giữ nguyên dữ liệu khi bấm gửi.
   */
  endpointUrl: string | null
  /**
   * Mã định danh form công khai tùy chọn (ví dụ `access_key` của Web3Forms).
   * Không lưu khóa bí mật (secret/private key) tại đây.
   */
  publicFormKey: string | null
  /** Thời gian chờ phản hồi tối đa từ dịch vụ nhận form (ms) */
  timeoutMs: number
}

const envEndpoint = (
  import.meta.env.VITE_CONTACT_FORM_ENDPOINT as string | undefined
)?.trim()

const envPublicKey = (
  import.meta.env.VITE_CONTACT_FORM_PUBLIC_KEY as string | undefined
)?.trim()

export const CONTACT_FORM_INTEGRATION: ContactFormIntegrationConfig = {
  endpointUrl: envEndpoint && envEndpoint.length > 0 ? envEndpoint : null,
  publicFormKey: envPublicKey && envPublicKey.length > 0 ? envPublicKey : null,
  timeoutMs: 12000,
}

export function hasConfiguredContactEndpoint(): boolean {
  return Boolean(
    CONTACT_FORM_INTEGRATION.endpointUrl &&
      CONTACT_FORM_INTEGRATION.endpointUrl.trim().length > 0
  )
}

export const CONTACT_TOPIC_OPTIONS: ContactTopicOption[] = [
  {
    value: 'co-van-khoi-nghiep',
    label: 'Cố vấn khởi nghiệp',
  },
  {
    value: 'moi-chia-se-workshop',
    label: 'Mời chia sẻ / tổ chức workshop',
  },
  {
    value: 'hop-tac-truyen-thong',
    label: 'Hợp tác truyền thông',
  },
]

export function isValidContactTopic(value: string): value is ContactTopicId {
  return CONTACT_TOPIC_OPTIONS.some((option) => option.value === value)
}

const DEFAULT_ADDRESS = 'TT17 Văn Phú (Ngã tư Hoàng Đôn Hòa – Hà Trì), Hà Đông, Hà Nội'

export interface ContactDirectInfoConfig {
  hotlineLabel: string
  hotlineDisplay: string
  hotlineHref: string
  zaloLabel: string
  zaloDisplay: string
  zaloHref: string
  emailLabel: string
  emailDisplay: string
  emailHref: string
  /**
   * Link chat Facebook Messenger chính xác của chị Ly (ví dụ `'https://m.me/...'`).
   * Để `null` khi chưa có link chat chính xác — giao diện sẽ tự ẩn hàng Messenger.
   */
  messengerLabel: string
  messengerDisplay: string
  messengerUrl: string | null
  addressLabel: string
  addressDisplay: string
  directionsLabel: string
  /**
   * Chuỗi địa chỉ chuẩn hóa gửi sang tham số `destination` của Google Maps để ghim đúng khối nhà TT17 Văn Phú
   * (tránh từ "Ngã tư ... Văn Phú" bị Google Maps hiểu nhầm sang ngã tư Quang Trung – Văn Phú).
   */
  mapsDestinationQuery: string
  /**
   * Nếu có link chỉ đường riêng hoặc Place ID chính thức của cơ sở FitX trên Google Maps,
   * điền vào `mapsDirectUrl` hoặc `mapsPlaceId` bên dưới; nếu chưa có, hệ thống tự tạo URL
   * `https://www.google.com/maps/dir/?api=1&destination=...` với `mapsDestinationQuery` được URL-encode.
   */
  mapsDirectUrl: string | null
  mapsPlaceId: string | null
}

export const CONTACT_DIRECT_INFO: ContactDirectInfoConfig = {
  hotlineLabel: 'Hotline',
  hotlineDisplay: '0907 776 855',
  hotlineHref: 'tel:+84907776855',
  zaloLabel: 'Zalo',
  zaloDisplay: '0907 776 855',
  zaloHref: 'https://zalo.me/0907776855',
  emailLabel: 'Email',
  emailDisplay: 'khanhlyfitx@gmail.com',
  emailHref: 'mailto:khanhlyfitx@gmail.com',
  messengerLabel: 'Facebook Messenger',
  messengerDisplay: 'Nhắn tin trực tiếp',
  messengerUrl: null,
  addressLabel: 'Địa chỉ',
  addressDisplay: DEFAULT_ADDRESS,
  directionsLabel: 'Chỉ đường',
  mapsDestinationQuery: 'TT 17 Văn Phú, Hoàng Đôn Hòa, Hà Trì, Hà Đông, Hà Nội',
  mapsDirectUrl: null,
  mapsPlaceId: null,
}

export function buildGoogleMapsDirectionsUrl(info: ContactDirectInfoConfig = CONTACT_DIRECT_INFO): string {
  if (info.mapsDirectUrl && info.mapsDirectUrl.trim().length > 0) {
    return info.mapsDirectUrl.trim()
  }
  const query = info.mapsDestinationQuery.trim() || info.addressDisplay
  const encodedDestination = encodeURIComponent(query)
  const placeParam =
    info.mapsPlaceId && info.mapsPlaceId.trim().length > 0
      ? `&destination_place_id=${encodeURIComponent(info.mapsPlaceId.trim())}`
      : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}${placeParam}`
}

export const CONTACT_SECTION_COPY = {
  id: 'lien-he',
  heading: 'Kết nối với Khánh Ly',
  lead: 'Chia sẻ ngắn gọn về nhu cầu cố vấn, lời mời diễn giả hoặc kế hoạch hợp tác. Bạn có thể liên hệ trực tiếp qua các kênh dưới đây hoặc gửi lời nhắn qua biểu mẫu.',
  previewModeBadge: 'Form đang ở chế độ xem trước',
  fields: {
    nameLabel: 'Họ tên',
    namePlaceholder: 'Ví dụ: Trần Minh Anh',
    emailLabel: 'Email',
    emailPlaceholder: 'ten@congty.vn',
    topicLabel: 'Chủ đề',
    topicPlaceholder: 'Chọn chủ đề trao đổi',
    messageLabel: 'Lời nhắn',
    messagePlaceholder:
      'Chia sẻ ngắn về bối cảnh, thời gian dự kiến hoặc nội dung bạn muốn trao đổi...',
  },
  errors: {
    nameRequired: 'Vui lòng nhập họ tên của bạn.',
    emailRequired: 'Vui lòng nhập địa chỉ email.',
    emailInvalid: 'Email chưa đúng định dạng.',
    topicRequired: 'Vui lòng chọn chủ đề trao đổi.',
    messageRequired: 'Vui lòng nhập lời nhắn của bạn.',
  },
  submitLabel: 'Gửi lời nhắn',
  submittingLabel: 'Đang gửi lời nhắn...',
  messages: {
    previewSubmitted:
      'Form đang ở chế độ xem trước (chưa kết nối endpoint nhận thư) nên lời nhắn chưa được gửi đi. Nội dung bạn đã nhập vẫn được giữ nguyên.',
    liveSuccess:
      'Đã gửi lời nhắn thành công. Cảm ơn bạn đã kết nối — Khánh Ly và đội ngũ sẽ phản hồi qua email sớm nhất.',
    liveError:
      'Chưa thể gửi lời nhắn do kết nối tới dịch vụ nhận form gặp gián đoạn. Nội dung bạn nhập vẫn được giữ nguyên để thử gửi lại.',
  },
} as const

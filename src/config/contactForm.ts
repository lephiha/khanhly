export type ContactTopicId =
  | 'cham-soc-tu-van-suc-khoe'
  | 'co-van-khoi-nghiep'
  | 'moi-chia-se-workshop'

export interface ContactTopicOption {
  value: ContactTopicId
  label: string
}

export const CONTACT_TOPIC_OPTIONS: ContactTopicOption[] = [
  {
    value: 'cham-soc-tu-van-suc-khoe',
    label: 'Chăm sóc & tư vấn sức khỏe',
  },
  {
    value: 'co-van-khoi-nghiep',
    label: 'Cố vấn khởi nghiệp',
  },
  {
    value: 'moi-chia-se-workshop',
    label: 'Mời chia sẻ & tổ chức workshop',
  },
]

export function isValidContactTopic(value: string): value is ContactTopicId {
  return CONTACT_TOPIC_OPTIONS.some((option) => option.value === value)
}

export interface ComposeZaloMessageInput {
  name: string
  email: string
  topicLabel: string
  message: string
}

/**
 * Ghép họ tên, email, chủ đề và lời nhắn thành văn bản thuần để dán vào Zalo.
 * Không gắn dữ liệu người dùng vào URL.
 */
export function buildComposedZaloMessage(input: ComposeZaloMessageInput): string {
  return [
    `Họ tên: ${input.name.trim()}`,
    `Email: ${input.email.trim()}`,
    `Chủ đề: ${input.topicLabel.trim()}`,
    `Lời nhắn: ${input.message.trim()}`,
  ].join('\n')
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
   * Chuỗi địa chỉ chuẩn hóa gửi sang tham số `destination` của Google Maps để ghim đúng khối nhà TT17 Văn Phú.
   */
  mapsDestinationQuery: string
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

export function buildGoogleMapsDirectionsUrl(
  info: ContactDirectInfoConfig = CONTACT_DIRECT_INFO
): string {
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
  zaloInlineHint: 'Dán lời nhắn vào cuộc trò chuyện Zalo rồi bấm Gửi.',
  openZaloLabel: 'Mở Zalo',
  copyAgainLabel: 'Sao chép nội dung',
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
  messages: {
    copiedReadyForZalo:
      'Đã sao chép nội dung lời nhắn vào bộ nhớ tạm. Hãy dán vào cuộc trò chuyện Zalo rồi bấm Gửi.',
    manualCopyFallback:
      'Trình duyệt chưa cho phép sao chép tự động. Bạn vui lòng sao chép nội dung bên dưới rồi mở Zalo để gửi:',
  },
} as const

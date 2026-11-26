import khanhLyPortrait from '../assets/images/khanh-ly-portrait.jpg'

export interface HeroPortraitCropConfig {
  /** Object-fit strategy inside the portrait frame */
  objectFit: 'cover' | 'contain'
  /** Focal point on desktop (>= 960px) */
  objectPositionDesktop: string
  /** Focal point on mobile (< 960px) — ưu tiên giữ trọn đỉnh đầu và đặt khuôn mặt sáng rõ ở nửa trên */
  objectPositionMobile: string
  /** Optional subtle zoom (>= 1) without altering outer layout box */
  scale: number
  /** Aspect ratio on desktop portrait canvas (1 / 1 preserves full 960x960 head & shoulders) */
  desktopAspectRatio: string
  /** Aspect ratio on mobile full-bleed hero frame */
  mobileAspectRatio: string
}

export interface HeroPortraitConfig {
  /** Local imported image asset */
  src: string
  /** Alt text for screen readers */
  alt: string
  /** Intrinsic image width (px) to prevent CLS */
  width: number
  /** Intrinsic image height (px) to prevent CLS */
  height: number
  /** Responsive framing & crop settings */
  crop: HeroPortraitCropConfig
}

/**
 * Cấu hình ảnh chân dung thật của Nguyễn Khánh Ly trên Hero (960 × 960).
 * - Desktop: chân dung lớn bên phải trên nền trắng ánh hồng, giữ trọn đỉnh đầu và hai vai.
 * - Mobile: phủ toàn bộ khung hero ngay dưới header, căn giữ trọn đỉnh đầu và đặt khuôn mặt ở nửa trên.
 */
export const HERO_PORTRAIT: HeroPortraitConfig = {
  src: khanhLyPortrait,
  alt: 'Chân dung Nguyễn Khánh Ly',
  width: 960,
  height: 960,
  crop: {
    objectFit: 'cover',
    objectPositionDesktop: '100% 100%',
    objectPositionMobile: '53% 6%',
    scale: 1,
    desktopAspectRatio: '1 / 1',
    mobileAspectRatio: '3 / 4',
  },
}

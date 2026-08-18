import { siteUrl } from '@/lib/landing/seo';

export const QR_FORMATS = ['png', 'svg'] as const;
export type QrFormat = (typeof QR_FORMATS)[number];

export function qrTargetUrl(slug: string): string {
  return `${siteUrl()}/${slug}`;
}

export function isValidQrFormat(value: string | null): value is QrFormat {
  return value !== null && (QR_FORMATS as readonly string[]).includes(value);
}

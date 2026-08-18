import { describe, it, expect } from 'vitest';
import { qrTargetUrl, isValidQrFormat } from '@/app/api/qr/helpers';

describe('helper QR', () => {
  it('menyusun URL absolut dari slug', () => {
    expect(qrTargetUrl('parkspring-gading')).toMatch(/\/parkspring-gading$/);
  });

  it('hanya menerima png dan svg', () => {
    expect(isValidQrFormat('png')).toBe(true);
    expect(isValidQrFormat('svg')).toBe(true);
    expect(isValidQrFormat('pdf')).toBe(false);
    expect(isValidQrFormat(null)).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { validateUpload, MAX_UPLOAD_BYTES, MAX_PHOTOS_PER_HOUSE_TYPE } from '@/lib/media/downscale';

describe('validateUpload', () => {
  it('menerima JPG, PNG, dan WebP', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateUpload({ type, size: 1024 }, 0).ok, type).toBe(true);
    }
  });

  it('menolak format lain dengan pesan spesifik', () => {
    const result = validateUpload({ type: 'application/pdf', size: 1024 }, 0);
    expect(result).toEqual({ ok: false, message: 'Format harus JPG, PNG, atau WebP.' });
  });

  it('menolak file di atas 10MB', () => {
    const result = validateUpload({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 }, 0);
    expect(result).toEqual({ ok: false, message: 'Ukuran maksimal 10MB per file.' });
  });

  it('menolak unggahan ke-21 pada satu tipe rumah', () => {
    expect(validateUpload({ type: 'image/jpeg', size: 1024 }, MAX_PHOTOS_PER_HOUSE_TYPE - 1).ok).toBe(true);
    const result = validateUpload({ type: 'image/jpeg', size: 1024 }, MAX_PHOTOS_PER_HOUSE_TYPE);
    expect(result).toEqual({ ok: false, message: 'Maksimal 20 foto per tipe rumah.' });
  });
});

import { describe, it, expect } from 'vitest';
import { slugify, isReservedSlug, uniqueSlug, RESERVED_SLUGS } from '@/lib/slug';

describe('slugify', () => {
  it('menurunkan nama project jadi slug bersih', () => {
    expect(slugify('Parkspring Gading')).toBe('parkspring-gading');
    expect(slugify('  Casa Verde   Alam Sutera ')).toBe('casa-verde-alam-sutera');
    expect(slugify('Bintaro Loop / Residence #2')).toBe('bintaro-loop-residence-2');
  });

  it('tidak melempar error untuk null atau undefined', () => {
    expect(slugify(null)).toBe(slugify(''));
    expect(slugify(undefined)).toBe(slugify(''));
  });
});

describe('isReservedSlug', () => {
  it('menolak slug yang akan membajak rute aplikasi', () => {
    for (const reserved of ['dashboard', 'projects', 'login', 'api', 'sitemap.xml', 'robots.txt']) {
      expect(isReservedSlug(reserved), reserved).toBe(true);
    }
    expect(RESERVED_SLUGS).toContain('uploads');
  });

  it('meloloskan nama project biasa', () => {
    expect(isReservedSlug('parkspring-gading')).toBe(false);
  });
});

describe('uniqueSlug', () => {
  it('mengembalikan slug apa adanya bila belum terpakai', () => {
    expect(uniqueSlug('parkspring-gading', [])).toBe('parkspring-gading');
  });

  it('menambahkan suffix angka saat bentrok', () => {
    expect(uniqueSlug('parkspring-gading', ['parkspring-gading'])).toBe('parkspring-gading-2');
    expect(uniqueSlug('parkspring-gading', ['parkspring-gading', 'parkspring-gading-2'])).toBe('parkspring-gading-3');
  });

  it('memberi suffix pada slug terlarang meski belum terpakai', () => {
    expect(uniqueSlug('dashboard', [])).toBe('dashboard-2');
  });
});

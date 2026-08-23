import { describe, it, expect } from 'vitest';
import { ProjectBriefSchema, PROJECT_TYPE_LABELS, NEARBY_CATEGORY_LABELS } from '@/lib/schemas';
import { emptyBrief } from '@/lib/data/types';

describe('ProjectBriefSchema', () => {
  it('menerima brief kosong dari emptyBrief()', () => {
    expect(ProjectBriefSchema.safeParse(emptyBrief()).success).toBe(true);
  });

  it('menerima minutes null — agen yang tidak tahu waktu tempuh bukan error', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'tol' as const, name: 'Tol Kelapa Gading', minutes: null }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(true);
  });

  it('MENOLAK minutes berupa string — ini penjaga anti-halusinasi, bukan sekadar tipe', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'tol', name: 'Tol', minutes: '5 menit' }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(false);
  });

  it('menolak kategori nearby di luar daftar', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'pantai', name: 'Ancol', minutes: 20 }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(false);
  });

  it('notes hanya menerima kunci BlockType yang sah', () => {
    expect(ProjectBriefSchema.safeParse({ ...emptyBrief(), notes: { gallery: 'lima foto drone' } }).success).toBe(true);
    expect(ProjectBriefSchema.safeParse({ ...emptyBrief(), notes: { bukanBlok: 'x' } }).success).toBe(false);
  });

  it('promo.items adalah array — satu project lazimnya punya beberapa butir promo', () => {
    const brief = {
      ...emptyBrief(),
      promo: {
        name: 'Free BPHTB', items: ['Free BPHTB dan AJB', 'Cashback 5%'],
        detail: 'Selama unit tersedia.', validUntil: null, dpText: '10%', installmentText: 'Rp 18 jt/bln',
      },
    };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(true);
  });

  it('setiap ProjectType punya label untuk ditampilkan', () => {
    expect(Object.keys(PROJECT_TYPE_LABELS)).toEqual(['perumahan', 'apartemen', 'ruko', 'kavling', 'villa']);
  });

  it('setiap NearbyCategory punya label', () => {
    expect(Object.keys(NEARBY_CATEGORY_LABELS)).toHaveLength(8);
  });
});

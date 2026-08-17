import { describe, it, expect } from 'vitest';
import { ProjectDraftSchema, HouseTypeSchema, LeadSchema } from '@/lib/schemas';

describe('ProjectDraftSchema', () => {
  it('mewajibkan nama project', () => {
    const result = ProjectDraftSchema.safeParse({ name: '', location: '', developer: '', description: '', facilities: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.name?.[0]).toBe('Wajib diisi.');
  });

  it('menerima project minimal dengan nama saja', () => {
    expect(ProjectDraftSchema.safeParse({ name: 'Parkspring Gading' }).success).toBe(true);
  });

  it('menolak slug yang membajak rute aplikasi', () => {
    const result = ProjectDraftSchema.safeParse({ name: 'Parkspring', slug: 'dashboard' });
    expect(result.success).toBe(false);
  });
});

describe('HouseTypeSchema', () => {
  it('menolak harga nol atau negatif', () => {
    const base = { name: 'Villa', price: 0, landArea: 90, buildingArea: 120, bedrooms: 3, bathrooms: 2, carport: 1 };
    const result = HouseTypeSchema.safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.price?.[0]).toBe('Harga harus lebih dari nol.');
  });

  it('menerima spesifikasi lengkap yang valid', () => {
    expect(HouseTypeSchema.safeParse({
      name: 'Villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
      bedrooms: 3, bathrooms: 2, carport: 1,
    }).success).toBe(true);
  });

  it('menolak carport negatif', () => {
    expect(HouseTypeSchema.safeParse({
      name: 'Villa', price: 1, landArea: 1, buildingArea: 1, bedrooms: 1, bathrooms: 1, carport: -1,
    }).success).toBe(false);
  });
});

describe('LeadSchema', () => {
  it('mewajibkan nama dan nomor telepon Indonesia yang masuk akal', () => {
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo' }).success).toBe(true);
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '123', message: 'Halo' }).success).toBe(false);
  });

  it('menolak email yang tidak valid tapi menerima email kosong', () => {
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo', email: '' }).success).toBe(true);
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo', email: 'bukan-email' }).success).toBe(false);
  });
});

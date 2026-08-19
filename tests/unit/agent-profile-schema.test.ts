import { describe, it, expect } from 'vitest';
import {
  AppearanceSchema, ProfileSchema, GeneralSchema, PROFILE_THEMES, ACCENT_COLORS,
} from '@/lib/schemas/agentProfile';

describe('AppearanceSchema', () => {
  it('menerima tema dan aksen yang ada di file design', () => {
    const parsed = AppearanceSchema.safeParse({
      theme: 'Luxury', colorScheme: 'Hijau', siteName: 'Audi Property',
    });
    expect(parsed.success).toBe(true);
  });

  it('menolak tema di luar lima pilihan supaya situs profil tidak kehilangan layout', () => {
    const parsed = AppearanceSchema.safeParse({
      theme: 'Brutalist', colorScheme: 'Oranye', siteName: 'Audi Property',
    });
    expect(parsed.success).toBe(false);
  });

  it('menolak nama situs kosong', () => {
    const parsed = AppearanceSchema.safeParse({ theme: 'Modern', colorScheme: 'Oranye', siteName: '   ' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.flatten().fieldErrors.siteName).toBeTruthy();
  });

  it('mendaftarkan lima tema dan tiga aksen sesuai file design', () => {
    expect(PROFILE_THEMES).toEqual(['Modern', 'Luxury', 'Minimal', 'Corporate', 'Creative']);
    expect(ACCENT_COLORS).toEqual(['Oranye', 'Hijau', 'Hitam']);
  });
});

describe('ProfileSchema', () => {
  it('menerima profil lengkap dan mengubah statistik dari string form menjadi angka', () => {
    const parsed = ProfileSchema.safeParse({
      about: 'Agen properti Gading Serpong.', closings: '64', listings: '18',
      specialistArea: 'Gading Serpong', whatsapp: '0812-8899-4410',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.closings).toBe(64);
      expect(parsed.data.listings).toBe(18);
    }
  });

  it('menolak statistik negatif', () => {
    const parsed = ProfileSchema.safeParse({
      about: '', closings: '-3', listings: '0', specialistArea: '', whatsapp: '081288994410',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.flatten().fieldErrors.closings).toBeTruthy();
  });

  it('menolak nomor WhatsApp yang tidak valid dengan pesan yang sama seperti form lead', () => {
    const parsed = ProfileSchema.safeParse({
      about: '', closings: '0', listings: '0', specialistArea: '', whatsapp: '12345',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.whatsapp).toContain('Masukkan nomor WhatsApp yang valid.');
    }
  });

  it('membolehkan about kosong — profil boleh diisi bertahap', () => {
    const parsed = ProfileSchema.safeParse({
      about: '', closings: '0', listings: '0', specialistArea: '', whatsapp: '081288994410',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('GeneralSchema', () => {
  it('membaca checkbox "on" dari FormData sebagai true', () => {
    // Input checkbox HTML mengirim "on" saat dicentang dan TIDAK MENGIRIM APA PUN
    // saat tidak dicentang — bukan "false".
    expect(GeneralSchema.safeParse({ notifyOnLead: 'on' })).toMatchObject({
      success: true, data: { notifyOnLead: true },
    });
  });

  it('menganggap field yang tidak terkirim sebagai false, bukan error validasi', () => {
    expect(GeneralSchema.safeParse({})).toMatchObject({ success: true, data: { notifyOnLead: false } });
  });
});

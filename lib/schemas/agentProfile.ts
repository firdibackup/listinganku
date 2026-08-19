import { z } from 'zod';
import { phoneSchema } from './lead';

/**
 * Lima tema situs profil agen, disalin dari file design. Sengaja BERBEDA dari
 * tiga tema landing page (modern/showcase/luxury) — dua permukaan yang berbeda,
 * dan itulah sebabnya AgentProfile.theme bertipe string, bukan ThemeName.
 */
export const PROFILE_THEMES = ['Modern', 'Luxury', 'Minimal', 'Corporate', 'Creative'] as const;
export const ACCENT_COLORS = ['Oranye', 'Hijau', 'Hitam'] as const;

const wajib = 'Wajib diisi.';

export const AppearanceSchema = z.object({
  theme: z.enum(PROFILE_THEMES, { errorMap: () => ({ message: 'Pilih salah satu tema.' }) }),
  colorScheme: z.enum(ACCENT_COLORS, { errorMap: () => ({ message: 'Pilih salah satu warna aksen.' }) }),
  siteName: z.string().trim().min(1, wajib).max(60, 'Maksimal 60 karakter.'),
});

/** FormData selalu mengirim string; statistik dikonversi di sini, bukan di action. */
const statistik = z
  .string()
  .trim()
  .transform((v) => (v === '' ? 0 : Number(v)))
  .refine((n) => Number.isInteger(n) && n >= 0, { message: 'Isi angka nol atau lebih.' });

export const ProfileSchema = z.object({
  // Boleh kosong: wizard profil bisa dilewati di setiap langkah, jadi halaman
  // Settings tidak boleh memaksa melengkapinya sekaligus.
  about: z.string().trim().max(600, 'Maksimal 600 karakter.').default(''),
  closings: statistik,
  listings: statistik,
  specialistArea: z.string().trim().max(80, 'Maksimal 80 karakter.').default(''),
  whatsapp: phoneSchema,
});

export const GeneralSchema = z.object({
  // Checkbox HTML mengirim "on" saat dicentang dan tidak mengirim field sama
  // sekali saat tidak dicentang. Tanpa default(false) ini, mematikan notifikasi
  // akan gagal validasi alih-alih menyimpan false.
  notifyOnLead: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .optional()
    .transform((v) => v === 'on' || v === 'true' || v === true),
});

export type AppearanceInput = z.infer<typeof AppearanceSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type GeneralInput = z.infer<typeof GeneralSchema>;

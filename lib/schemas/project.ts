import { z } from 'zod';
import { isReservedSlug } from '@/lib/slug';

export const FACILITY_OPTIONS = [
  'Kolam renang', 'Taman', 'Security 24 jam', 'Masjid', 'Jogging track', 'Clubhouse',
] as const;

const wajib = 'Wajib diisi.';

export const ProjectDraftSchema = z.object({
  name: z.string().trim().min(1, wajib),
  location: z.string().trim().default(''),
  developer: z.string().trim().default(''),
  description: z.string().trim().default(''),
  facilities: z.array(z.string()).default([]),
  slug: z
    .string()
    .trim()
    .optional()
    .refine((s) => !s || !isReservedSlug(s), { message: 'Alamat ini dipakai sistem. Pilih yang lain.' }),
});

/** Publish menuntut lebih dari draft: minimal deskripsi supaya halaman tidak kosong. */
export const ProjectPublishSchema = ProjectDraftSchema.extend({
  description: z.string().trim().min(1, wajib),
});

export type ProjectDraftInput = z.infer<typeof ProjectDraftSchema>;

import { z } from 'zod';
import { isReservedSlug } from '@/lib/slug';
import { BLOCK_LABELS } from '@/lib/landing/blocks';
import type { NearbyCategory, ProjectType } from '@/lib/data/types';

export const FACILITY_OPTIONS = [
  'Kolam renang', 'Taman', 'Security 24 jam', 'Masjid', 'Jogging track', 'Clubhouse',
] as const;

const wajib = 'Wajib diisi.';

export const PROJECT_TYPES = ['perumahan', 'apartemen', 'ruko', 'kavling', 'villa'] as const;

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  perumahan: 'Perumahan',
  apartemen: 'Apartemen',
  ruko: 'Ruko & komersial',
  kavling: 'Kavling',
  villa: 'Villa',
};

export const NEARBY_CATEGORIES = [
  'tol', 'sekolah', 'mall', 'rumahSakit', 'stasiun', 'bandara', 'pusatBisnis', 'lainnya',
] as const;

export const NEARBY_CATEGORY_LABELS: Record<NearbyCategory, string> = {
  tol: 'Tol', sekolah: 'Sekolah', mall: 'Mall', rumahSakit: 'Rumah sakit',
  stasiun: 'Stasiun', bandara: 'Bandara', pusatBisnis: 'Pusat bisnis', lainnya: 'Lainnya',
};

const LocationDetailSchema = z.object({
  area: z.string().trim().default(''),
  district: z.string().trim().default(''),
  city: z.string().trim().default(''),
  province: z.string().trim().default(''),
  address: z.string().trim().default(''),
});

const NearbyItemSchema = z.object({
  category: z.enum(NEARBY_CATEGORIES),
  name: z.string().trim().min(1, wajib),
  // `number | null`, TIDAK PERNAH string. Menerima string di sini akan membuka
  // kembali jalur "AI mengarang jarak" yang seluruh desain ini tutup.
  minutes: z.number().int().positive().nullable(),
});

const BriefFacilitySchema = z.object({
  name: z.string().trim().min(1, wajib),
  desc: z.string().trim().default(''),
  mediaIds: z.array(z.string()).default([]),
});

const BriefPromoSchema = z.object({
  name: z.string().trim().default(''),
  items: z.array(z.string().trim().min(1)).default([]),
  detail: z.string().trim().default(''),
  validUntil: z.string().trim().nullable().default(null),
  dpText: z.string().trim().default(''),
  installmentText: z.string().trim().default(''),
});

/** Kunci notes dibatasi ke BlockType yang benar-benar ada, bukan string bebas. */
const NotesSchema = z.record(
  z.enum(Object.keys(BLOCK_LABELS) as [string, ...string[]]),
  z.string().trim(),
);

export const ProjectBriefSchema = z.object({
  version: z.literal(1),
  location: LocationDetailSchema.nullable().default(null),
  nearby: z.array(NearbyItemSchema).default([]),
  highlights: z.array(z.string().trim().min(1, wajib)).default([]),
  facilities: z.array(BriefFacilitySchema).default([]),
  promo: BriefPromoSchema.nullable().default(null),
  heroEmphasis: z.enum(['promo', 'lokasi', 'konsep', 'harga']).nullable().default(null),
  ctaGoals: z.array(z.enum(['whatsapp', 'lihatTipe', 'lihatPromo', 'form'])).default([]),
  notes: NotesSchema.default({}),
});

export const ProjectDraftSchema = z.object({
  name: z.string().trim().min(1, wajib),
  location: z.string().trim().default(''),
  developer: z.string().trim().default(''),
  description: z.string().trim().default(''),
  facilities: z.array(z.string()).default([]),
  projectType: z.enum(PROJECT_TYPES).nullable().default(null),
  brief: ProjectBriefSchema.optional(),
  // Blok divalidasi longgar di sini: bentuk penuhnya dijaga tipe Block di klien
  // dan defaultBlocksForTheme di repo. Yang penting wizard boleh mengirimkan
  // flag enabled yang sudah disetel agen.
  blocks: z.array(z.object({ id: z.string(), type: z.string(), enabled: z.boolean() }).passthrough()).optional(),
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

import type { Block, BlockType } from '@/lib/landing/blocks';

export type { ThemeName } from '@/lib/landing/themeNames';
export type { PaletteName } from '@/lib/landing/palettes';
import type { ThemeName } from '@/lib/landing/themeNames';
import type { PaletteName } from '@/lib/landing/palettes';

export type Id = string;
export type ProjectStatus = 'draft' | 'published';
export type MediaType = 'photo' | 'floor_plan';
export type LeadSource = 'form' | 'whatsapp';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'negotiation' | 'deal' | 'lost';
export type EventType = 'visitor' | 'whatsapp_click' | 'form_submit';

export interface SeoContent {
  title?: string;
  description?: string;
}

export interface ProjectAiContent {
  headline: string;
  /** Kalimat pemasaran di bawah judul hero. Opsional: aiContent lama tidak punya. */
  subheadline?: string;
  /** Wording CTA dari AI. Hanya pesan WhatsApp yang jadi data di 3A. */
  cta?: { whatsappMessage: string };
  description: string;
  sellingPoints: string[];
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
  captions: { instagram: string; facebook: string; whatsapp: string };
}

export interface HouseTypeAiContent {
  shortDescription: string;
  sellingPoints: string[];
}

export type ProjectType = 'perumahan' | 'apartemen' | 'ruko' | 'kavling' | 'villa';

export type NearbyCategory =
  | 'tol' | 'sekolah' | 'mall' | 'rumahSakit'
  | 'stasiun' | 'bandara' | 'pusatBisnis' | 'lainnya';

export type HeroEmphasis = 'promo' | 'lokasi' | 'konsep' | 'harga';
export type CtaGoal = 'whatsapp' | 'lihatTipe' | 'lihatPromo' | 'form';

export interface LocationDetail {
  /** Nama kawasan, diketik bebas: "Gading Serpong". Bukan unit administratif. */
  area: string;
  district: string;
  city: string;
  province: string;
  /** Alamat jalan lengkap, opsional. Dataset administratif berhenti di kecamatan. */
  address: string;
}

export interface NearbyItem {
  category: NearbyCategory;
  name: string;
  /**
   * null = agen tidak tahu. TIDAK PUNYA cara jadi angka — inilah penjaga
   * struktural yang membuat AI tidak bisa mengarang jarak. Item ber-minutes
   * null tetap dikirim ke AI sebagai konteks tapi tidak dirender sebagai
   * kartu akses (lihat resolve.ts).
   */
  minutes: number | null;
}

export interface BriefFacility {
  name: string;
  desc: string;
  /** Diisi di slice 3B. Di 3A selalu []. */
  mediaIds: string[];
}

export interface BriefPromo {
  /** Bahan AI untuk CTA. Tidak dirender langsung. */
  name: string;
  /** Butir promo yang TAMPIL di halaman, satu baris per butir. */
  items: string[];
  detail: string;
  validUntil: string | null;
  dpText: string;
  installmentText: string;
}

export interface ProjectBrief {
  version: 1;
  location: LocationDetail | null;
  nearby: NearbyItem[];
  highlights: string[];
  facilities: BriefFacility[];
  promo: BriefPromo | null;
  heroEmphasis: HeroEmphasis | null;
  ctaGoals: CtaGoal[];
  /** Materi bebas per section. Bahan AI, tidak pernah dirender langsung. */
  notes: Partial<Record<BlockType, string>>;
}

/**
 * repairShape() tidak menambal field BARIS yang baru ditambahkan, jadi snapshot
 * lama membawa `brief: undefined`. Setiap pembacaan brief wajib lewat fungsi ini.
 */
export function emptyBrief(): ProjectBrief {
  return {
    version: 1, location: null, nearby: [], highlights: [],
    facilities: [], promo: null, heroEmphasis: null, ctaGoals: [], notes: {},
  };
}

export interface AgentProfile {
  id: Id;
  userId: Id;
  fullName: string;
  email: string;
  whatsapp: string;
  siteName: string;
  subdomain: string;
  theme: string;
  logoUrl: string | null;
  colorScheme: string;
  about: string;
  stats: { closings: number; listings: number; years: number };
  /**
   * Stat ke-3 pada tab Profil di file design ("Wilayah Spesialis"). Teks, jadi
   * tidak bisa masuk `stats` yang seluruhnya angka. `stats.years` tetap ada dan
   * dipakai situs profil, bukan layar Settings.
   */
  specialistArea: string;
  services: string[];
  isPublished: boolean;
  /** Preferensi notifikasi lead. Pengiriman email di luar scope MVP; nilainya tetap disimpan. */
  notifyOnLead: boolean;
}

export interface Project {
  id: Id;
  userId: Id;
  name: string;
  slug: string;
  location: string;
  developer: string;
  description: string;
  facilities: string[];
  projectType: ProjectType | null;
  brief: ProjectBrief;
  status: ProjectStatus;
  theme: ThemeName;
  palette: PaletteName;
  blocks: Block[];
  seo: SeoContent;
  aiContent: ProjectAiContent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface HouseType {
  id: Id;
  projectId: Id;
  name: string;
  slug: string;
  price: number;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carport: number;
  status: ProjectStatus;
  aiContent: HouseTypeAiContent | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: Id;
  userId: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: MediaType;
  url: string;
  size: number;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Lead {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
}

export interface EventRow {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: EventType;
  date: string;
  count: number;
}

export interface AiUsage {
  id: Id;
  userId: Id;
  projectId: Id;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  error: string | null;
  createdAt: string;
}

export interface StoreShape {
  agentProfiles: AgentProfile[];
  projects: Project[];
  houseTypes: HouseType[];
  media: Media[];
  leads: Lead[];
  events: EventRow[];
  aiUsage: AiUsage[];
}

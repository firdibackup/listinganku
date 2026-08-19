/**
 * Model blok landing page.
 *
 * Dua aturan yang menopang seluruh arsitektur landing:
 *  1. Blok menyimpan REFERENSI (mediaId, houseTypeId), bukan salinan harga/foto.
 *     Ubah harga di detail tipe rumah, landing live ikut berubah tanpa sentuh editor.
 *  2. Field teks OPSIONAL. Kosong = pakai default AI, terisi = override.
 *     Karena itu "Use AI suggestion" cukup menghapus field, bukan fitur tersendiri.
 *
 * Modul ini hanya mengimpor `type ThemeName` (erased saat kompilasi) supaya
 * lib/data/types.ts tetap bisa memakainya tanpa menarik runtime apa pun.
 */

import type { ThemeName } from './themeNames';

export type BlockType =
  | 'hero' | 'gallery' | 'highlights' | 'houseTypes' | 'specs'
  | 'facilities' | 'floorPlans' | 'location' | 'faq' | 'agentCta' | 'contactForm'
  | 'pricePromo' | 'developer' | 'testimonials';

export interface BlockBase<T extends BlockType, P> {
  id: string;
  type: T;
  enabled: boolean;
  /** Varian layout per tema. Belum dipakai di slice 1 (satu set komponen wireframe). */
  variant?: string;
  props: P;
}

export type HeroBlock = BlockBase<'hero', { title?: string; subtitle?: string; mediaId?: string; badges?: string[] }>;
export type GalleryBlock = BlockBase<'gallery', { layout: 'carousel' | 'grid'; mediaIds?: string[] }>;
export type HighlightsBlock = BlockBase<'highlights', { items?: string[] }>;
export type HouseTypesBlock = BlockBase<'houseTypes', { order?: string[]; hidden?: string[] }>;
export type SpecsBlock = BlockBase<'specs', Record<string, never>>;
export type FacilitiesBlock = BlockBase<'facilities', Record<string, never>>;
export type FloorPlansBlock = BlockBase<'floorPlans', { mediaIds?: string[] }>;
export type LocationBlock = BlockBase<'location', { address?: string; mapUrl?: string; access?: { time: string; place: string }[] }>;
export type FaqBlock = BlockBase<'faq', { items?: { q: string; a: string }[] }>;
export type AgentCtaBlock = BlockBase<'agentCta', { waNumber?: string; defaultMessage?: string }>;
export type ContactFormBlock = BlockBase<'contactForm', { askHouseType?: boolean }>;

export type PricePromoBlock = BlockBase<'pricePromo', {
  dpText?: string;
  installmentText?: string;
  promos?: string[];
  note?: string;
}>;

export type TestimonialsBlock = BlockBase<'testimonials', {
  items?: { quote: string; name: string; unit: string }[];
}>;

/** value bertipe string, bukan number — desain menampilkan "40+" dan "12.000". */
export type DeveloperBlock = BlockBase<'developer', {
  about?: string;
  stats?: { value: string; label: string }[];
}>;

export type Block =
  | HeroBlock | GalleryBlock | HighlightsBlock | HouseTypesBlock | SpecsBlock
  | FacilitiesBlock | FloorPlansBlock | LocationBlock | FaqBlock | AgentCtaBlock | ContactFormBlock
  | PricePromoBlock | TestimonialsBlock | DeveloperBlock;

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  gallery: 'Galeri',
  highlights: 'Highlights',
  houseTypes: 'Tipe Rumah',
  specs: 'Spesifikasi per Tipe',
  facilities: 'Fasilitas',
  floorPlans: 'Denah',
  location: 'Lokasi',
  faq: 'FAQ',
  agentCta: 'CTA WhatsApp',
  contactForm: 'Form Kontak',
  pricePromo: 'Harga & Promo',
  developer: 'Developer',
  testimonials: 'Testimoni',
};

/**
 * Tiap entri diketik oleh props milik blok itu sendiri, bukan Record<string, unknown>.
 * Tanpa ini salah ketik (`layuot`) atau field wajib yang hilang lolos dari tsc dan
 * baru ketahuan sebagai blok rusak di halaman publik.
 */
type DefaultPropsMap = { [K in BlockType]: Extract<Block, { type: K }>['props'] };

const DEFAULT_PROPS: DefaultPropsMap = {
  hero: {},
  gallery: { layout: 'carousel' },
  highlights: {},
  houseTypes: {},
  specs: {},
  facilities: {},
  floorPlans: {},
  location: {},
  faq: {},
  agentCta: {},
  contactForm: { askHouseType: true },
  pricePromo: {},
  developer: {},
  testimonials: {},
};

/**
 * Urutan bawaan MILIK TEMA (spec §10). Ganti tema di editor menawarkan urutan
 * ini lewat konfirmasi — susunan manual agen tidak pernah ditimpa diam-diam.
 */
export const BLOCK_ORDER_BY_THEME: Partial<Record<ThemeName, BlockType[]>> = {
  tropicalWarm: [
    'hero', 'location', 'highlights', 'houseTypes', 'specs', 'facilities',
    'floorPlans', 'gallery', 'pricePromo', 'developer', 'testimonials', 'faq',
    'agentCta', 'contactForm',
  ],
  // 01 Premium Gelap: USP dulu, lokasi & masterplan setelah galeri.
  premiumDark: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'gallery',
    'location', 'floorPlans', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
  // 02 Editorial Putih: "bab" berurutan — USP, unit (daftar), lokasi, fasilitas,
  // masterplan, galeri, harga, testimoni, developer, FAQ, tim marketing.
  editorialWhite: [
    'hero', 'highlights', 'houseTypes', 'specs', 'location', 'facilities',
    'floorPlans', 'gallery', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
  // 04 Soft Luxury Beige: fasilitas sebelum lokasi, galeri setelah lokasi.
  softLuxury: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'location',
    'gallery', 'floorPlans', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
  // 05 Bold Retail: statistik developer sebagai strip di atas, promo di depan.
  boldRetail: [
    'hero', 'developer', 'highlights', 'houseTypes', 'specs', 'pricePromo',
    'location', 'facilities', 'floorPlans', 'gallery', 'testimonials', 'faq',
    'agentCta', 'contactForm',
  ],
  // 03 Korporat Biru: statistik trust di atas, promo dekat unit.
  corporateBlue: [
    'hero', 'developer', 'highlights', 'houseTypes', 'specs', 'pricePromo',
    'location', 'facilities', 'floorPlans', 'gallery', 'testimonials', 'agentCta',
    'faq', 'contactForm',
  ],
  // 06 Arsitektural Beton: masterplan menonjol lebih awal, unit sebagai lembar spesifikasi.
  architectural: [
    'hero', 'highlights', 'houseTypes', 'specs', 'floorPlans', 'facilities',
    'location', 'gallery', 'pricePromo', 'developer', 'testimonials', 'faq',
    'agentCta', 'contactForm',
  ],
  // 07 Nature Calm: fasilitas & ruang hijau lebih dulu dari tipe unit.
  natureCalm: [
    'hero', 'highlights', 'facilities', 'houseTypes', 'specs', 'location',
    'floorPlans', 'gallery', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
  // 08 Klasik Navy: komposisi terpusat, testimoni & trust ditonjolkan.
  classicNavy: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'location',
    'floorPlans', 'gallery', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
  // 09 Playful Pastel: santai, blok pastel.
  playfulPastel: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'location',
    'floorPlans', 'gallery', 'pricePromo', 'testimonials', 'developer', 'faq',
    'agentCta', 'contactForm',
  ],
};

const DISABLED_BY_DEFAULT: Partial<Record<ThemeName, BlockType[]>> = {
  tropicalWarm: ['specs'],
  premiumDark: ['specs'],
  editorialWhite: ['specs'],
  softLuxury: ['specs'],
  boldRetail: ['specs'],
  corporateBlue: ['specs'],
  architectural: ['specs'],
  natureCalm: ['specs'],
  classicNavy: ['specs'],
  playfulPastel: ['specs'],
};

export function defaultBlocksForTheme(theme: ThemeName): Block[] {
  const order = BLOCK_ORDER_BY_THEME[theme] ?? BLOCK_ORDER_BY_THEME.tropicalWarm!;
  const off = new Set(DISABLED_BY_DEFAULT[theme] ?? DISABLED_BY_DEFAULT.tropicalWarm ?? []);
  return order.map(
    (type) => ({ id: `blk_${type}`, type, enabled: !off.has(type), props: { ...DEFAULT_PROPS[type] } }) as Block,
  );
}

export function moveBlock(blocks: Block[], id: string, dir: 'up' | 'down'): Block[] {
  const index = blocks.findIndex((b) => b.id === id);
  const target = dir === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= blocks.length) return blocks;

  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function toggleBlock(blocks: Block[], id: string): Block[] {
  return blocks.map((b) => (b.id === id ? ({ ...b, enabled: !b.enabled } as Block) : b));
}

/**
 * Menggabungkan patch ke props. Nilai `undefined` MENGHAPUS key —
 * itulah cara "Use AI suggestion" mengembalikan konten ke hasil AI.
 */
export function updateBlockProps(blocks: Block[], id: string, patch: Record<string, unknown>): Block[] {
  return blocks.map((b) => {
    if (b.id !== id) return b;
    const props: Record<string, unknown> = { ...b.props };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) delete props[key];
      else props[key] = value;
    }
    return { ...b, props } as Block;
  });
}

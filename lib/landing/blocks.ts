/**
 * Model blok landing page.
 *
 * Dua aturan yang menopang seluruh arsitektur landing:
 *  1. Blok menyimpan REFERENSI (mediaId, houseTypeId), bukan salinan harga/foto.
 *     Ubah harga di detail tipe rumah, landing live ikut berubah tanpa sentuh editor.
 *  2. Field teks OPSIONAL. Kosong = pakai default AI, terisi = override.
 *     Karena itu "Use AI suggestion" cukup menghapus field, bukan fitur tersendiri.
 *
 * Modul ini sengaja tanpa import apa pun supaya lib/data/types.ts bisa memakainya.
 */

export type BlockType =
  | 'hero' | 'gallery' | 'highlights' | 'houseTypes' | 'specs'
  | 'facilities' | 'floorPlans' | 'location' | 'faq' | 'agentCta' | 'contactForm';

export interface BlockBase<T extends BlockType, P> {
  id: string;
  type: T;
  enabled: boolean;
  /** Varian layout per tema. Belum dipakai di slice 1 (satu set komponen wireframe). */
  variant?: string;
  props: P;
}

export type HeroBlock = BlockBase<'hero', { title?: string; subtitle?: string; mediaId?: string }>;
export type GalleryBlock = BlockBase<'gallery', { layout: 'carousel' | 'grid'; mediaIds?: string[] }>;
export type HighlightsBlock = BlockBase<'highlights', { items?: string[] }>;
export type HouseTypesBlock = BlockBase<'houseTypes', { order?: string[]; hidden?: string[] }>;
export type SpecsBlock = BlockBase<'specs', Record<string, never>>;
export type FacilitiesBlock = BlockBase<'facilities', Record<string, never>>;
export type FloorPlansBlock = BlockBase<'floorPlans', { mediaIds?: string[] }>;
export type LocationBlock = BlockBase<'location', { address?: string; mapUrl?: string }>;
export type FaqBlock = BlockBase<'faq', { items?: { q: string; a: string }[] }>;
export type AgentCtaBlock = BlockBase<'agentCta', { waNumber?: string; defaultMessage?: string }>;
export type ContactFormBlock = BlockBase<'contactForm', { askHouseType?: boolean }>;

export type Block =
  | HeroBlock | GalleryBlock | HighlightsBlock | HouseTypesBlock | SpecsBlock
  | FacilitiesBlock | FloorPlansBlock | LocationBlock | FaqBlock | AgentCtaBlock | ContactFormBlock;

/** Urutan default sesuai PRD dan blockDefs di Listingku App.dc.html. */
export const BLOCK_ORDER: BlockType[] = [
  'hero', 'gallery', 'highlights', 'houseTypes', 'specs',
  'facilities', 'floorPlans', 'location', 'faq', 'agentCta', 'contactForm',
];

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
};

const DEFAULT_PROPS: Record<BlockType, Record<string, unknown>> = {
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
};

export function defaultBlocks(): Block[] {
  return BLOCK_ORDER.map(
    (type) => ({ id: `blk_${type}`, type, enabled: true, props: { ...DEFAULT_PROPS[type] } }) as Block,
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

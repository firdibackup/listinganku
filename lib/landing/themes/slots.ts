import type { Media } from '@/lib/data/types';
import type { ResolvedBlock } from '../resolve';

/**
 * Slot media bersama untuk kesepuluh tema.
 *
 * Galeri dan denah di kesepuluh file desain digambar sebagai kotak berlabel,
 * bukan foto — dan seed memang belum punya satu file media pun. Sebelum ini
 * kedua section itu `return null` saat media kosong, jadi dua section yang ada
 * di SETIAP desain tidak pernah muncul di app. Slot memisahkan "berapa banyak
 * dan apa namanya" (dari blok) dari "sudah ada filenya atau belum" (dari media),
 * jadi bentuk section tetap sama sebelum dan sesudah agen mengunggah foto.
 */
export type GallerySlot = { key: string; media: Media | null; caption: string };

export function gallerySlots(block: Extract<ResolvedBlock, { type: 'gallery' }>): GallerySlot[] {
  const count = Math.max(block.images.length, block.captions.length);
  return Array.from({ length: count }, (_, i) => ({
    key: block.images[i]?.id ?? `slot-${i}`,
    media: block.images[i] ?? null,
    caption: block.captions[i] ?? `Foto ${i + 1}`,
  }));
}

export type PlanSlot = { key: string; name: string; media: Media | null };

export function planSlots(block: Extract<ResolvedBlock, { type: 'floorPlans' }>): PlanSlot[] {
  const uploaded = new Map(block.plans.map((p) => [p.houseType.id, p.media]));
  return block.houseTypes.map((h) => ({
    key: h.id,
    name: h.name,
    media: uploaded.get(h.id) ?? null,
  }));
}

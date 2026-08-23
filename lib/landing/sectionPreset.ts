import type { Block, BlockType } from './blocks';
import type { ProjectType } from '@/lib/data/types';

/**
 * Section yang MENYALA per tipe project. Yang tidak disebut di sini dimatikan.
 *
 * Deterministik dan bukan panggilan AI: rekomendasi section adalah keputusan
 * tabel, dan panggilan AI kedua akan menambah 5–15 detik tepat di jalur Time to
 * Publish <10 menit — sekaligus tetap menuntut tabel ini sebagai fallback.
 *
 * `testimonials` tidak pernah masuk preset mana pun. resolve() sengaja tidak
 * memberinya fallback AI (testimoni fabrikasi adalah penipuan terhadap calon
 * pembeli), jadi menyalakannya secara default hanya menyodorkan section kosong.
 *
 * URUTAN di sini tidak berarti apa-apa — urutan section milik tema
 * (BLOCK_ORDER_BY_THEME). Preset hanya menyentuh flag `enabled`.
 */
export const SECTION_PRESET: Record<ProjectType, BlockType[]> = {
  perumahan: [
    'hero', 'highlights', 'houseTypes', 'facilities', 'location', 'floorPlans',
    'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Unit apartemen dibandingkan lewat angka (luas, kamar, lantai), jadi tabel
  // spesifikasi menyala — beda dari perumahan yang dibandingkan lewat kartu tipe.
  apartemen: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'location',
    'floorPlans', 'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Ruko dijual sebagai unit usaha: tidak ada fasilitas kawasan hunian, dan
  // harga/promo naik lebih awal dalam keputusan pembeli.
  ruko: [
    'hero', 'highlights', 'houseTypes', 'specs', 'location', 'pricePromo',
    'floorPlans', 'gallery', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Kavling adalah tanah: tidak ada tipe rumah, tidak ada spesifikasi bangunan,
  // tidak ada fasilitas kawasan. Site plan (lewat floorPlans) justru yang utama.
  kavling: [
    'hero', 'highlights', 'location', 'floorPlans', 'gallery', 'pricePromo',
    'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Identik dengan perumahan secara section. Tipenya tetap terpisah karena ikut
  // dikirim ke AI sebagai konteks (nada copy villa berbeda) dan tampil di kartu.
  villa: [
    'hero', 'highlights', 'houseTypes', 'facilities', 'location', 'floorPlans',
    'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
};

/**
 * Menyetel flag `enabled` sesuai preset TANPA menyentuh urutan maupun props.
 * Membuang props di sini akan menghapus isian agen tanpa peringatan — cacat yang
 * sudah pernah diperbaiki di applyThemeOrder().
 */
export function applySectionPreset(blocks: Block[], type: ProjectType | null): Block[] {
  if (!type) return blocks;
  const on = new Set(SECTION_PRESET[type]);
  return blocks.map((b) => ({ ...b, enabled: on.has(b.type) }) as Block);
}

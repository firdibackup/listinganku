import { describe, it, expect } from 'vitest';
import { SECTION_PRESET, applySectionPreset } from '@/lib/landing/sectionPreset';
import { defaultBlocksForTheme, BLOCK_LABELS, updateBlockProps } from '@/lib/landing/blocks';
import { PROJECT_TYPES } from '@/lib/schemas';

const enabledTypes = (blocks: ReturnType<typeof defaultBlocksForTheme>) =>
  blocks.filter((b) => b.enabled).map((b) => b.type);

describe('SECTION_PRESET', () => {
  it('punya entri untuk setiap ProjectType', () => {
    for (const t of PROJECT_TYPES) expect(SECTION_PRESET[t]).toBeDefined();
  });

  it('hanya menyebut BlockType yang benar-benar ada', () => {
    const valid = new Set(Object.keys(BLOCK_LABELS));
    for (const t of PROJECT_TYPES) {
      for (const b of SECTION_PRESET[t]) expect(valid.has(b)).toBe(true);
    }
  });

  it('testimonials MATI di semua preset — testimoni tidak boleh datang dari AI', () => {
    for (const t of PROJECT_TYPES) expect(SECTION_PRESET[t]).not.toContain('testimonials');
  });

  it('kavling tidak menyalakan tipe rumah maupun fasilitas', () => {
    expect(SECTION_PRESET.kavling).not.toContain('houseTypes');
    expect(SECTION_PRESET.kavling).not.toContain('facilities');
  });

  it('ruko tidak menyalakan fasilitas kawasan tapi tetap menyalakan spesifikasi', () => {
    expect(SECTION_PRESET.ruko).not.toContain('facilities');
    expect(SECTION_PRESET.ruko).toContain('specs');
  });

  it('semua preset menyalakan hero dan form kontak', () => {
    for (const t of PROJECT_TYPES) {
      expect(SECTION_PRESET[t]).toContain('hero');
      expect(SECTION_PRESET[t]).toContain('contactForm');
    }
  });
});

describe('applySectionPreset', () => {
  it('menyalakan yang di preset dan mematikan sisanya', () => {
    const out = applySectionPreset(defaultBlocksForTheme('tropicalWarm'), 'kavling');
    expect(enabledTypes(out).sort()).toEqual([...SECTION_PRESET.kavling].sort());
  });

  it('URUTAN tidak berubah — urutan milik tema, preset hanya menyentuh enabled', () => {
    const before = defaultBlocksForTheme('tropicalWarm');
    const after = applySectionPreset(before, 'apartemen');
    expect(after.map((b) => b.type)).toEqual(before.map((b) => b.type));
  });

  it('props TIDAK dibuang — mematikan section bukan alasan menghapus isian agen', () => {
    const before = updateBlockProps(defaultBlocksForTheme('tropicalWarm'), 'blk_facilities', {
      items: [{ name: 'Private Garden', desc: 'Taman pribadi' }],
    });
    const after = applySectionPreset(before, 'kavling');
    const fac = after.find((b) => b.type === 'facilities')!;
    expect(fac.enabled).toBe(false);
    expect((fac.props as { items?: unknown[] }).items).toHaveLength(1);
  });

  it('projectType null mengembalikan blok apa adanya', () => {
    const before = defaultBlocksForTheme('tropicalWarm');
    expect(applySectionPreset(before, null)).toEqual(before);
  });
});

import { describe, it, expect } from 'vitest';
import { defaultBlocksForTheme, moveBlock, toggleBlock, updateBlockProps, BLOCK_LABELS } from '@/lib/landing/blocks';

describe('defaultBlocksForTheme', () => {
  it('tropicalWarm menghasilkan 14 blok dengan urutan temanya', () => {
    expect(defaultBlocksForTheme('tropicalWarm').map((b) => b.type)).toEqual([
      'hero', 'location', 'highlights', 'houseTypes', 'specs', 'facilities',
      'floorPlans', 'gallery', 'pricePromo', 'developer', 'testimonials', 'faq',
      'agentCta', 'contactForm',
    ]);
  });

  it('mematikan specs secara default karena spesifikasi sudah ada di kartu tipe unit', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    expect(blocks.find((b) => b.type === 'specs')?.enabled).toBe(false);
    expect(blocks.filter((b) => b.type !== 'specs').every((b) => b.enabled)).toBe(true);
  });

  it('memberi id unik ke setiap blok', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });

  it('memberi label Indonesia untuk ketiga blok baru', () => {
    expect(BLOCK_LABELS.pricePromo).toBe('Harga & Promo');
    expect(BLOCK_LABELS.developer).toBe('Developer');
    expect(BLOCK_LABELS.testimonials).toBe('Testimoni');
  });

  it('menamai setiap tipe blok dalam Bahasa Indonesia', () => {
    for (const b of defaultBlocksForTheme('tropicalWarm')) expect(BLOCK_LABELS[b.type]).toBeTruthy();
    expect(BLOCK_LABELS.houseTypes).toBe('Tipe Rumah');
    expect(BLOCK_LABELS.agentCta).toBe('CTA WhatsApp');
  });

  it('tema tak dikenal jatuh ke urutan tropicalWarm, bukan array kosong', () => {
    // @ts-expect-error sengaja: data lama bisa membawa nilai theme asing
    expect(defaultBlocksForTheme('sesuatuYangHilang')).toHaveLength(14);
  });
});

describe('moveBlock', () => {
  it('menukar blok dengan tetangganya', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    const secondId = blocks[1].id;
    expect(moveBlock(blocks, secondId, 'up').map((b) => b.type).slice(0, 2)).toEqual([blocks[1].type, blocks[0].type]);
  });

  it('tidak mengubah apa pun di ujung daftar', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    expect(moveBlock(blocks, blocks[0].id, 'up')).toEqual(blocks);
    expect(moveBlock(blocks, blocks[blocks.length - 1].id, 'down')).toEqual(blocks);
  });

  it('tidak memutasi array masukan', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    const snapshot = JSON.stringify(blocks);
    moveBlock(blocks, blocks[1].id, 'up');
    expect(JSON.stringify(blocks)).toBe(snapshot);
  });
});

describe('toggleBlock', () => {
  it('membalik enabled hanya pada blok yang dituju', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    const next = toggleBlock(blocks, blocks[3].id);
    expect(next[3].enabled).toBe(false);
    expect(next[0].enabled).toBe(true);
  });
});

describe('updateBlockProps', () => {
  it('menggabungkan patch ke props blok', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    const hero = blocks[0];
    const next = updateBlockProps(blocks, hero.id, { title: 'Parkspring Gading' });
    expect(next[0].props).toMatchObject({ title: 'Parkspring Gading' });
  });

  it('menghapus override saat nilainya undefined, mengembalikan default AI', () => {
    const base = defaultBlocksForTheme('tropicalWarm');
    const withTitle = updateBlockProps(base, base[0].id, { title: 'Judul manual' });
    const cleared = updateBlockProps(withTitle, base[0].id, { title: undefined });
    expect('title' in cleared[0].props).toBe(false);
  });
});

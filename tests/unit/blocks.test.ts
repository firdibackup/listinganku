import { describe, it, expect } from 'vitest';
import { defaultBlocks, moveBlock, toggleBlock, updateBlockProps, BLOCK_ORDER, BLOCK_LABELS } from '@/lib/landing/blocks';

describe('defaultBlocks', () => {
  it('memakai urutan blok yang ditetapkan PRD', () => {
    expect(defaultBlocks().map((b) => b.type)).toEqual([
      'hero', 'gallery', 'highlights', 'houseTypes', 'specs',
      'facilities', 'floorPlans', 'location', 'faq', 'agentCta', 'contactForm',
    ]);
  });

  it('mengaktifkan semua blok dan memberi id unik', () => {
    const blocks = defaultBlocks();
    expect(blocks.every((b) => b.enabled)).toBe(true);
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });

  it('menamai setiap tipe blok dalam Bahasa Indonesia', () => {
    for (const type of BLOCK_ORDER) expect(BLOCK_LABELS[type]).toBeTruthy();
    expect(BLOCK_LABELS.houseTypes).toBe('Tipe Rumah');
    expect(BLOCK_LABELS.agentCta).toBe('CTA WhatsApp');
  });
});

describe('moveBlock', () => {
  it('menukar blok dengan tetangganya', () => {
    const blocks = defaultBlocks();
    const galleryId = blocks[1].id;
    expect(moveBlock(blocks, galleryId, 'up').map((b) => b.type).slice(0, 2)).toEqual(['gallery', 'hero']);
  });

  it('tidak mengubah apa pun di ujung daftar', () => {
    const blocks = defaultBlocks();
    expect(moveBlock(blocks, blocks[0].id, 'up')).toEqual(blocks);
    expect(moveBlock(blocks, blocks[blocks.length - 1].id, 'down')).toEqual(blocks);
  });

  it('tidak memutasi array masukan', () => {
    const blocks = defaultBlocks();
    const snapshot = JSON.stringify(blocks);
    moveBlock(blocks, blocks[1].id, 'up');
    expect(JSON.stringify(blocks)).toBe(snapshot);
  });
});

describe('toggleBlock', () => {
  it('membalik enabled hanya pada blok yang dituju', () => {
    const blocks = defaultBlocks();
    const next = toggleBlock(blocks, blocks[3].id);
    expect(next[3].enabled).toBe(false);
    expect(next[0].enabled).toBe(true);
  });
});

describe('updateBlockProps', () => {
  it('menggabungkan patch ke props blok', () => {
    const blocks = defaultBlocks();
    const hero = blocks[0];
    const next = updateBlockProps(blocks, hero.id, { title: 'Parkspring Gading' });
    expect(next[0].props).toMatchObject({ title: 'Parkspring Gading' });
  });

  it('menghapus override saat nilainya undefined, mengembalikan default AI', () => {
    const blocks = updateBlockProps(defaultBlocks(), defaultBlocks()[0].id, {});
    const withTitle = updateBlockProps(blocks, blocks[0].id, { title: 'Judul manual' });
    const cleared = updateBlockProps(withTitle, blocks[0].id, { title: undefined });
    expect('title' in cleared[0].props).toBe(false);
  });
});

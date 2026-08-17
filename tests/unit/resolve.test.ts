import { describe, it, expect } from 'vitest';
import { resolveBlocks } from '@/lib/landing/resolve';
import { defaultBlocks, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import type { Project } from '@/lib/data/types';

function fixture(overrides: Partial<Project> = {}) {
  const store = seedStore();
  const project = { ...store.projects[0], blocks: defaultBlocks(), ...overrides };
  return {
    project,
    houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
    media: [],
    agent: store.agentProfiles[0],
  };
}

const pick = <T extends { type: string }>(blocks: T[], type: string) => blocks.find((b) => b.type === type);

describe('resolveBlocks', () => {
  it('mempertahankan urutan blok dan membuang yang nonaktif', () => {
    const input = fixture();
    const withoutFaq = toggleBlock(input.project.blocks, 'blk_faq');
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks: withoutFaq } });
    expect(resolved.map((b) => b.type)).not.toContain('faq');
    expect(resolved[0].type).toBe('hero');
  });

  it('memakai konten AI saat override kosong', () => {
    const input = fixture({
      aiContent: {
        headline: 'Parkspring Gading — Cluster tiga tipe',
        description: 'Deskripsi panjang.',
        sellingPoints: ['Akses tol 5 menit'],
        faq: [{ q: 'Bisa KPR?', a: 'Bisa.' }],
        seo: { title: 'T', description: 'D' },
        captions: { instagram: 'i', facebook: 'f', whatsapp: 'w' },
      },
    });
    const hero = pick(resolveBlocks(input), 'hero') as { title: string };
    expect(hero.title).toBe('Parkspring Gading — Cluster tiga tipe');
  });

  it('mengutamakan override di atas konten AI', () => {
    const base = fixture({
      aiContent: {
        headline: 'Judul dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(base.project.blocks, 'blk_hero', { title: 'Judul manual' });
    const hero = pick(resolveBlocks({ ...base, project: { ...base.project, blocks } }), 'hero') as { title: string };
    expect(hero.title).toBe('Judul manual');
  });

  it('jatuh ke nama project saat AI dan override sama-sama kosong', () => {
    const hero = pick(resolveBlocks(fixture()), 'hero') as { title: string };
    expect(hero.title).toBe('Parkspring Gading');
  });

  it('menghormati urutan dan penyembunyian tipe rumah', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_houseTypes', {
      order: ['hts_grand', 'hts_villa', 'hts_midea'],
      hidden: ['hts_midea'],
    });
    const block = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'houseTypes') as {
      houseTypes: { name: string }[];
    };
    expect(block.houseTypes.map((h) => h.name)).toEqual(['Grand', 'Villa']);
  });

  it('mengambil nomor WhatsApp dari profil agen bila CTA tidak dioverride', () => {
    const cta = pick(resolveBlocks(fixture()), 'agentCta') as { waNumber: string; defaultMessage: string };
    expect(cta.waNumber).toBe('081288994410');
    expect(cta.defaultMessage).toContain('Parkspring Gading');
  });

  it('menurunkan fasilitas dari project, bukan dari props blok', () => {
    const facilities = pick(resolveBlocks(fixture()), 'facilities') as { items: string[] };
    expect(facilities.items).toEqual(['Kolam renang', 'Security 24 jam', 'Jogging track']);
  });

  // Edge cases
  it('memperlakukan 0 sebagai nilai yang sah, bukan kekosongan', () => {
    const input = fixture({
      aiContent: {
        headline: 'Dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_contactForm', { askHouseType: 0 as unknown as boolean });
    const form = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'contactForm') as { askHouseType: unknown };
    // 0 is falsy but not undefined/empty, so it should be used
    expect(form.askHouseType).toBe(0);
  });

  it('memperlakukan false sebagai nilai yang sah, bukan kekosongan', () => {
    const input = fixture({
      aiContent: {
        headline: 'Dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_contactForm', { askHouseType: false });
    const form = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'contactForm') as { askHouseType: boolean };
    expect(form.askHouseType).toBe(false);
  });

  it('memperlakukan string kosong sebagai kekosongan, bukan nilai', () => {
    const input = fixture({
      aiContent: {
        headline: 'Dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_hero', { title: '' });
    const hero = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'hero') as { title: string };
    // Empty string should fall through to AI
    expect(hero.title).toBe('Dari AI');
  });

  it('memperlakukan array kosong sebagai kekosongan, bukan nilai', () => {
    const input = fixture({
      aiContent: {
        headline: '', description: '', sellingPoints: ['Dari AI'], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_highlights', { items: [] });
    const highlights = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'highlights') as { items: string[] };
    // Empty array should fall through to AI
    expect(highlights.items).toEqual(['Dari AI']);
  });

  it('mengabaikan mediaId yang tidak ada tanpa crash', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_hero', { mediaId: 'med_nonexistent' });
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks } });
    const hero = pick(resolved, 'hero') as { image: unknown };
    // Dangling reference should be skipped gracefully
    expect(hero).toBeDefined();
    expect(hero.image).toBeNull();
  });

  it('mengabaikan houseTypeId yang tidak ada tanpa crash', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_houseTypes', {
      order: ['hts_nonexistent', 'hts_villa'],
      hidden: [],
    });
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks } });
    const block = pick(resolved, 'houseTypes') as { houseTypes: { id: string }[] };
    // Dangling reference should be filtered out
    expect(block.houseTypes.map((h) => h.id)).toEqual(['hts_villa']);
  });

  it('menangani block tanpa aiContent sama sekali', () => {
    const input = fixture({ aiContent: null });
    const hero = pick(resolveBlocks(input), 'hero') as { title: string };
    // Should fall back to project name
    expect(hero.title).toBe('Parkspring Gading');
  });

  it('melewati disabled block dari output', () => {
    const input = fixture();
    const blocks = toggleBlock(input.project.blocks, 'blk_highlights');
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks } });
    expect(resolved.map((b) => b.type)).not.toContain('highlights');
  });

  it('menganggap input pure (tidak mutasi)', () => {
    const input = fixture();
    const original = JSON.stringify(input);
    resolveBlocks(input);
    expect(JSON.stringify(input)).toBe(original);
  });
});

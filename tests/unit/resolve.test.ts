import { describe, it, expect } from 'vitest';
import { resolveBlocks, pick } from '@/lib/landing/resolve';
import { defaultBlocks, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import type { Project, Media } from '@/lib/data/types';

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

const pickBlock = <T extends { type: string }>(blocks: T[], type: string) => blocks.find((b) => b.type === type);

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
    const hero = pickBlock(resolveBlocks(input), 'hero') as { title: string };
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
    const hero = pickBlock(resolveBlocks({ ...base, project: { ...base.project, blocks } }), 'hero') as { title: string };
    expect(hero.title).toBe('Judul manual');
  });

  it('jatuh ke nama project saat AI dan override sama-sama kosong', () => {
    const hero = pickBlock(resolveBlocks(fixture()), 'hero') as { title: string };
    expect(hero.title).toBe('Parkspring Gading');
  });

  it('menghormati urutan dan penyembunyian tipe rumah', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_houseTypes', {
      order: ['hts_grand', 'hts_villa', 'hts_midea'],
      hidden: ['hts_midea'],
    });
    const block = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'houseTypes') as {
      houseTypes: { name: string }[];
    };
    expect(block.houseTypes.map((h) => h.name)).toEqual(['Grand', 'Villa']);
  });

  it('mengambil nomor WhatsApp dari profil agen bila CTA tidak dioverride', () => {
    const cta = pickBlock(resolveBlocks(fixture()), 'agentCta') as { waNumber: string; defaultMessage: string };
    expect(cta.waNumber).toBe('081288994410');
    expect(cta.defaultMessage).toContain('Parkspring Gading');
  });

  it('menurunkan fasilitas dari project, bukan dari props blok', () => {
    const facilities = pickBlock(resolveBlocks(fixture()), 'facilities') as { items: string[] };
    expect(facilities.items).toEqual(['Kolam renang', 'Security 24 jam', 'Jogging track']);
  });

  // Edge cases for pick() function
  describe('pick function — rantai override → AI → fallback', () => {
    it('mengambil override bahkan saat nilainya 0', () => {
      expect(pick(0, undefined, 99)).toBe(0);
    });

    it('mengambil override bahkan saat nilainya false', () => {
      expect(pick(false, undefined, true)).toBe(false);
    });

    it('mengambil AI saat override undefined dan nilainya 0', () => {
      expect(pick(undefined, 0, 99)).toBe(0);
    });

    it('memperlakukan string kosong sebagai kekosongan dan jatuh ke AI', () => {
      expect(pick('', 'ai', 'fallback')).toBe('ai');
    });

    it('memperlakukan array kosong sebagai kekosongan dan jatuh ke AI', () => {
      expect(pick([], ['ai'], [])).toEqual(['ai']);
    });

    it('memperlakukan whitespace-only string sebagai kekosongan', () => {
      expect(pick('   ', 'ai', 'fallback')).toBe('ai');
    });

    it('jatuh ke fallback saat override dan AI sama-sama kosong', () => {
      expect(pick(undefined, undefined, 'fallback')).toBe('fallback');
    });
  });

  it('menampilkan default foto saat semua mediaId galeri dangling', () => {
    const input = fixture();
    // Add a project photo to fall back to
    input.media.push({
      id: 'med_project_photo',
      userId: 'usr_audi',
      projectId: 'prj_parkspring',
      houseTypeId: null,
      type: 'photo',
      url: 'https://example.com/photo.jpg',
      size: 1024,
      isPrimary: true,
      sortOrder: 0,
      createdAt: '2026-08-10T09:00:00.000Z',
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_gallery', {
      mediaIds: ['med_nonexistent_1', 'med_nonexistent_2'],
    });
    const gallery = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'gallery') as { images: { id: string }[] };
    // Dangling IDs should trigger fallback to project + house type photos
    expect(gallery.images.length).toBe(1);
    expect(gallery.images[0].id).toBe('med_project_photo');
  });

  it('memperlakukan string kosong sebagai kekosongan, bukan nilai', () => {
    const input = fixture({
      aiContent: {
        headline: 'Dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(input.project.blocks, 'blk_hero', { title: '' });
    const hero = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'hero') as { title: string };
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
    const highlights = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'highlights') as { items: string[] };
    expect(highlights.items).toEqual(['Dari AI']);
  });

  it('mengabaikan mediaId yang tidak ada tanpa crash', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_hero', { mediaId: 'med_nonexistent' });
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks } });
    const hero = pickBlock(resolved, 'hero') as { image: unknown };
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
    const block = pickBlock(resolved, 'houseTypes') as { houseTypes: { id: string }[] };
    expect(block.houseTypes.map((h) => h.id)).toEqual(['hts_villa']);
  });

  it('menangani block tanpa aiContent sama sekali', () => {
    const input = fixture({ aiContent: null });
    const hero = pickBlock(resolveBlocks(input), 'hero') as { title: string };
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

  it('contactForm gunakan default true via ?? operator, bukan pick', () => {
    const input = fixture();
    const form = pickBlock(resolveBlocks(input), 'contactForm') as { askHouseType: boolean };
    expect(form.askHouseType).toBe(true);
  });
});

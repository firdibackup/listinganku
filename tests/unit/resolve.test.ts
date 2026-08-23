import { describe, it, expect } from 'vitest';
import { resolveBlocks, pick } from '@/lib/landing/resolve';
import { defaultBlocksForTheme, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import { emptyBrief } from '@/lib/data/types';
import type { Project, Media } from '@/lib/data/types';

function fixture(overrides: Partial<Project> = {}) {
  const store = seedStore();
  const project = { ...store.projects[0], blocks: defaultBlocksForTheme('tropicalWarm'), brief: emptyBrief(), ...overrides };
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
    expect(hero.title).toBe('Parkspring');
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
    expect(cta.defaultMessage).toContain('Parkspring');
  });

  it('menurunkan fasilitas dari project saat blok tidak mengoverride', () => {
    const facilities = pickBlock(resolveBlocks(fixture()), 'facilities') as { items: { name: string; desc: string }[] };
    expect(facilities.items.map((f) => f.name))
      .toEqual(['Clubhouse', 'Swimming Pool', 'Taman Tematik', 'Jogging Track', 'Playground', 'One Gate System']);
    // Nama tanpa keterangan tetap punya field desc kosong — komponen tema tidak
    // perlu tahu apakah isinya berasal dari wizard atau dari override blok.
    expect(facilities.items.every((f) => f.desc === '')).toBe(true);
  });

  it('memakai fasilitas dari props blok saat dioverride, lengkap dengan keterangannya', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_facilities', {
      items: [{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' }],
    });
    const facilities = pickBlock(
      resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'facilities',
    ) as { items: { name: string; desc: string }[] };
    expect(facilities.items).toEqual([{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' }]);
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
    const highlights = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'highlights') as { items: { title: string; desc: string }[] };
    // sellingPoints AI adalah kalimat lepas; resolve menaikkannya ke bentuk blok.
    expect(highlights.items).toEqual([{ title: 'Dari AI', desc: '' }]);
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
    expect(hero.title).toBe('Parkspring');
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

  describe('blok baru — pricePromo, testimonials, developer, akses, masterplan, badge', () => {
    it('meneruskan promo yang diisi agen apa adanya', () => {
      const input = fixture();
      const blocks = updateBlockProps(input.project.blocks, 'blk_pricePromo', { dpText: '10%', promos: ['Free BPHTB'] });
      const out = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'pricePromo');
      expect(out).toMatchObject({ dpText: '10%', promos: ['Free BPHTB'] });
    });

    it('menurunkan priceFrom dari harga tipe termurah', () => {
      const input = fixture();
      const cheapest = Math.min(...input.houseTypes.map((h) => h.price));
      const out = resolveBlocks(input);
      expect(pickBlock(out, 'pricePromo')).toMatchObject({ priceFrom: cheapest });
      expect(pickBlock(out, 'hero')).toMatchObject({ priceFrom: cheapest });
    });

    it('priceFrom null ketika project belum punya tipe rumah', () => {
      const input = { ...fixture(), houseTypes: [] };
      expect(pickBlock(resolveBlocks(input), 'hero')).toMatchObject({ priceFrom: null });
    });

    it('TIDAK mengisi testimoni dari AI walau aiContent tersedia', () => {
      const input = fixture({
        aiContent: {
          headline: 'x', description: '', sellingPoints: ['x'], faq: [],
          seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
        },
      });
      expect(pickBlock(resolveBlocks(input), 'testimonials')).toMatchObject({ items: [] });
    });

    it('memakai project.developer sebagai nama blok developer', () => {
      const input = fixture();
      expect(pickBlock(resolveBlocks(input), 'developer')).toMatchObject({ name: input.project.developer });
    });

    it('mempertahankan daftar akses lokasi', () => {
      const input = fixture();
      const blocks = updateBlockProps(input.project.blocks, 'blk_location', { access: [{ time: '3 mnt', place: 'Tol' }] });
      const out = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'location');
      expect(out).toMatchObject({ access: [{ time: '3 mnt', place: 'Tol' }] });
    });

    it('masterplan memilih floor_plan milik project, bukan denah per tipe', () => {
      const input = fixture();
      const media: Media[] = [
        { id: 'm1', userId: 'u', projectId: 'prj_parkspring', houseTypeId: null, type: 'floor_plan', url: 'a', size: 1, isPrimary: false, sortOrder: 0, createdAt: 'x' },
        { id: 'm2', userId: 'u', projectId: 'prj_parkspring', houseTypeId: 'hts_villa', type: 'floor_plan', url: 'b', size: 1, isPrimary: false, sortOrder: 0, createdAt: 'x' },
      ];
      const b = pickBlock(resolveBlocks({ ...input, media }), 'floorPlans') as { masterplan: Media | null };
      expect(b.masterplan?.id).toBe('m1');
    });

    it('badge hero jatuh ke highlights lalu facilities, maksimal 4', () => {
      const input = fixture();
      const withHl = updateBlockProps(input.project.blocks, 'blk_highlights', {
        items: ['a', 'b', 'c', 'd', 'e'].map((title) => ({ title })),
      });
      const heroA = pickBlock(resolveBlocks({ ...input, project: { ...input.project, blocks: withHl } }), 'hero');
      expect(heroA).toMatchObject({ badges: ['a', 'b', 'c', 'd'] });
    });
  });
});

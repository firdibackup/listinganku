import { describe, it, expect } from 'vitest';
import { resolveBlocks, pickFirst } from '@/lib/landing/resolve';
import { defaultBlocksForTheme, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import { emptyBrief } from '@/lib/data/types';
import type { Project, ProjectBrief } from '@/lib/data/types';

function fixture(brief: Partial<ProjectBrief> = {}, overrides: Partial<Project> = {}) {
  const store = seedStore();
  const project: Project = {
    ...store.projects[0],
    blocks: defaultBlocksForTheme('tropicalWarm'),
    brief: { ...emptyBrief(), ...brief },
    ...overrides,
  };
  return {
    project,
    houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
    media: [],
    agent: store.agentProfiles[0],
  };
}

const block = <T extends { type: string }>(blocks: T[], type: string) => blocks.find((b) => b.type === type);

/** aiContent lengkap dengan nilai KONTRAS supaya kebocoran AI ke fakta terdeteksi. */
const noisyAi = {
  headline: 'Judul dari AI',
  subheadline: 'Subjudul dari AI',
  description: 'Deskripsi dari AI',
  sellingPoints: ['USP dari AI'],
  faq: [{ q: 'Dari AI?', a: 'Ya.' }],
  seo: { title: 'T', description: 'D' },
  captions: { instagram: 'i', facebook: 'f', whatsapp: 'w' },
  cta: { whatsappMessage: 'Pesan WA dari AI' },
};

describe('pickFirst', () => {
  it('mengambil kandidat pertama yang hadir', () => {
    expect(pickFirst(undefined, '', '  ', 'terpakai', 'cadangan')).toBe('terpakai');
  });
  it('array kosong dianggap absen, sama seperti pick', () => {
    expect(pickFirst<string[]>([], ['isi'], [])).toEqual(['isi']);
  });
});

describe('FAKTA — brief menang atas AI, dan AI tidak pernah bisa masuk', () => {
  it('nearby ber-minutes menjadi kartu akses dengan satuan "mnt"', () => {
    const input = fixture({
      nearby: [
        { category: 'tol', name: 'Gerbang Tol Kelapa Gading', minutes: 3 },
        { category: 'mall', name: 'Mall Kelapa Gading', minutes: 8 },
      ],
    }, { aiContent: noisyAi });
    const loc = block(resolveBlocks(input), 'location') as { access: { time: string; place: string }[] };
    expect(loc.access).toEqual([
      { time: '3 mnt', place: 'Gerbang Tol Kelapa Gading' },
      { time: '8 mnt', place: 'Mall Kelapa Gading' },
    ]);
  });

  it('nearby TANPA minutes tidak menjadi kartu akses — kartu waktu tanpa waktu adalah kartu rusak', () => {
    const input = fixture({
      nearby: [
        { category: 'tol', name: 'Tol Kelapa Gading', minutes: 3 },
        { category: 'sekolah', name: 'Sekolah Harapan', minutes: null },
      ],
    });
    const loc = block(resolveBlocks(input), 'location') as { access: { place: string }[] };
    expect(loc.access.map((a) => a.place)).toEqual(['Tol Kelapa Gading']);
  });

  it('override di blok tetap menang atas brief', () => {
    const base = fixture({ nearby: [{ category: 'tol', name: 'Dari brief', minutes: 3 }] });
    const blocks = updateBlockProps(base.project.blocks, 'blk_location', {
      access: [{ time: '9 mnt', place: 'Dari editor' }],
    });
    const loc = block(resolveBlocks({ ...base, project: { ...base.project, blocks } }), 'location') as {
      access: { place: string }[];
    };
    expect(loc.access.map((a) => a.place)).toEqual(['Dari editor']);
  });

  it('alamat diambil dari brief.location.address, jatuh ke project.location kalau kosong', () => {
    const withAddress = fixture({
      location: { area: 'Kelapa Gading', district: 'Kelapa Gading', city: 'Jakarta Utara', province: 'DKI Jakarta', address: 'Jl. Boulevard Raya 14240' },
    });
    const a = block(resolveBlocks(withAddress), 'location') as { address: string };
    expect(a.address).toBe('Jl. Boulevard Raya 14240');

    const b = block(resolveBlocks(fixture()), 'location') as { address: string };
    expect(b.address).toBe('Kelapa Gading, Jakarta Utara');
  });

  it('fasilitas dari brief membawa keterangannya', () => {
    const input = fixture({
      facilities: [{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna', mediaIds: [] }],
    }, { aiContent: noisyAi });
    const f = block(resolveBlocks(input), 'facilities') as { items: { name: string; desc: string }[] };
    expect(f.items).toEqual([{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' }]);
  });

  it('promo dari brief mengisi daftar dan menyusun catatan dengan masa berlaku', () => {
    const input = fixture({
      promo: {
        name: 'Free BPHTB',
        items: ['Free BPHTB dan AJB', 'Cashback 5%'],
        detail: 'Selama unit tersedia.',
        validUntil: '2026-09-30',
        dpText: '10%',
        installmentText: 'Rp 18 jt/bln',
      },
    }, { aiContent: noisyAi });
    const p = block(resolveBlocks(input), 'pricePromo') as {
      promos: string[]; note: string; dpText: string; installmentText: string;
    };
    expect(p.promos).toEqual(['Free BPHTB dan AJB', 'Cashback 5%']);
    expect(p.dpText).toBe('10%');
    expect(p.installmentText).toBe('Rp 18 jt/bln');
    expect(p.note).toBe('Selama unit tersedia. · Berlaku sampai 30 September 2026');
  });
});

describe('COPY — AI di atas brief', () => {
  it('keunggulan dari AI mengalahkan keunggulan mentah agen', () => {
    const input = fixture({ highlights: ['bebas banjir'] }, { aiContent: noisyAi });
    const h = block(resolveBlocks(input), 'highlights') as { items: { title: string }[] };
    expect(h.items.map((i) => i.title)).toEqual(['USP dari AI']);
  });

  it('tanpa AI, keunggulan mentah agen tetap tampil — jaring pengaman kalau AI gagal', () => {
    const input = fixture({ highlights: ['bebas banjir', 'one gate system'] });
    const h = block(resolveBlocks(input), 'highlights') as { items: { title: string }[] };
    expect(h.items.map((i) => i.title)).toEqual(['bebas banjir', 'one gate system']);
  });

  it('subjudul hero memakai ai.subheadline saat override kosong', () => {
    const h = block(resolveBlocks(fixture({}, { aiContent: noisyAi })), 'hero') as { subtitle: string };
    expect(h.subtitle).toBe('Subjudul dari AI');
  });

  it('pesan WhatsApp memakai ai.cta.whatsappMessage', () => {
    const c = block(resolveBlocks(fixture({}, { aiContent: noisyAi })), 'agentCta') as { defaultMessage: string };
    expect(c.defaultMessage).toBe('Pesan WA dari AI');
  });
});

describe('seed Parkspring — render dari brief IDENTIK dengan render lama dari props', () => {
  const seedInput = () => {
    const store = seedStore();
    return {
      project: store.projects[0],
      houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
      media: [],
      agent: store.agentProfiles[0],
    };
  };

  it('kartu akses tetap enam butir dengan teks yang sama persis', () => {
    const loc = block(resolveBlocks(seedInput()), 'location') as {
      address: string; access: { time: string; place: string }[];
    };
    expect(loc.address).toBe('Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240');
    expect(loc.access).toEqual([
      { time: '3 mnt', place: 'Gerbang Tol Kelapa Gading' },
      { time: '8 mnt', place: 'Mall Kelapa Gading' },
      { time: '10 mnt', place: 'LRT Boulevard Utara' },
      { time: '12 mnt', place: 'RS Mitra Keluarga' },
      { time: '15 mnt', place: 'Sekolah & universitas' },
      { time: '35 mnt', place: 'Bandara Soekarno-Hatta' },
    ]);
  });

  it('fasilitas tetap enam butir beserta keterangannya', () => {
    const f = block(resolveBlocks(seedInput()), 'facilities') as { items: { name: string; desc: string }[] };
    expect(f.items).toEqual([
      { name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' },
      { name: 'Swimming Pool', desc: 'Kolam 25 m & kolam anak' },
      { name: 'Taman Tematik', desc: 'Empat taman tropis' },
      { name: 'Jogging Track', desc: 'Lintasan 800 meter' },
      { name: 'Playground', desc: 'Dua titik area anak' },
      { name: 'One Gate System', desc: 'Security 24 jam & CCTV' },
    ]);
  });

  it('promo tetap empat butir dengan DP, cicilan, dan catatan yang sama', () => {
    const p = block(resolveBlocks(seedInput()), 'pricePromo') as {
      promos: string[]; dpText: string; installmentText: string; note: string;
    };
    expect(p.dpText).toBe('10%');
    expect(p.installmentText).toBe('Rp 18 jt/bln');
    expect(p.promos).toEqual([
      'Free BPHTB dan AJB',
      'Cashback 5% untuk pembelian tunai bertahap',
      'Free smart door lock dan CCTV',
      'Free biaya balik nama sertifikat',
    ]);
    expect(p.note).toBe('Promo berlaku untuk pemesanan bulan ini, selama unit tersedia.');
  });

  it('fakta itu benar-benar PINDAH — bukan disalin, supaya rantai brief teruji', () => {
    const blocks = seedStore().projects[0].blocks;
    const locProps = blocks.find((b) => b.type === 'location')!.props as Record<string, unknown>;
    const facProps = blocks.find((b) => b.type === 'facilities')!.props as Record<string, unknown>;
    const promoProps = blocks.find((b) => b.type === 'pricePromo')!.props as Record<string, unknown>;
    expect(locProps.access).toBeUndefined();
    expect(locProps.address).toBeUndefined();
    expect(facProps.items).toBeUndefined();
    expect(promoProps.promos).toBeUndefined();
  });
});

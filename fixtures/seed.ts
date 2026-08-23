import { defaultBlocksForTheme } from '@/lib/landing/blocks';
import type { Block, BlockType } from '@/lib/landing/blocks';
import { DEFAULT_THEME, THEME_DEFAULT_PALETTE } from '@/lib/landing/themeNames';
import type { StoreShape } from '@/lib/data/types';

export const SEED_USER_ID = 'usr_audi';
const NOW = '2026-08-10T09:00:00.000Z';

/** Menyalin blok bawaan tema lalu menambal props blok tertentu dengan konten seed. */
function withContent(patches: Partial<Record<BlockType, Record<string, unknown>>>): Block[] {
  return defaultBlocksForTheme(DEFAULT_THEME).map((b) =>
    patches[b.type] ? ({ ...b, props: { ...b.props, ...patches[b.type] } } as Block) : b,
  );
}

const project = (
  id: string, name: string, slug: string, location: string, developer: string,
  description: string, facilities: string[], status: 'draft' | 'published', updatedAt: string,
  blocks: Block[] = defaultBlocksForTheme(DEFAULT_THEME),
) => ({
  id, userId: SEED_USER_ID, name, slug, location, developer, description, facilities,
  // Palet DITURUNKAN dari tema, tidak ditulis ulang: pasangan tema x palet yang
  // tidak cocok membuat sebagian teks tak terlihat (bug-037).
  status, theme: DEFAULT_THEME, palette: THEME_DEFAULT_PALETTE[DEFAULT_THEME], blocks,
  seo: {}, aiContent: null,
  createdAt: NOW, updatedAt, publishedAt: status === 'published' ? updatedAt : null,
});

/**
 * Konten 14 blok untuk Parkspring — disalin dari `design/project/10 Tropis
 * Hangat.dc.html` (renderVals). Kesepuluh file desain memakai proyek yang sama
 * dan hanya berbeda gaya visual; file 10 dipakai sebagai SATU-SATUNYA sumber
 * copy supaya kesepuluh tema bisa dibandingkan tanpa variabel isi.
 * Testimoni & harga/promo tidak pernah diisi AI, jadi hanya hidup kalau di-seed
 * di sini.
 */
const PARKSPRING_BLOCKS = withContent({
  hero: {
    title: 'Hunian tropis di lokasi strategis',
    subtitle: 'Desain modern, fasilitas lengkap, dan akses mudah ke berbagai pusat aktivitas.',
    badges: ['Lokasi strategis', 'Dekat tol', 'DP ringan', 'Free BPHTB'],
  },
  highlights: {
    items: [
      { title: 'Lokasi strategis', desc: 'Koridor Boulevard Kelapa Gading dengan akses dua arah.' },
      { title: 'Developer terpercaya', desc: '28 tahun pengalaman dan 40 kawasan yang sudah serah terima.' },
      { title: 'Desain tropis modern', desc: 'Ventilasi silang, teritisan lebar, dan taman privat tiap unit.' },
      { title: 'Fasilitas lengkap', desc: 'Clubhouse, kolam renang, dan jogging track di dalam kawasan.' },
      { title: 'Potensi investasi', desc: 'Kenaikan harga rata-rata 11% per tahun di kawasan sekitar.' },
      { title: 'Legalitas jelas', desc: 'SHM per unit, PBG lengkap, dan bebas sengketa.' },
    ],
  },
  location: {
    address: 'Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240',
    access: [
      { time: '3 mnt', place: 'Gerbang Tol Kelapa Gading' },
      { time: '8 mnt', place: 'Mall Kelapa Gading' },
      { time: '10 mnt', place: 'LRT Boulevard Utara' },
      { time: '12 mnt', place: 'RS Mitra Keluarga' },
      { time: '15 mnt', place: 'Sekolah & universitas' },
      { time: '35 mnt', place: 'Bandara Soekarno-Hatta' },
    ],
  },
  facilities: {
    items: [
      { name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' },
      { name: 'Swimming Pool', desc: 'Kolam 25 m & kolam anak' },
      { name: 'Taman Tematik', desc: 'Empat taman tropis' },
      { name: 'Jogging Track', desc: 'Lintasan 800 meter' },
      { name: 'Playground', desc: 'Dua titik area anak' },
      { name: 'One Gate System', desc: 'Security 24 jam & CCTV' },
    ],
  },
  gallery: {
    captions: [
      'Fasade Type Villa', 'Ruang keluarga', 'Clubhouse & kolam',
      'Taman tematik', 'Show unit Type Grand',
    ],
  },
  floorPlans: {
    legend: ['Cluster Villa', 'Cluster Medea', 'Cluster Grand', 'Fasilitas & taman'],
  },
  pricePromo: {
    dpText: '10%',
    installmentText: 'Rp 18 jt/bln',
    promos: [
      'Free BPHTB dan AJB',
      'Cashback 5% untuk pembelian tunai bertahap',
      'Free smart door lock dan CCTV',
      'Free biaya balik nama sertifikat',
    ],
    note: 'Promo berlaku untuk pemesanan bulan ini, selama unit tersedia.',
  },
  developer: {
    about:
      'Sejak 1998 membangun kawasan hunian di Jabodetabek dengan legalitas SHM dan PBG lengkap pada setiap unit.',
    stats: [
      { value: '28', label: 'Tahun' },
      { value: '40+', label: 'Kawasan' },
      { value: '12.000', label: 'Unit' },
    ],
  },
  testimonials: {
    items: [
      { quote: 'Rumahnya adem, ventilasinya bagus, jarang pakai AC di siang hari.', name: 'Andreas Halim', unit: 'Pemilik Type Villa' },
      { quote: 'Kami pilih karena dekat sekolah anak dan akses tol.', name: 'Ratna Kusuma', unit: 'Pemilik Type Medea' },
    ],
  },
  faq: {
    items: [
      { q: 'Berapa harga unit di Parkspring?', a: 'Tipe Medea mulai Rp 2,6 miliar, Villa Rp 3,2 miliar, dan Grand Rp 4,5 miliar.' },
      { q: 'Apakah bisa KPR?', a: 'Bisa, dengan lima bank rekanan dan pendampingan penuh dari tim marketing.' },
      { q: 'Berapa DP yang harus disiapkan?', a: 'DP mulai 10% dan dapat dicicil hingga 12 kali tanpa bunga.' },
      { q: 'Apa saja fasilitasnya?', a: 'Clubhouse, kolam renang, gym, jogging track, playground, dan one gate system.' },
      { q: 'Bagaimana legalitasnya?', a: 'Seluruh unit bersertifikat SHM dengan PBG dan izin kawasan yang sudah terbit.' },
      { q: 'Apakah bisa survey lokasi?', a: 'Bisa setiap hari pukul 09.00–17.00 WIB lewat janji temu dengan marketing.' },
    ],
  },
});

const houseType = (
  id: string, projectId: string, name: string, slug: string, price: number,
  landArea: number, buildingArea: number, bedrooms: number, bathrooms: number,
  carport: number, sortOrder: number,
) => ({
  id, projectId, name, slug, price, landArea, buildingArea, bedrooms, bathrooms, carport,
  status: 'published' as const, aiContent: null, sortOrder, createdAt: NOW, updatedAt: NOW,
});

const lead = (
  id: string, houseTypeId: string | null, name: string, phone: string, message: string,
  source: 'form' | 'whatsapp', status: 'new' | 'contacted' | 'interested' | 'negotiation' | 'deal' | 'lost',
  createdAt: string,
) => ({
  id, projectId: 'prj_parkspring', houseTypeId, name, phone, email: null,
  message, source, status, createdAt,
});

export function seedStore(): StoreShape {
  return {
    agentProfiles: [
      {
        id: 'agp_audi',
        userId: SEED_USER_ID,
        fullName: 'Audi',
        email: 'audi@listingku.app',
        whatsapp: '081288994410',
        siteName: 'Audi Property',
        subdomain: 'audi',
        theme: 'Modern',
        logoUrl: null,
        colorScheme: 'Oranye',
        about: 'Agen properti untuk kawasan Gading Serpong dan sekitarnya. Fokus pada cluster baru dan unit ready stock.',
        stats: { closings: 64, listings: 18, years: 7 },
        specialistArea: 'Gading Serpong',
        services: ['Jual', 'Sewa', 'Konsultasi'],
        isPublished: true,
        notifyOnLead: true,
      },
    ],
    projects: [
      project(
        'prj_parkspring', 'Parkspring', 'parkspring-gading',
        'Kelapa Gading, Jakarta Utara', 'Parkspring Land',
        'Kawasan hunian tropis 8,4 hektar di koridor Boulevard Kelapa Gading. Tiga tipe rumah dengan clubhouse, kolam renang, jogging track, dan one gate system.',
        ['Clubhouse', 'Swimming Pool', 'Taman Tematik', 'Jogging Track', 'Playground', 'One Gate System'],
        'published', '2026-08-10T09:00:00.000Z',
        PARKSPRING_BLOCKS,
      ),
      project(
        'prj_casaverde', 'Casa Verde Alam Sutera', 'casa-verde-alam-sutera',
        'Alam Sutera, Tangerang', 'Alam Sutera Realty',
        'Dua tipe hunian di kawasan matang dengan akses tol langsung.',
        ['Taman', 'Clubhouse'], 'draft', '2026-08-07T09:00:00.000Z',
      ),
      project(
        'prj_bintaro', 'Bintaro Loop Residence', 'bintaro-loop-residence',
        'Bintaro, Tangerang Selatan', 'Jaya Real Property',
        'Empat tipe unit dengan akses langsung ke stasiun dan pusat kuliner Bintaro.',
        ['Security 24 jam', 'Masjid', 'Taman'], 'published', '2026-08-02T09:00:00.000Z',
      ),
    ],
    houseTypes: [
      houseType('hts_villa', 'prj_parkspring', 'Villa', 'villa', 3_200_000_000, 90, 120, 3, 3, 2, 0),
      houseType('hts_medea', 'prj_parkspring', 'Medea', 'medea', 2_600_000_000, 72, 96, 3, 2, 1, 1),
      houseType('hts_grand', 'prj_parkspring', 'Grand', 'grand', 4_500_000_000, 120, 165, 4, 4, 2, 2),
      houseType('hts_verde_a', 'prj_casaverde', 'Verde A', 'verde-a', 1_850_000_000, 72, 96, 3, 2, 1, 0),
      houseType('hts_verde_b', 'prj_casaverde', 'Verde B', 'verde-b', 2_250_000_000, 90, 120, 3, 2, 1, 1),
      houseType('hts_loop_s', 'prj_bintaro', 'Loop S', 'loop-s', 1_450_000_000, 60, 75, 2, 1, 1, 0),
      houseType('hts_loop_m', 'prj_bintaro', 'Loop M', 'loop-m', 1_950_000_000, 78, 105, 3, 2, 1, 1),
      houseType('hts_loop_l', 'prj_bintaro', 'Loop L', 'loop-l', 2_650_000_000, 105, 140, 4, 3, 2, 2),
      houseType('hts_loop_xl', 'prj_bintaro', 'Loop XL', 'loop-xl', 3_400_000_000, 128, 175, 4, 3, 2, 3),
    ],
    media: [],
    // Lima lead dari layar `leads` di file design. Telepon disimpan dalam bentuk
    // kanonik 62 (sama seperti tulisan submitLeadAction), bukan gaya tampilan —
    // formatPhoneDisplay yang mengembalikannya ke "0813-2244-9087" saat dirender.
    leads: [
      lead('led_rina', 'hts_medea', 'Rina Wijaya', '6281322449087',
        'Tipe Medea masih ada unit hadap timur?', 'form', 'new', '2026-08-10T09:12:00.000Z'),
      lead('led_hendra', null, 'Hendra S.', '6281277813390',
        'Minta price list semua tipe.', 'whatsapp', 'contacted', '2026-08-09T20:44:00.000Z'),
      lead('led_melisa', 'hts_grand', 'Melisa Tanuwijaya', '6285799031128',
        'Bisa survey akhir pekan ini?', 'form', 'interested', '2026-08-09T15:03:00.000Z'),
      lead('led_bayu', 'hts_villa', 'Bayu Prakoso', '6281944102277',
        'KPR bank apa saja yang kerja sama?', 'form', 'negotiation', '2026-08-08T11:20:00.000Z'),
      lead('led_dewi', 'hts_villa', 'Dewi Anggraini', '6287833210092',
        'Sudah deal unit Villa 12/8.', 'whatsapp', 'deal', '2026-08-06T17:55:00.000Z'),
    ],
    events: [
      { id: 'evt_1', projectId: 'prj_parkspring', houseTypeId: null, type: 'visitor', date: '2026-08-10', count: 1420 },
      { id: 'evt_2', projectId: 'prj_parkspring', houseTypeId: null, type: 'whatsapp_click', date: '2026-08-10', count: 96 },
      { id: 'evt_3', projectId: 'prj_parkspring', houseTypeId: null, type: 'form_submit', date: '2026-08-10', count: 19 },
      { id: 'evt_4', projectId: 'prj_bintaro', houseTypeId: null, type: 'visitor', date: '2026-08-02', count: 422 },
      { id: 'evt_5', projectId: 'prj_bintaro', houseTypeId: null, type: 'form_submit', date: '2026-08-02', count: 8 },
    ],
    aiUsage: [],
  };
}

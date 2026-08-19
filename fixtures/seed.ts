import { defaultBlocks } from '@/lib/landing/blocks';
import type { StoreShape } from '@/lib/data/types';

export const SEED_USER_ID = 'usr_audi';
const NOW = '2026-08-10T09:00:00.000Z';

const project = (
  id: string, name: string, slug: string, location: string, developer: string,
  description: string, facilities: string[], status: 'draft' | 'published', updatedAt: string,
) => ({
  id, userId: SEED_USER_ID, name, slug, location, developer, description, facilities,
  status, theme: 'modern' as const, blocks: defaultBlocks(), seo: {}, aiContent: null,
  createdAt: NOW, updatedAt, publishedAt: status === 'published' ? updatedAt : null,
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
        'prj_parkspring', 'Parkspring Gading', 'parkspring-gading',
        'Gading Serpong, Tangerang', 'Paramount Land',
        'Cluster baru dengan tiga tipe unit, akses lima menit ke Gading Serpong CBD. Fasilitas kolam renang, jogging track, dan security 24 jam.',
        ['Kolam renang', 'Security 24 jam', 'Jogging track'], 'published', '2026-08-10T09:00:00.000Z',
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
      houseType('hts_villa', 'prj_parkspring', 'Villa', 'villa', 2_450_000_000, 90, 120, 3, 2, 1, 0),
      houseType('hts_midea', 'prj_parkspring', 'Midea', 'midea', 3_100_000_000, 112, 145, 4, 3, 2, 1),
      houseType('hts_grand', 'prj_parkspring', 'Grand', 'grand', 4_600_000_000, 150, 210, 4, 3, 2, 2),
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
      lead('led_rina', 'hts_midea', 'Rina Wijaya', '6281322449087',
        'Tipe Midea masih ada unit hadap timur?', 'form', 'new', '2026-08-10T09:12:00.000Z'),
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

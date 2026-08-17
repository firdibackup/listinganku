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
        services: ['Jual', 'Sewa', 'Konsultasi'],
        isPublished: true,
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
    leads: [],
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

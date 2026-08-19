import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { AVAILABLE_THEMES, THEMES } from '@/lib/landing/themes';
import type { ThemeName } from '@/lib/data/types';
import type { ResolvedBlock } from '@/lib/landing/resolve';

const blocks: ResolvedBlock[] = [
  {
    id: 'b1', type: 'hero', projectId: 'p1', title: 'Parkspring Gading', subtitle: 'Gading Serpong',
    image: null, badges: [], priceFrom: null, waNumber: '0812', defaultMessage: 'Halo',
  },
  {
    id: 'b2', type: 'houseTypes',
    houseTypes: [{
      id: 'h1', name: 'Villa', slug: 'villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
      bedrooms: 3, bathrooms: 2, carport: 1, shortDescription: '', sellingPoints: [],
      photos: [], primaryPhoto: null, floorPlan: null,
    }],
  },
  { id: 'b3', type: 'facilities', items: ['Kolam renang'] },
];

describe('BlockRenderer', () => {
  it('merender satu section per blok, sesuai urutannya', () => {
    const { container } = render(<BlockRenderer blocks={blocks} theme="tropicalWarm" />);
    expect(container.querySelectorAll('section')).toHaveLength(3);
  });

  it('menempatkan judul hero sebagai satu-satunya h1', () => {
    render(<BlockRenderer blocks={blocks} theme="tropicalWarm" />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Parkspring Gading');
  });

  it('memformat harga tipe rumah dengan konvensi Indonesia', () => {
    render(<BlockRenderer blocks={blocks} theme="tropicalWarm" />);
    expect(screen.getAllByText('Rp 2,45 M').length).toBeGreaterThanOrEqual(1);
  });

  it('memberi anchor per tipe rumah untuk deep link dari iklan', () => {
    const { container } = render(<BlockRenderer blocks={blocks} theme="tropicalWarm" />);
    expect(container.querySelector('#villa')).toBeTruthy();
  });

  it('mendaftarkan kesepuluh tema; yang bisa dipilih bertambah saat layoutnya dibangun', () => {
    expect(Object.keys(THEMES)).toHaveLength(10);
    expect(AVAILABLE_THEMES).toEqual([
      'tropicalWarm', 'premiumDark', 'editorialWhite', 'softLuxury', 'boldRetail',
    ]);
  });

  it('setiap tema mengimplementasi keempat belas blok', () => {
    for (const name of Object.keys(THEMES) as ThemeName[]) {
      expect(Object.keys(THEMES[name].components).sort()).toEqual([
        'agentCta', 'contactForm', 'developer', 'facilities', 'faq', 'floorPlans',
        'gallery', 'hero', 'highlights', 'houseTypes', 'location', 'pricePromo',
        'specs', 'testimonials',
      ]);
    }
  });

  it('tema yang belum dibangun tetap punya entri agar picker tidak meledak', () => {
    expect(THEMES.editorialWhite.label).toBe('Editorial Putih');
  });

  it('editorialWhite merender tipe unit sebagai daftar (semua tipe), bukan bertab', () => {
    const twoTypes: ResolvedBlock[] = [
      {
        id: 'ht', type: 'houseTypes',
        houseTypes: [
          {
            id: 'h1', name: 'Villa', slug: 'villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
            bedrooms: 3, bathrooms: 2, carport: 1, shortDescription: '', sellingPoints: [], photos: [], primaryPhoto: null, floorPlan: null,
          },
          {
            id: 'h2', name: 'Midea', slug: 'midea', price: 3_100_000_000, landArea: 112, buildingArea: 145,
            bedrooms: 4, bathrooms: 3, carport: 2, shortDescription: '', sellingPoints: [], photos: [], primaryPhoto: null, floorPlan: null,
          },
        ],
      },
    ];
    const { container } = render(<BlockRenderer blocks={twoTypes} theme="editorialWhite" />);
    expect(container.querySelector('.lp-x-unitlist')).toBeTruthy();
    // Daftar merender KEDUA tipe (varian tabs hanya merender yang aktif).
    expect(screen.getByText('Tipe Villa')).toBeInTheDocument();
    expect(screen.getByText('Tipe Midea')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { AVAILABLE_THEMES, THEMES } from '@/lib/landing/themes';
import type { ResolvedBlock } from '@/lib/landing/resolve';

const blocks: ResolvedBlock[] = [
  { id: 'b1', type: 'hero', title: 'Parkspring Gading', subtitle: 'Gading Serpong', image: null },
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
    const { container } = render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(container.querySelectorAll('section')).toHaveLength(3);
  });

  it('menempatkan judul hero sebagai satu-satunya h1', () => {
    render(<BlockRenderer blocks={blocks} theme="modern" />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Parkspring Gading');
  });

  it('memformat harga tipe rumah dengan konvensi Indonesia', () => {
    render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(screen.getByText('Rp 2,45 M')).toBeInTheDocument();
  });

  it('memberi anchor per tipe rumah untuk deep link dari iklan', () => {
    const { container } = render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(container.querySelector('#villa')).toBeTruthy();
  });

  it('memetakan ketiga nama tema ke set komponen, tapi baru satu yang tersedia', () => {
    expect(Object.keys(THEMES).sort()).toEqual(['luxury', 'modern', 'showcase']);
    expect(AVAILABLE_THEMES).toEqual(['modern']);
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/app/(public)/[slug]/actions', () => ({
  submitLeadAction: vi.fn(),
}));

import { ContactForm } from '@/components/landing/ContactForm';
import type { ResolvedHouseType } from '@/lib/landing/resolve';

function houseType(id: string, name: string): ResolvedHouseType {
  return {
    id, name, slug: name.toLowerCase(), price: 1, landArea: 1, buildingArea: 1,
    bedrooms: 1, bathrooms: 1, carport: 1, shortDescription: '', sellingPoints: [],
    photos: [], primaryPhoto: null, floorPlan: null,
  };
}

describe('ContactForm — pertanyaan tipe rumah', () => {
  it('tidak menampilkan pilihan tipe rumah saat project belum punya tipe rumah sama sekali', () => {
    render(<ContactForm projectId="prj_x" houseTypes={[]} askHouseType />);
    expect(screen.queryByText('Tipe yang diminati')).not.toBeInTheDocument();
  });

  it('menampilkan pilihan tipe rumah saat project punya tipe rumah dan askHouseType true', () => {
    render(<ContactForm projectId="prj_x" houseTypes={[houseType('h1', 'Villa')]} askHouseType />);
    expect(screen.getByText('Tipe yang diminati')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument();
  });

  it('tidak menampilkan pilihan tipe rumah saat askHouseType false meski project punya tipe rumah', () => {
    render(<ContactForm projectId="prj_x" houseTypes={[houseType('h1', 'Villa')]} askHouseType={false} />);
    expect(screen.queryByText('Tipe yang diminati')).not.toBeInTheDocument();
  });

  it('field wajib punya label yang terhubung ke input (aksesibilitas)', () => {
    render(<ContactForm projectId="prj_x" houseTypes={[]} askHouseType />);
    expect(screen.getByLabelText('Nama')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nomor WhatsApp/)).toBeInTheDocument();
    expect(screen.getByLabelText('Pesan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim pesan' })).toBeEnabled();
  });
});

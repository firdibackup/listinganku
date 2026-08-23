import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionPlanner } from '@/components/wizard/SectionPlanner';
import { defaultBlocksForTheme } from '@/lib/landing/blocks';
import { emptyBrief } from '@/lib/data/types';

const props = (over: Partial<React.ComponentProps<typeof SectionPlanner>> = {}) => ({
  blocks: defaultBlocksForTheme('tropicalWarm'),
  brief: emptyBrief(),
  projectType: 'perumahan' as const,
  onToggle: vi.fn(),
  onUsePreset: vi.fn(),
  onNote: vi.fn(),
  ...over,
});

describe('SectionPlanner', () => {
  it('menampilkan satu baris per section dengan label yang manusiawi', () => {
    render(<SectionPlanner {...props()} />);
    expect(screen.getByRole('checkbox', { name: 'Fasilitas' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Harga & Promo' })).toBeInTheDocument();
  });

  it('SEMUA panel terkuncup saat pertama dibuka — progressive disclosure', () => {
    render(<SectionPlanner {...props()} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('mengklik baris membuka panelnya, mengklik lagi menutupnya', async () => {
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ panelFor: (t) => (t === 'facilities' ? <p>Panel fasilitas</p> : null) })} />);
    await user.click(screen.getByRole('button', { name: /Buka materi Fasilitas/i }));
    expect(screen.getByText('Panel fasilitas')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Tutup materi Fasilitas/i }));
    expect(screen.queryByText('Panel fasilitas')).not.toBeInTheDocument();
  });

  it('checkbox memanggil onToggle dengan id blok, bukan tipenya', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onToggle })} />);
    await user.click(screen.getByRole('checkbox', { name: 'FAQ' }));
    expect(onToggle).toHaveBeenCalledWith('blk_faq');
  });

  it('"Gunakan rekomendasi" memanggil onUsePreset', async () => {
    const onUsePreset = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onUsePreset })} />);
    await user.click(screen.getByRole('button', { name: 'Gunakan rekomendasi' }));
    expect(onUsePreset).toHaveBeenCalled();
  });

  it('section tanpa panel khusus tetap punya satu baris catatan bebas', async () => {
    const onNote = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onNote })} />);
    await user.click(screen.getByRole('button', { name: /Buka materi Galeri/i }));
    await user.type(screen.getByLabelText(/Catatan untuk Galeri/i), 'lima foto drone');
    expect(onNote.mock.calls.at(-1)?.[0]).toBe('gallery');
  });

  it('meringkas materi yang sudah dimiliki agen', () => {
    const brief = {
      ...emptyBrief(),
      nearby: [{ category: 'tol' as const, name: 'Tol', minutes: 5 }],
      highlights: ['Bebas banjir'],
      facilities: [{ name: 'Clubhouse', desc: '', mediaIds: [] }],
      location: { area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kab. Tangerang', province: 'Banten', address: '' },
    };
    render(<SectionPlanner {...props({ brief })} />);
    expect(screen.getByText(/1 tempat terdekat/)).toBeInTheDocument();
    expect(screen.getByText(/1 keunggulan/)).toBeInTheDocument();
    expect(screen.getByText(/1 fasilitas/)).toBeInTheDocument();
    expect(screen.getByText(/Foto diunggah di halaman project/)).toBeInTheDocument();
  });
});

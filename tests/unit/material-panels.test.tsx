import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyBrief } from '@/lib/data/types';
import { HeroPanel } from '@/components/wizard/panels/HeroPanel';
import { HighlightsPanel } from '@/components/wizard/panels/HighlightsPanel';
import { FacilitiesPanel } from '@/components/wizard/panels/FacilitiesPanel';
import { LocationPanel } from '@/components/wizard/panels/LocationPanel';
import { PromoPanel } from '@/components/wizard/panels/PromoPanel';

describe('HeroPanel', () => {
  it('memilih penekanan hero', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HeroPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Promo' }));
    expect(onChange).toHaveBeenCalledWith({ heroEmphasis: 'promo' });
  });

  it('tujuan CTA bisa lebih dari satu', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HeroPanel brief={{ ...emptyBrief(), ctaGoals: ['whatsapp'] }} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Lihat tipe unit' }));
    expect(onChange).toHaveBeenCalledWith({ ctaGoals: ['whatsapp', 'lihatTipe'] });
  });
});

describe('HighlightsPanel', () => {
  it('menambah baris keunggulan kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HighlightsPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah keunggulan' }));
    expect(onChange).toHaveBeenCalledWith({ highlights: [''] });
  });

  it('menghapus baris pada indeksnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HighlightsPanel brief={{ ...emptyBrief(), highlights: ['A', 'B'] }} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Hapus keunggulan 1' }));
    expect(onChange).toHaveBeenCalledWith({ highlights: ['B'] });
  });
});

describe('FacilitiesPanel', () => {
  it('chip preset menambah fasilitas bernama', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FacilitiesPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Kolam renang' }));
    expect(onChange).toHaveBeenCalledWith({
      facilities: [{ name: 'Kolam renang', desc: '', mediaIds: [] }],
    });
  });

  it('chip yang sudah aktif melepas fasilitasnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FacilitiesPanel
        brief={{ ...emptyBrief(), facilities: [{ name: 'Kolam renang', desc: '', mediaIds: [] }] }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Kolam renang' }));
    expect(onChange).toHaveBeenCalledWith({ facilities: [] });
  });

  it('menambah fasilitas custom di luar daftar preset', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FacilitiesPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah fasilitas' }));
    expect(onChange).toHaveBeenCalledWith({ facilities: [{ name: '', desc: '', mediaIds: [] }] });
  });
});

describe('LocationPanel', () => {
  it('menambah baris nearby dengan menit kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LocationPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah tempat terdekat' }));
    expect(onChange).toHaveBeenCalledWith({ nearby: [{ category: 'tol', name: '', minutes: null }] });
  });

  it('menit yang dikosongkan disimpan sebagai null, BUKAN nol', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <LocationPanel
        brief={{ ...emptyBrief(), nearby: [{ category: 'tol', name: 'Tol', minutes: 5 }] }}
        onChange={onChange}
      />,
    );
    await user.clear(screen.getByLabelText('Menit 1'));
    expect(onChange).toHaveBeenCalledWith({ nearby: [{ category: 'tol', name: 'Tol', minutes: null }] });
  });

  it('memberi tahu bahwa tempat tanpa menit tidak jadi kartu akses', () => {
    render(
      <LocationPanel
        brief={{ ...emptyBrief(), nearby: [{ category: 'sekolah', name: 'Sekolah', minutes: null }] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/tidak tampil sebagai kartu akses/i)).toBeInTheDocument();
  });
});

describe('PromoPanel', () => {
  it('mencentang "Ada promo" membuat objek promo kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PromoPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ada promo' }));
    expect(onChange).toHaveBeenCalledWith({
      promo: { name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' },
    });
  });

  it('melepas centang membuang promo sepenuhnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromoPanel
        brief={{ ...emptyBrief(), promo: { name: 'X', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' } }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Ada promo' }));
    expect(onChange).toHaveBeenCalledWith({ promo: null });
  });

  it('butir promo dipisah per baris', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromoPanel
        brief={{ ...emptyBrief(), promo: { name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' } }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Butir promo'), 'Free BPHTB');
    expect(onChange.mock.calls.at(-1)?.[0].promo.items).toEqual(['Free BPHTB']);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyBrief } from '@/lib/data/types';
import type { ProjectBrief } from '@/lib/data/types';
import { HeroPanel } from '@/components/wizard/panels/HeroPanel';
import { HighlightsPanel } from '@/components/wizard/panels/HighlightsPanel';
import { FacilitiesPanel } from '@/components/wizard/panels/FacilitiesPanel';
import { LocationPanel } from '@/components/wizard/panels/LocationPanel';
import { PromoPanel } from '@/components/wizard/panels/PromoPanel';

/**
 * `PromoPanel` sepenuhnya controlled dari `brief` milik parent. Merender
 * langsung dengan `onChange={vi.fn()}` TIDAK menutup lingkaran state — value
 * textarea selamanya sama dengan snapshot awal, jadi ketikan multi-karakter
 * tidak pernah benar-benar terakumulasi di DOM (lihat riwayat bug-042: fix
 * pertama salah didiagnosis sebagai "harus uncontrolled" gara-gara tes tanpa
 * harness ini). Harness ini menutup lingkaran state sungguhan sama seperti
 * `CreateProjectWizard.setBrief` melakukannya di produksi.
 */
function PromoHarness({ onPatch }: { onPatch?: (patch: Partial<ProjectBrief>) => void }) {
  const [brief, setBrief] = useState<ProjectBrief>({
    ...emptyBrief(),
    promo: { name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' },
  });
  return (
    <PromoPanel
      brief={brief}
      onChange={(patch) => {
        onPatch?.(patch);
        setBrief((b) => ({ ...b, ...patch }));
      }}
    />
  );
}

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
    const patches: Partial<ProjectBrief>[] = [];
    const user = userEvent.setup();
    render(<PromoHarness onPatch={(patch) => patches.push(patch)} />);
    const textarea = screen.getByLabelText('Butir promo');
    await user.type(textarea, 'Free BPHTB{Enter}Cashback 5%');

    // Hasil yang TERLIHAT di layar harus persis apa yang diketik (dua kata,
    // dua baris). Kalau komponen menyapu balik DOM sebelum keystroke fisik
    // berikutnya tiba, teks yang tersisa akan lebih pendek/tercampur dari
    // yang diketik — persis gejala bug-042 sebelum harness ini ada.
    expect(textarea).toHaveValue('Free BPHTB\nCashback 5%');

    // Dan ketikan itu harus benar-benar DIPECAH jadi dua butir array, bukan
    // satu string berisi newline literal (yang, kalau split() dibuang,
    // masih akan me-reconstruct tampilan yang SAMA lewat join('\n') tapi
    // dengan bentuk data yang salah — assert toHaveValue saja tidak cukup
    // untuk menangkap itu).
    const last = patches.at(-1);
    expect(last?.promo?.items).toEqual(['Free BPHTB', 'Cashback 5%']);
  });
});

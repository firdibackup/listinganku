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

/**
 * Harness ber-state sungguhan, pola yang sama dengan PromoHarness di atas —
 * dibutuhkan untuk mengetes ketikan multi-karakter di baris terkontrol
 * (lihat komentar PromoHarness untuk alasannya).
 */
function HighlightsHarness({ initial }: { initial: string[] }) {
  const [brief, setBrief] = useState<ProjectBrief>({ ...emptyBrief(), highlights: initial });
  return (
    <HighlightsPanel
      brief={brief}
      onChange={(patch) => setBrief((b) => ({ ...b, ...patch }))}
    />
  );
}

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

  it('mengetik baris kosong tidak tersapu sebelum blur', async () => {
    const user = userEvent.setup();
    render(<HighlightsHarness initial={['']} />);
    const input = screen.getByLabelText('Keunggulan 1');
    await user.type(input, 'Bebas banjir');
    // Kalau filter jalan di tiap keystroke (bukan onBlur), input akan
    // ter-reset paksa oleh React begitu prop value-nya tersapu balik ke ''
    // sebelum keystroke fisik berikutnya tiba — persis gejala bug-042.
    expect(input).toHaveValue('Bebas banjir');
  });

  it('baris yang ditinggalkan kosong disaring begitu field-nya blur, baris terisi tidak tersentuh', async () => {
    const user = userEvent.setup();
    render(<HighlightsHarness initial={['Sudah terisi', '']} />);
    expect(screen.getByLabelText('Keunggulan 1')).toHaveValue('Sudah terisi');

    await user.click(screen.getByLabelText('Keunggulan 2'));
    await user.tab(); // blur tanpa mengetik apa pun — persis skenario "Tambah lalu tinggalkan"

    expect(screen.queryByLabelText('Keunggulan 2')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Keunggulan 1')).toHaveValue('Sudah terisi');
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

  it('mengetik nama fasilitas tidak tersapu sebelum blur', async () => {
    function Harness() {
      const [brief, setBrief] = useState<ProjectBrief>({
        ...emptyBrief(), facilities: [{ name: '', desc: '', mediaIds: [] }],
      });
      return <FacilitiesPanel brief={brief} onChange={(p) => setBrief((b) => ({ ...b, ...p }))} />;
    }
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Nama fasilitas 1');
    await user.type(input, 'Kolam renang');
    expect(input).toHaveValue('Kolam renang');
  });

  it('baris custom tanpa nama disaring begitu field-nya blur, meski keterangan sudah diisi', async () => {
    function Harness() {
      const [brief, setBrief] = useState<ProjectBrief>({
        ...emptyBrief(),
        facilities: [
          { name: 'Kolam renang', desc: '', mediaIds: [] },
          { name: '', desc: 'Keterangan tanpa nama', mediaIds: [] },
        ],
      });
      return <FacilitiesPanel brief={brief} onChange={(p) => setBrief((b) => ({ ...b, ...p }))} />;
    }
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Nama fasilitas 2'));
    await user.tab(); // blur tanpa mengetik apa pun

    expect(screen.queryByLabelText('Nama fasilitas 2')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nama fasilitas 1')).toHaveValue('Kolam renang');
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

  it('mengetik nama tempat tidak tersapu sebelum blur', async () => {
    function Harness() {
      const [brief, setBrief] = useState<ProjectBrief>({
        ...emptyBrief(), nearby: [{ category: 'tol', name: '', minutes: null }],
      });
      return <LocationPanel brief={brief} onChange={(p) => setBrief((b) => ({ ...b, ...p }))} />;
    }
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Nama tempat 1');
    await user.type(input, 'Tol Jakarta–Merak');
    expect(input).toHaveValue('Tol Jakarta–Merak');
  });

  it('baris tanpa nama tempat disaring begitu field-nya blur, baris terisi tidak tersentuh', async () => {
    function Harness() {
      const [brief, setBrief] = useState<ProjectBrief>({
        ...emptyBrief(),
        nearby: [
          { category: 'tol', name: 'Tol Jakarta–Merak', minutes: 5 },
          { category: 'sekolah', name: '', minutes: null },
        ],
      });
      return <LocationPanel brief={brief} onChange={(p) => setBrief((b) => ({ ...b, ...p }))} />;
    }
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Nama tempat 2'));
    await user.tab(); // blur tanpa mengetik apa pun

    expect(screen.queryByLabelText('Nama tempat 2')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nama tempat 1')).toHaveValue('Tol Jakarta–Merak');
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

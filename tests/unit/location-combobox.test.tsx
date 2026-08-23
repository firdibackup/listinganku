import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationCombobox } from '@/components/wizard/LocationCombobox';

const HITS = [
  { district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' },
  { district: 'Serpong', city: 'Tangerang Selatan', province: 'Banten' },
];

function mockFetch(results = HITS) {
  const fn = vi.fn(async () => new Response(JSON.stringify({ results }), { status: 200 }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('LocationCombobox', () => {
  it('memakai pola ARIA combobox', () => {
    mockFetch();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: /Cari kota atau kecamatan/i }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('menampilkan saran setelah mengetik dan membuka listbox', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    expect(await screen.findByText('Kelapa Dua')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('tidak memanggil endpoint untuk kueri di bawah dua huruf', async () => {
    const fn = mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'k');
    await new Promise((r) => setTimeout(r, 350));
    expect(fn).not.toHaveBeenCalled();
  });

  it('memanggil onSelect dan menutup listbox saat saran diklik', async () => {
    mockFetch();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={onSelect} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await user.click(await screen.findByText('Serpong'));
    expect(onSelect).toHaveBeenCalledWith(HITS[1]);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('panah bawah lalu Enter memilih saran tanpa memindahkan fokus dari input', async () => {
    mockFetch();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'serpong');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(HITS[0]);
    expect(input).toHaveFocus();
  });

  it('Escape menutup listbox', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('menampilkan lokasi terpilih sebagai ringkasan', () => {
    mockFetch();
    render(
      <LocationCombobox
        value={{ area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten', address: '' }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Kelapa Dua, Kabupaten Tangerang, Banten')).toBeInTheDocument();
  });
});

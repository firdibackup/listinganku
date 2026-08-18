import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const recordEventActionMock = vi.fn();
vi.mock('@/app/(public)/[slug]/actions', () => ({
  recordEventAction: (...args: unknown[]) => recordEventActionMock(...args),
}));

import { WhatsAppLink, toWaHref } from '@/components/landing/WhatsAppLink';

describe('toWaHref — normalisasi nomor Indonesia yang dipakai wa.me', () => {
  it('nomor berawalan 0 dikonversi ke 62', () => {
    expect(toWaHref('081322449087', 'Halo')).toBe('https://wa.me/6281322449087?text=Halo');
  });

  it('nomor sudah berawalan 62 dibiarkan apa adanya', () => {
    expect(toWaHref('6281322449087', 'Halo')).toBe('https://wa.me/6281322449087?text=Halo');
  });

  it('nomor berawalan +62 disamakan dengan yang berawalan 62 (tanpa +)', () => {
    expect(toWaHref('+6281322449087', 'Halo')).toBe('https://wa.me/6281322449087?text=Halo');
  });

  it('spasi dan tanda hubung di tengah nomor dibuang', () => {
    expect(toWaHref('62 8132-2449-087', 'Halo')).toBe('https://wa.me/6281322449087?text=Halo');
  });

  it('pesan di-encode dengan benar', () => {
    const href = toWaHref('081322449087', 'Halo, saya tertarik dengan Parkspring Gading.');
    expect(href).toBe(
      `https://wa.me/6281322449087?text=${encodeURIComponent('Halo, saya tertarik dengan Parkspring Gading.')}`,
    );
  });

  it('nomor kosong tidak melempar — tetap menghasilkan URL wa.me yang well-formed', () => {
    expect(() => toWaHref('', 'Halo')).not.toThrow();
    expect(toWaHref('', 'Halo')).toBe('https://wa.me/?text=Halo');
  });
});

describe('WhatsAppLink', () => {
  beforeEach(() => {
    recordEventActionMock.mockClear();
  });

  it('href mengarah ke wa.me dengan nomor dan pesan yang diberikan, membuka tab baru dengan aman', () => {
    render(
      <WhatsAppLink projectId="prj_x" waNumber="081322449087" message="Halo Audi">
        Chat WhatsApp
      </WhatsAppLink>,
    );
    const link = screen.getByRole('link', { name: 'Chat WhatsApp' });
    expect(link).toHaveAttribute('href', 'https://wa.me/6281322449087?text=Halo%20Audi');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('mencatat event whatsapp_click dengan projectId yang benar saat diklik', () => {
    render(
      <WhatsAppLink projectId="prj_parkspring" waNumber="081322449087" message="Halo">
        Chat WhatsApp
      </WhatsAppLink>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Chat WhatsApp' }));
    expect(recordEventActionMock).toHaveBeenCalledWith('prj_parkspring', 'whatsapp_click');
  });
});

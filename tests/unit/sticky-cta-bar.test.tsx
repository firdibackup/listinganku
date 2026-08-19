import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// StickyCtaBar merender WhatsAppLink, yang memanggil recordEventAction (Server
// Action, menyentuh db/node:fs). Di jsdom action itu dimock — perilaku klik
// WhatsApp sendiri sudah dikunci di whatsapp-link.test.tsx, jadi di sini yang
// diuji hanya susunan bar-nya.
vi.mock('@/app/(public)/[slug]/actions', () => ({
  recordEventAction: vi.fn(),
}));

import { StickyCtaBar } from '@/components/landing/StickyCtaBar';

describe('StickyCtaBar', () => {
  it('memakai kelas lp__stickybar yang media query mobile-nya sudah ada di landing.css', () => {
    const { container } = render(
      <StickyCtaBar projectId="prj_parkspring" waNumber="081288994410" message="Halo" />,
    );
    expect(container.querySelector('.lp__stickybar')).toBeTruthy();
  });

  it('tombol WhatsApp mengarah ke wa.me dengan nomor ternormalisasi dan pesan awal', () => {
    render(<StickyCtaBar projectId="prj_parkspring" waNumber="081288994410" message="Halo Audi" />);
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/6281288994410?text=Halo%20Audi',
    );
  });

  it('tombol Minta info menunjuk anchor #minta-info, bukan tautan mati', () => {
    render(<StickyCtaBar projectId="prj_parkspring" waNumber="081288994410" message="Halo" />);
    expect(screen.getByRole('link', { name: 'Minta info' })).toHaveAttribute('href', '#minta-info');
  });
});

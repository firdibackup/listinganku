'use client';

import { WhatsAppLink } from './WhatsAppLink';

/**
 * Dua aksi utama landing yang ikut ke mana pun pengunjung menggulir di layar
 * kecil. Kelas .lp__stickybar (lib/landing/landing.css) yang menentukan kapan
 * ia muncul: display:none di desktop, display:grid di bawah 900px — jadi tidak
 * ada logika viewport di JS yang bisa berbeda dari CSS-nya.
 *
 * Tombol kedua menuju anchor #minta-info milik blok form kontak, bukan membuka
 * dialog sendiri: formnya sudah ada di halaman, dan melompat ke sana menjaga
 * satu jalur lead saja.
 */
export function StickyCtaBar({
  projectId, waNumber, message,
}: {
  projectId: string;
  waNumber: string;
  message: string;
}) {
  return (
    <div className="lp__stickybar">
      <WhatsAppLink
        projectId={projectId} waNumber={waNumber} message={message}
        className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block"
      >
        WhatsApp
      </WhatsAppLink>
      <a href="#minta-info" className="ds-btn ds-btn--primary ds-btn--sm ds-btn--block">Minta info</a>
    </div>
  );
}

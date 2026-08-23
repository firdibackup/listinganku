'use client';

import { WhatsAppLink } from './WhatsAppLink';

/**
 * Dua aksi utama landing yang ikut ke mana pun pengunjung menggulir. Sejak
 * landing jadi mobile-only, bar ini SELALU tampil dan dikunci ke lebar bingkai
 * 390px, bukan ke lebar viewport (lib/landing/landing.css).
 *
 * Warnanya dari token --lp-* milik palet aktif supaya bar ini ikut tema; kelas
 * tombol dashboard dulu membuatnya tampak asing di atas tema gelap.
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
        className="lp__sticky-btn lp__sticky-btn--wa"
      >
        WhatsApp
      </WhatsAppLink>
      <a href="#minta-info" className="lp__sticky-btn lp__sticky-btn--info">Minta info</a>
    </div>
  );
}

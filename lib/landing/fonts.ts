import { DM_Serif_Display, DM_Sans } from 'next/font/google';

/**
 * next/font tidak bisa dipanggil kondisional — semua pasangan font tema
 * dideklarasikan di scope modul di sini. Hanya kelas `.variable` milik tema
 * terpilih yang dipasang ke root landing, dan @font-face yang tidak terpakai
 * tidak memicu unduhan. Saat 9 tema lain masuk (slice 2B-2J), tambahkan
 * deklarasinya di file ini dan tidak di tempat lain.
 */
const dmSerif = DM_Serif_Display({
  subsets: ['latin'], weight: ['400'], variable: '--font-dm-serif', display: 'swap',
});
const dmSans = DM_Sans({
  subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-dm-sans', display: 'swap',
});

export const THEME_FONTS = {
  tropicalWarm: {
    className: `${dmSerif.variable} ${dmSans.variable}`,
    display: 'var(--font-dm-serif), Georgia, "Times New Roman", serif',
    text: 'var(--font-dm-sans), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
} as const;

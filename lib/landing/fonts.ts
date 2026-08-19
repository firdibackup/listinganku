import { DM_Serif_Display, DM_Sans, Cormorant_Garamond, Jost } from 'next/font/google';

/**
 * next/font tidak bisa dipanggil kondisional — semua pasangan font tema
 * dideklarasikan di scope modul di sini. Hanya kelas `.variable` milik tema
 * terpilih yang dipasang ke root landing, dan @font-face yang tidak terpakai
 * tidak memicu unduhan. Saat menambah tema, tambahkan deklarasi fontnya di file
 * ini dan tidak di tempat lain (dan tambahkan nama ekspornya ke tests/mocks/next-font.ts).
 */
const dmSerif = DM_Serif_Display({
  subsets: ['latin'], weight: ['400'], variable: '--font-dm-serif', display: 'swap',
});
const dmSans = DM_Sans({
  subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-dm-sans', display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-cormorant', display: 'swap',
});
const jost = Jost({
  subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost', display: 'swap',
});

export type ThemeFontDecl = { className: string; display: string; text: string };

export const THEME_FONTS: Record<string, ThemeFontDecl> = {
  tropicalWarm: {
    className: `${dmSerif.variable} ${dmSans.variable}`,
    display: 'var(--font-dm-serif), Georgia, "Times New Roman", serif',
    text: 'var(--font-dm-sans), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  premiumDark: {
    className: `${cormorant.variable} ${jost.variable}`,
    display: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
    text: 'var(--font-jost), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};

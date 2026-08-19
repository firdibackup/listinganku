import {
  DM_Serif_Display, DM_Sans, Cormorant_Garamond, Jost, Instrument_Serif, IBM_Plex_Sans,
  Marcellus, Karla, Anton, Figtree,
} from 'next/font/google';

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
const instrument = Instrument_Serif({
  subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap',
});
const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-ibm-plex', display: 'swap',
});
const marcellus = Marcellus({
  subsets: ['latin'], weight: ['400'], variable: '--font-marcellus', display: 'swap',
});
const karla = Karla({
  subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-karla', display: 'swap',
});
const anton = Anton({
  subsets: ['latin'], weight: ['400'], variable: '--font-anton', display: 'swap',
});
const figtree = Figtree({
  subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-figtree', display: 'swap',
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
  editorialWhite: {
    className: `${instrument.variable} ${ibmPlex.variable}`,
    display: 'var(--font-instrument), Georgia, "Times New Roman", serif',
    text: 'var(--font-ibm-plex), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  softLuxury: {
    className: `${marcellus.variable} ${karla.variable}`,
    display: 'var(--font-marcellus), Georgia, "Times New Roman", serif',
    text: 'var(--font-karla), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  boldRetail: {
    className: `${anton.variable} ${figtree.variable}`,
    display: 'var(--font-anton), "Arial Black", system-ui, sans-serif',
    text: 'var(--font-figtree), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};

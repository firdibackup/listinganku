import {
  DM_Serif_Display, DM_Sans, Cormorant_Garamond, Jost, Instrument_Serif, IBM_Plex_Sans,
  Marcellus, Karla, Anton, Figtree,
  Playfair_Display, Lato, Fredoka, Outfit, Archivo, Archivo_Narrow, Space_Grotesk, Lora, Nunito_Sans,
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
const playfair = Playfair_Display({
  subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap',
});
const lato = Lato({
  subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-lato', display: 'swap',
});
const fredoka = Fredoka({
  subsets: ['latin'], weight: ['500', '600'], variable: '--font-fredoka', display: 'swap',
});
const outfit = Outfit({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-outfit', display: 'swap',
});
const archivo = Archivo({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-archivo', display: 'swap',
});
const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'], weight: ['400', '600'], variable: '--font-archivo-narrow', display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space-grotesk', display: 'swap',
});
const lora = Lora({
  subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-lora', display: 'swap',
});
const nunitoSans = Nunito_Sans({
  subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-nunito-sans', display: 'swap',
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
  classicNavy: {
    className: `${playfair.variable} ${lato.variable}`,
    display: 'var(--font-playfair), Georgia, "Times New Roman", serif',
    text: 'var(--font-lato), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  playfulPastel: {
    className: `${fredoka.variable} ${outfit.variable}`,
    display: 'var(--font-fredoka), "Trebuchet MS", system-ui, sans-serif',
    text: 'var(--font-outfit), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  corporateBlue: {
    className: `${archivoNarrow.variable} ${archivo.variable}`,
    display: 'var(--font-archivo-narrow), "Arial Narrow", system-ui, sans-serif',
    text: 'var(--font-archivo), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  architectural: {
    className: `${spaceGrotesk.variable}`,
    display: 'var(--font-space-grotesk), system-ui, sans-serif',
    text: 'var(--font-space-grotesk), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  natureCalm: {
    className: `${lora.variable} ${nunitoSans.variable}`,
    display: 'var(--font-lora), Georgia, "Times New Roman", serif',
    text: 'var(--font-nunito-sans), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};

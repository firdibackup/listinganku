import type { CSSProperties } from 'react';

export const LP_TOKENS = [
  'bg', 'surface', 'line',
  'ink', 'ink-soft', 'ink-faint',
  'accent', 'on-accent', 'accent-soft',
  'contrast', 'on-contrast', 'on-contrast-soft', 'contrast-accent',
  'feature', 'on-feature', 'on-feature-soft',
  'footer', 'on-footer',
  'ph-a', 'ph-b',
] as const;

export type LpToken = (typeof LP_TOKENS)[number];
export type Palette = Record<LpToken, string>;

export type PaletteName =
  | 'premiumDark' | 'editorialWhite' | 'corporateBlue' | 'softLuxury' | 'boldRetail'
  | 'architectural' | 'natureCalm' | 'classicNavy' | 'playfulPastel' | 'tropicalWarm';

export const PALETTE_NAMES: PaletteName[] = [
  'premiumDark', 'editorialWhite', 'corporateBlue', 'softLuxury', 'boldRetail',
  'architectural', 'natureCalm', 'classicNavy', 'playfulPastel', 'tropicalWarm',
];

export const PALETTE_LABELS: Record<PaletteName, string> = {
  premiumDark: 'Premium Gelap',
  editorialWhite: 'Editorial Putih',
  corporateBlue: 'Korporat Biru',
  softLuxury: 'Soft Luxury Beige',
  boldRetail: 'Bold Retail',
  architectural: 'Arsitektural Beton',
  natureCalm: 'Nature Calm',
  classicNavy: 'Klasik Navy',
  playfulPastel: 'Playful Pastel',
  tropicalWarm: 'Tropis Hangat',
};

export const PALETTES: Record<PaletteName, Palette> = {
  premiumDark: {
    bg: '#0b0c0d', surface: '#101214', line: '#1c1e20',
    ink: '#e8e6e1', 'ink-soft': '#a5a19b', 'ink-faint': '#8b8781',
    accent: '#c9a227', 'on-accent': '#0b0c0d', 'accent-soft': '#6b5410',
    contrast: '#141210', 'on-contrast': '#e8e6e1', 'on-contrast-soft': '#a5a19b', 'contrast-accent': '#c9a227',
    feature: '#17191b', 'on-feature': '#e8e6e1', 'on-feature-soft': '#a5a19b',
    footer: '#08090a', 'on-footer': '#a5a19b',
    'ph-a': '#17191b', 'ph-b': '#131517',
  },
  editorialWhite: {
    bg: '#fbfaf7', surface: '#f2f0ea', line: '#e3e0d9',
    ink: '#17181a', 'ink-soft': '#4a4844', 'ink-faint': '#67645f',
    accent: '#1b4d3e', 'on-accent': '#fbfaf7', 'accent-soft': '#c8d6cd',
    contrast: '#17181a', 'on-contrast': '#fbfaf7', 'on-contrast-soft': '#c2beb7', 'contrast-accent': '#c8d6cd',
    feature: '#17181a', 'on-feature': '#fbfaf7', 'on-feature-soft': '#c2beb7',
    footer: '#f2f0ea', 'on-footer': '#4a4844',
    'ph-a': '#eae7e0', 'ph-b': '#e2ded6',
  },
  corporateBlue: {
    bg: '#ffffff', surface: '#f4f7fa', line: '#e2e8ef',
    ink: '#122031', 'ink-soft': '#5d6b7d', 'ink-faint': '#6b7a8c',
    accent: '#0f3d6e', 'on-accent': '#ffffff', 'accent-soft': '#c5d8ea',
    contrast: '#122031', 'on-contrast': '#ffffff', 'on-contrast-soft': '#b6c5d5', 'contrast-accent': '#8fb2d4',
    feature: '#0f3d6e', 'on-feature': '#ffffff', 'on-feature-soft': '#c5d8ea',
    footer: '#0b1725', 'on-footer': '#a9bccf',
    'ph-a': '#e7edf3', 'ph-b': '#dfe6ee',
  },
  softLuxury: {
    bg: '#f6f1e9', surface: '#ffffff', line: '#e0d6c6',
    ink: '#2f2a24', 'ink-soft': '#6b6157', 'ink-faint': '#7d7266',
    accent: '#8a6b45', 'on-accent': '#ffffff', 'accent-soft': '#efe0cb',
    contrast: '#2f2a24', 'on-contrast': '#f6f1e9', 'on-contrast-soft': '#b9a88f', 'contrast-accent': '#d8b98a',
    feature: '#efe7db', 'on-feature': '#2f2a24', 'on-feature-soft': '#6b6157',
    footer: '#efe7db', 'on-footer': '#6b6157',
    'ph-a': '#e6dccd', 'ph-b': '#ded3c2',
  },
  boldRetail: {
    bg: '#fdfcf7', surface: '#ffffff', line: '#111111',
    ink: '#111111', 'ink-soft': '#4b4842', 'ink-faint': '#5d5a54',
    accent: '#ffd400', 'on-accent': '#111111', 'accent-soft': '#6b5a00',
    contrast: '#111111', 'on-contrast': '#fdfcf7', 'on-contrast-soft': '#a8a59c', 'contrast-accent': '#ffd400',
    feature: '#ff6a13', 'on-feature': '#111111', 'on-feature-soft': '#4a1f00',
    footer: '#111111', 'on-footer': '#a8a59c',
    'ph-a': '#eeece4', 'ph-b': '#e5e2d9',
  },
  architectural: {
    bg: '#d9d7d2', surface: '#cfcdc8', line: '#b6b4af',
    ink: '#1a1a18', 'ink-soft': '#4a4844', 'ink-faint': '#5c5a55',
    accent: '#1a1a18', 'on-accent': '#d9d7d2', 'accent-soft': '#8c8a85',
    contrast: '#1a1a18', 'on-contrast': '#d9d7d2', 'on-contrast-soft': '#8c8a85', 'contrast-accent': '#d9d7d2',
    feature: '#c9c7c2', 'on-feature': '#1a1a18', 'on-feature-soft': '#4a4844',
    footer: '#c9c7c2', 'on-footer': '#4a4844',
    'ph-a': '#c4c2bd', 'ph-b': '#bcbab5',
  },
  natureCalm: {
    bg: '#f4f2e9', surface: '#e9ece0', line: '#cbd3c3',
    ink: '#2c3128', 'ink-soft': '#5c6357', 'ink-faint': '#6b7365',
    accent: '#4a6047', 'on-accent': '#f4f2e9', 'accent-soft': '#c9d4c5',
    contrast: '#4a6047', 'on-contrast': '#f4f2e9', 'on-contrast-soft': '#c9d4c5', 'contrast-accent': '#f4f2e9',
    feature: '#4a6047', 'on-feature': '#f4f2e9', 'on-feature-soft': '#c9d4c5',
    footer: '#3d5039', 'on-footer': '#b8c5b4',
    'ph-a': '#dfe3d5', 'ph-b': '#d7dbcd',
  },
  classicNavy: {
    bg: '#fdfcfa', surface: '#f4f1ea', line: '#e6e2da',
    ink: '#12233f', 'ink-soft': '#5a5750', 'ink-faint': '#6e6a60',
    accent: '#8a6b2e', 'on-accent': '#fdfcfa', 'accent-soft': '#e8d9bc',
    contrast: '#12233f', 'on-contrast': '#fdfcfa', 'on-contrast-soft': '#adbecf', 'contrast-accent': '#c8a15a',
    feature: '#f4f1ea', 'on-feature': '#12233f', 'on-feature-soft': '#5a5750',
    footer: '#0d1b2f', 'on-footer': '#adbecf',
    'ph-a': '#eae5db', 'ph-b': '#e2ddd2',
  },
  playfulPastel: {
    bg: '#fbfaff', surface: '#f0eef9', line: '#ddd8f2',
    ink: '#241f3d', 'ink-soft': '#5c5580', 'ink-faint': '#6b6392',
    accent: '#4a3fa8', 'on-accent': '#ffffff', 'accent-soft': '#cdc7f5',
    contrast: '#241f3d', 'on-contrast': '#ffffff', 'on-contrast-soft': '#b6afe0', 'contrast-accent': '#ffd9e8',
    feature: '#e6e1fb', 'on-feature': '#241f3d', 'on-feature-soft': '#5c5580',
    footer: '#f0eef9', 'on-footer': '#5c5580',
    'ph-a': '#d5cef5', 'ph-b': '#cdc5f0',
  },
  tropicalWarm: {
    bg: '#faf3ea', surface: '#efe4d8', line: '#e5d8c8',
    ink: '#2b2119', 'ink-soft': '#6b5c4d', 'ink-faint': '#7d6e5e',
    // on-accent = '#ffffff', bukan '#faf3ea' seperti di file desain. Krem di atas
    // terracotta #b4552f hanya 4,46:1 — gagal AA (sama seperti penyimpangan
    // softLuxury['on-accent'] yang sudah dicatat). Putih penuh = 4,90:1.
    accent: '#b4552f', 'on-accent': '#ffffff', 'accent-soft': '#f7ded0',
    contrast: '#2b2119', 'on-contrast': '#faf3ea', 'on-contrast-soft': '#b1a08d', 'contrast-accent': '#e8a26f',
    feature: '#1b4d3e', 'on-feature': '#faf3ea', 'on-feature-soft': '#9fbfae',
    footer: '#211a13', 'on-footer': '#9a8875',
    'ph-a': '#e2d3c1', 'ph-b': '#dacbb8',
  },
};

/**
 * Palet dikirim sebagai custom property di root landing, bukan sebagai
 * stylesheet berisi kesepuluh palet. Dua alasan: hanya palet AKTIF yang ikut ke
 * HTML (~600 byte, bukan ~4 KB), dan tidak ada duplikasi nilai antara TS dan CSS
 * yang bisa hanyut terpisah. Anak-anaknya tetap memakai kelas CSS biasa dengan
 * media query dan :hover — inline style hanya di satu elemen root.
 */
export function paletteStyle(name: PaletteName): CSSProperties {
  const p = PALETTES[name] ?? PALETTES.tropicalWarm;
  return Object.fromEntries(LP_TOKENS.map((t) => [`--lp-${t}`, p[t]])) as CSSProperties;
}

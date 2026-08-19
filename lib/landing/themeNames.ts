import type { PaletteName } from './palettes';

export type ThemeName =
  | 'premiumDark' | 'editorialWhite' | 'corporateBlue' | 'softLuxury' | 'boldRetail'
  | 'architectural' | 'natureCalm' | 'classicNavy' | 'playfulPastel' | 'tropicalWarm';

export const THEME_NAMES: ThemeName[] = [
  'premiumDark', 'editorialWhite', 'corporateBlue', 'softLuxury', 'boldRetail',
  'architectural', 'natureCalm', 'classicNavy', 'playfulPastel', 'tropicalWarm',
];

export const DEFAULT_THEME: ThemeName = 'tropicalWarm';

export const THEME_LABELS: Record<ThemeName, string> = {
  premiumDark: 'Premium Gelap', editorialWhite: 'Editorial Putih', corporateBlue: 'Korporat Biru',
  softLuxury: 'Soft Luxury Beige', boldRetail: 'Bold Retail', architectural: 'Arsitektural Beton',
  natureCalm: 'Nature Calm', classicNavy: 'Klasik Navy', playfulPastel: 'Playful Pastel',
  tropicalWarm: 'Tropis Hangat',
};

/**
 * Peta datar, BUKAN diambil dari THEMES. Lapisan data (mock/store.ts)
 * memakainya, dan mengimpor THEMES ke sana akan menarik komponen React
 * ke dalam lapisan data.
 */
export const THEME_DEFAULT_PALETTE: Record<ThemeName, PaletteName> = {
  premiumDark: 'premiumDark', editorialWhite: 'editorialWhite', corporateBlue: 'corporateBlue',
  softLuxury: 'softLuxury', boldRetail: 'boldRetail', architectural: 'architectural',
  natureCalm: 'natureCalm', classicNavy: 'classicNavy', playfulPastel: 'playfulPastel',
  tropicalWarm: 'tropicalWarm',
};

const LEGACY: Record<string, ThemeName> = {
  modern: 'tropicalWarm', showcase: 'tropicalWarm', luxury: 'tropicalWarm',
};

/**
 * BUKAN pemetaan menyeluruh. Nilai yang sudah sah dilewatkan apa adanya —
 * begitu editorialWhite dibangun di slice 2B, project yang memilihnya harus
 * tetap memilikinya.
 */
export function normalizeTheme(raw: unknown): ThemeName {
  if (typeof raw !== 'string') return DEFAULT_THEME;
  if ((THEME_NAMES as string[]).includes(raw)) return raw as ThemeName;
  return LEGACY[raw] ?? DEFAULT_THEME;
}

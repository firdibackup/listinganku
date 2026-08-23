import type { CSSProperties } from 'react';

/**
 * KONTRAK PERAN TOKEN — dibaca sebelum menyentuh nilai apa pun di bawah.
 *
 * Setiap token LATAR punya token TULISAN pasangannya. Tema hanya boleh memakai
 * pasangan itu; memasang tulisan lain di atas sebuah latar adalah cara warna
 * jadi tidak semantik (mis. `background: feature` + `color: accent` menghasilkan
 * kontras 1:1 di palet yang accent-nya sama dengan feature).
 *
 *   bg, surface, ph-a, ph-b  -> ink (kuat) | ink-soft (sedang) | ink-faint (paling redup)
 *   accent                   -> on-accent
 *   accent-soft              -> on-accent-soft
 *   contrast                 -> on-contrast | on-contrast-soft | contrast-accent
 *   feature                  -> on-feature | on-feature-soft
 *   footer                   -> on-footer
 *
 * Dua token yang BUKAN latar:
 *   accent-ink  warna aksen yang aman dipakai sebagai TULISAN di atas bg/surface.
 *               Untuk enam palet nilainya sama persis dengan `accent`; yang beda
 *               hanya palet ber-aksen terang (boldRetail kuning) dan yang aksennya
 *               nyaris tidak lolos (softLuxury, classicNavy, tropicalWarm).
 *               JANGAN memakai `accent` sebagai warna teks di atas bg/surface.
 *   backdrop    panggung di luar bingkai 390px pada layar lebar. Diambil dari
 *               keluarga warna paletnya sendiri — dulu `color-mix(bg 52%, #0e1013)`
 *               yang menghasilkan lumpur abu di semua palet terang (bug-035).
 *
 * INVARIAN yang dijaga tests/unit/palette-contrast.test.ts:
 *   1. Tiap pasangan latar/tulisan di atas >= 4.5:1 di KESEPULUH palet.
 *   2. ink-soft selalu lebih kontras daripada ink-faint (hierarki tetap terbaca).
 *   3. Tiap deklarasi di lib/landing/themes/(nama)/theme.css yang menyetel
 *      background DAN color sekaligus harus memakai pasangan yang sah.
 * Nilai hex di bawah DITURUNKAN untuk memenuhi invarian itu, bukan dikira-kira.
 */
export const LP_TOKENS = [
  'bg', 'surface', 'line', 'backdrop',
  'ink', 'ink-soft', 'ink-faint',
  'accent', 'on-accent', 'accent-ink', 'accent-soft', 'on-accent-soft',
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
    bg: '#0b0c0d', surface: '#101214', line: '#1c1e20', backdrop: '#050505',
    ink: '#e8e6e1', 'ink-soft': '#a5a19b', 'ink-faint': '#8b8781',
    accent: '#c9a227', 'on-accent': '#0b0c0d', 'accent-ink': '#c9a227',
    'accent-soft': '#6b5410', 'on-accent-soft': '#e1cb86',
    contrast: '#141210', 'on-contrast': '#e8e6e1', 'on-contrast-soft': '#a5a19b', 'contrast-accent': '#c9a227',
    feature: '#17191b', 'on-feature': '#e8e6e1', 'on-feature-soft': '#a5a19b',
    footer: '#08090a', 'on-footer': '#a5a19b',
    'ph-a': '#17191b', 'ph-b': '#131517',
  },
  editorialWhite: {
    bg: '#fbfaf7', surface: '#f2f0ea', line: '#e3e0d9', backdrop: '#cbc8c1',
    ink: '#17181a', 'ink-soft': '#4a4844', 'ink-faint': '#65625d',
    accent: '#1b4d3e', 'on-accent': '#fbfaf7', 'accent-ink': '#1b4d3e',
    'accent-soft': '#c8d6cd', 'on-accent-soft': '#1b4d3e',
    contrast: '#17181a', 'on-contrast': '#fbfaf7', 'on-contrast-soft': '#c2beb7', 'contrast-accent': '#c8d6cd',
    feature: '#17181a', 'on-feature': '#fbfaf7', 'on-feature-soft': '#c2beb7',
    footer: '#f2f0ea', 'on-footer': '#4a4844',
    'ph-a': '#eae7e0', 'ph-b': '#e2ded6',
  },
  corporateBlue: {
    bg: '#ffffff', surface: '#f4f7fa', line: '#e2e8ef', backdrop: '#c9cfd6',
    ink: '#122031', 'ink-soft': '#4b5765', 'ink-faint': '#5b6877',
    accent: '#0f3d6e', 'on-accent': '#ffffff', 'accent-ink': '#0f3d6e',
    'accent-soft': '#c5d8ea', 'on-accent-soft': '#0f3d6e',
    contrast: '#122031', 'on-contrast': '#ffffff', 'on-contrast-soft': '#b6c5d5', 'contrast-accent': '#8fb2d4',
    feature: '#0f3d6e', 'on-feature': '#ffffff', 'on-feature-soft': '#c5d8ea',
    footer: '#0b1725', 'on-footer': '#a9bccf',
    'ph-a': '#e7edf3', 'ph-b': '#dfe6ee',
  },
  softLuxury: {
    bg: '#f6f1e9', surface: '#ffffff', line: '#e0d6c6', backdrop: '#c8beaf',
    ink: '#2f2a24', 'ink-soft': '#514a42', 'ink-faint': '#635a51',
    // on-accent = '#ffffff' (bukan krem seperti di file desain) supaya teks
    // tombol di atas #8a6b45 lolos AA.
    accent: '#8a6b45', 'on-accent': '#ffffff', 'accent-ink': '#876944',
    'accent-soft': '#efe0cb', 'on-accent-soft': '#7a5e3d',
    contrast: '#2f2a24', 'on-contrast': '#f6f1e9', 'on-contrast-soft': '#b9a88f', 'contrast-accent': '#d8b98a',
    feature: '#efe7db', 'on-feature': '#2f2a24', 'on-feature-soft': '#514a42',
    footer: '#efe7db', 'on-footer': '#514a42',
    'ph-a': '#e6dccd', 'ph-b': '#ded3c2',
  },
  boldRetail: {
    bg: '#fdfcf7', surface: '#ffffff', line: '#111111', backdrop: '#cecbc3',
    ink: '#111111', 'ink-soft': '#4b4842', 'ink-faint': '#5d5a54',
    // Kuning #ffd400 adalah warna LATAR di tema ini, bukan warna tulisan: di
    // atas krem hanya 1,39:1. accent-ink memberi ambar gelap untuk teks.
    accent: '#ffd400', 'on-accent': '#111111', 'accent-ink': '#8a7200',
    'accent-soft': '#6b5a00', 'on-accent-soft': '#ffd400',
    contrast: '#111111', 'on-contrast': '#fdfcf7', 'on-contrast-soft': '#a8a59c', 'contrast-accent': '#ffd400',
    // Oranye digelapkan dari #ff6a13: tema memakainya juga sebagai ANGKA di
    // atas krem (nomor USP, harga unit, menit tempuh) dan di #ff6a13 itu cuma
    // 2,79:1 — gagal bahkan untuk teks besar. #f4620c = 3,10:1.
    feature: '#f4620c', 'on-feature': '#111111', 'on-feature-soft': '#3d1900',
    footer: '#111111', 'on-footer': '#a8a59c',
    'ph-a': '#eeece4', 'ph-b': '#e5e2d9',
  },
  architectural: {
    bg: '#d9d7d2', surface: '#cfcdc8', line: '#b6b4af', backdrop: '#a9a7a3',
    ink: '#1a1a18', 'ink-soft': '#3d3b38', 'ink-faint': '#4c4b47',
    accent: '#1a1a18', 'on-accent': '#d9d7d2', 'accent-ink': '#1a1a18',
    'accent-soft': '#8c8a85', 'on-accent-soft': '#1a1a18',
    contrast: '#1a1a18', 'on-contrast': '#d9d7d2', 'on-contrast-soft': '#c4c2bd', 'contrast-accent': '#d9d7d2',
    feature: '#c9c7c2', 'on-feature': '#1a1a18', 'on-feature-soft': '#3d3b38',
    footer: '#c9c7c2', 'on-footer': '#3d3b38',
    'ph-a': '#c4c2bd', 'ph-b': '#bcbab5',
  },
  natureCalm: {
    // Palet ini dulu menyetel accent = contrast = feature = '#4a6047'. Tema
    // natureCalm memakai `feature` sebagai KARTU SAGE PUCAT (priceband, kartu
    // stat, kartu FAQ, kartu form) lalu menulis di atasnya dengan `accent` —
    // hijau di atas hijau, kontras 1,00:1 di sembilan blok (bug-036). Sage pucat
    // #dfe3d5 dan ink #2c3128 keduanya nilai yang memang dipakai
    // `design/project/07 Nature Calm.dc.html`.
    bg: '#f4f2e9', surface: '#e9ece0', line: '#cbd3c3', backdrop: '#c2c5b9',
    ink: '#2c3128', 'ink-soft': '#4b5046', 'ink-faint': '#5a6155',
    accent: '#4a6047', 'on-accent': '#f4f2e9', 'accent-ink': '#4a6047',
    'accent-soft': '#c9d4c5', 'on-accent-soft': '#495f46',
    contrast: '#2c3128', 'on-contrast': '#f4f2e9', 'on-contrast-soft': '#b8c5b4', 'contrast-accent': '#b0c0ab',
    feature: '#dfe3d5', 'on-feature': '#2c3128', 'on-feature-soft': '#4b5046',
    footer: '#3d5039', 'on-footer': '#b8c5b4',
    'ph-a': '#dfe3d5', 'ph-b': '#d7dbcd',
  },
  classicNavy: {
    bg: '#fdfcfa', surface: '#f4f1ea', line: '#e6e2da', backdrop: '#cbc7bd',
    ink: '#12233f', 'ink-soft': '#54514a', 'ink-faint': '#656258',
    accent: '#8a6b2e', 'on-accent': '#fdfcfa', 'accent-ink': '#87692d',
    'accent-soft': '#e8d9bc', 'on-accent-soft': '#775c28',
    contrast: '#12233f', 'on-contrast': '#fdfcfa', 'on-contrast-soft': '#adbecf', 'contrast-accent': '#c8a15a',
    feature: '#f4f1ea', 'on-feature': '#12233f', 'on-feature-soft': '#54514a',
    footer: '#0d1b2f', 'on-footer': '#adbecf',
    'ph-a': '#eae5db', 'ph-b': '#e2ddd2',
  },
  playfulPastel: {
    bg: '#fbfaff', surface: '#f0eef9', line: '#ddd8f2', backdrop: '#b9b1d8',
    ink: '#241f3d', 'ink-soft': '#464161', 'ink-faint': '#575076',
    accent: '#4a3fa8', 'on-accent': '#ffffff', 'accent-ink': '#4a3fa8',
    'accent-soft': '#cdc7f5', 'on-accent-soft': '#4a3fa8',
    contrast: '#241f3d', 'on-contrast': '#ffffff', 'on-contrast-soft': '#b6afe0', 'contrast-accent': '#ffd9e8',
    feature: '#e6e1fb', 'on-feature': '#241f3d', 'on-feature-soft': '#464161',
    footer: '#f0eef9', 'on-footer': '#464161',
    'ph-a': '#d5cef5', 'ph-b': '#cdc5f0',
  },
  tropicalWarm: {
    bg: '#faf3ea', surface: '#efe4d8', line: '#e5d8c8', backdrop: '#c4b7a6',
    ink: '#2b2119', 'ink-soft': '#50453a', 'ink-faint': '#605548',
    // on-accent = '#ffffff', bukan '#faf3ea' seperti di file desain. Krem di atas
    // terracotta #b4552f hanya 4,46:1 — gagal AA (sama seperti penyimpangan
    // softLuxury['on-accent'] yang sudah dicatat). Putih penuh = 4,90:1.
    accent: '#b4552f', 'on-accent': '#ffffff', 'accent-ink': '#a44d2b',
    'accent-soft': '#f7ded0', 'on-accent-soft': '#a04c2a',
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

# Listingku Landing Slice 2A — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti tema landing `wireframe` dengan sistem tema sungguhan — 20 token palet × 10 palet yang bisa ditukar, 3 blok konten baru, dan satu tema penuh (**Tropis Hangat**) yang mobile-first dan responsive.

**Architecture:** Tiga lapis terpisah. **Konten** (`Block[]` → `resolveBlocks()` → `ResolvedBlock[]`) dibangun sekali dan dipakai semua tema. **Palet** adalah 20 CSS custom property yang dinamai menurut *peran* (bukan terang-gelap), dipasang sebagai `style` di root landing sehingga hanya palet aktif yang dikirim per halaman. **Layout** adalah komponen React per tema yang HANYA membaca `var(--lp-*)` — tidak pernah menulis nilai warna literal. Konsekuensinya 10 layout × 10 palet = 100 tampilan dari ~20 unit kerja.

**Tech Stack:** Next.js 15 App Router · React Server Components (+ `'use client'` hanya untuk 2 blok interaktif) · TypeScript · Tailwind v4 (hanya pipeline CSS; tema pakai CSS biasa) · `next/font/google` · Vitest + Testing Library · Playwright

**Spec:** `docs/superpowers/specs/2026-08-19-listingku-landing-tema-tropis-design.md`

---

## Global Constraints

Berlaku untuk SETIAP task. Tidak ada pengecualian.

- **Nol nilai warna literal di `lib/landing/themes/**`.** Setiap warna lewat `var(--lp-*)`. Ditegakkan tes Task 1 Step 5.
- **Palet dinamai per peran**, bukan terang-gelap. `--lp-contrast` bisa lebih terang dari `--lp-bg` di palet gelap; itu sah.
- **Tidak satu pun field blok baru diisi AI.** `AiContentSchema` tidak berubah di slice ini. Blok baru memakai `override ?? []`, bukan `pick(override, ai, fallback)`.
- **Blok kosong tidak dirender.** Komponen mengembalikan `null`, bukan section kosong berjudul.
- **Mobile-first.** Nilai dasar tanpa media query = tampilan 390px file desain. Desktop lewat `min-width`.
- **Jangan jalankan `npm run build` atau `npm run verify` selagi `next dev` hidup** — `.next` rusak (`Cannot find module './611.js'`) dan SELURUH e2e gagal timeout. Cek port 3000 dulu (`bug-023`).
- **`npm run seed:reset` WAJIB setelah mengubah `fixtures/seed.ts`.**
- **Jangan menulis asersi e2e bernilai absolut** (jumlah baris, angka metrik, keunikan nama). Suite serial (`workers:1`) di atas satu mock store bersama. Pakai `.first()`, baseline yang dibaca di tes itu sendiri, atau `toBeGreaterThanOrEqual` (`bug-024`). Semua perpindahan rute pakai `waitForURL(...)`; `expect.timeout` 15s.
- Perintah: `npm test` (vitest run) · `npm run test:e2e` · `npm run build` · `npm run verify` (ketiganya berurutan).
- Bahasa UI **Indonesia**, identifier kode **Inggris camelCase** — konvensi repo (`BlockType` Inggris, `BLOCK_LABELS` Indonesia).

---

## File Structure

| File | Tanggung jawab |
|---|---|
| `lib/landing/themeNames.ts` | **BARU** `ThemeName`, `normalizeTheme`, `THEME_DEFAULT_PALETTE` — tanpa impor apa pun (pemutus siklus) |
| `lib/landing/palettes.ts` | **BARU** `PaletteName`, `LpToken`, `PALETTES` (10×20), `PALETTE_LABELS`, `paletteStyle()` |
| `lib/landing/fonts.ts` | **BARU** deklarasi `next/font/google` per tema, scope modul |
| `lib/landing/blocks.ts` | +3 tipe blok, +`BLOCK_LABELS`, `defaultBlocks()` → `defaultBlocksForTheme()` |
| `lib/landing/resolve.ts` | +3 `case`, `location.access`, `floorPlans.masterplan`, `hero.badges/priceFrom/waNumber` |
| `lib/landing/themes/index.ts` | `Theme` object (label/order/fonts/defaultPalette/components/Chrome), `THEMES`, `AVAILABLE_THEMES` |
| `lib/landing/themes/tropicalWarm/*` | **BARU** 14 komponen blok + Header + Footer + `theme.css` |
| `lib/landing/themes/wireframe/*` | **DIHAPUS** |
| `lib/data/types.ts` | re-export `ThemeName`/`PaletteName`, +`Project.palette` |
| `lib/data/mock/store.ts` | `repairShape()` memperbaiki **baris**, bukan cuma tabel |
| `components/editor/PalettePicker.tsx` | **BARU** |
| `components/editor/BlockSettingsPanel.tsx` | +4 panel (`pricePromo`, `testimonials`, `developer`, `location.access`) |
| `app/(public)/[slug]/page.tsx` | Root `data-lp-*` + `style` palet + Chrome tema |

---

## Task 1: Lapisan palet

**Files:**
- Create: `lib/landing/palettes.ts`
- Test: `tests/unit/palettes.test.ts`, `tests/unit/theme-no-literal-colors.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `LP_TOKENS` (20 literal), `LpToken`, `Palette = Record<LpToken,string>`, `PaletteName` (union 10), `PALETTE_NAMES: PaletteName[]`, `PALETTE_LABELS: Record<PaletteName,string>`, `PALETTES: Record<PaletteName,Palette>`, `paletteStyle(name: PaletteName): React.CSSProperties`

- [ ] **Step 1: Tulis tes kontras yang gagal**

`tests/unit/palettes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PALETTES, PALETTE_NAMES, LP_TOKENS, paletteStyle } from '@/lib/landing/palettes';

/** Luminansi relatif WCAG 2.1 dari hex #rrggbb. */
function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pasangan teks-di-atas-latar yang WAJIB terbaca di setiap palet. */
const PAIRS: [LpTokenName, LpTokenName][] = [
  ['ink', 'bg'], ['ink-soft', 'bg'],
  ['on-accent', 'accent'],
  ['on-contrast', 'contrast'],
  ['on-feature', 'feature'],
  ['on-footer', 'footer'],
];
type LpTokenName = (typeof LP_TOKENS)[number];

describe('kontrak palet', () => {
  it('mendefinisikan kesepuluh palet', () => {
    expect(PALETTE_NAMES).toHaveLength(10);
    expect(Object.keys(PALETTES).sort()).toEqual([...PALETTE_NAMES].sort());
  });

  it.each(PALETTE_NAMES)('%s mendefinisikan kedua puluh token tanpa celah', (name) => {
    const p = PALETTES[name];
    for (const token of LP_TOKENS) {
      expect(p[token], `${name} kehilangan --lp-${token}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it.each(PALETTE_NAMES)('%s memenuhi WCAG AA 4.5:1 di setiap pasangan teks', (name) => {
    const p = PALETTES[name];
    for (const [fg, bg] of PAIRS) {
      const ratio = contrast(p[fg], p[bg]);
      expect(ratio, `${name}: ${fg} di atas ${bg} hanya ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('paletteStyle menghasilkan custom property, bukan properti CSS biasa', () => {
    const style = paletteStyle('tropicalWarm') as Record<string, string>;
    expect(style['--lp-accent']).toBe('#b4552f');
    expect(Object.keys(style).every((k) => k.startsWith('--lp-'))).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- palettes`
Expected: FAIL — `Cannot find module '@/lib/landing/palettes'`

- [ ] **Step 3: Tulis `lib/landing/palettes.ts`**

Nilai diangkat verbatim dari kesepuluh file `.dc.html` di Claude Design project `b83ace24-6494-4409-9908-45979e7de301`. **Jangan "dirapikan".**

Dua penyimpangan sengaja dari file desain — keduanya untuk keterbacaan, keduanya akan ditangkap tes Step 1 kalau dikembalikan:
- `boldRetail['on-feature']` = `#111111`, bukan `#ffffff` seperti di file. Putih di atas `#ff6a13` hanya **3,2:1** — gagal AA.
- `softLuxury['on-accent']` = `#ffffff`, bukan `#f6f1e9`. Yang asli hanya **4,2:1**.

```ts
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
    accent: '#b4552f', 'on-accent': '#faf3ea', 'accent-soft': '#f7ded0',
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
export function paletteStyle(name: PaletteName): React.CSSProperties {
  const p = PALETTES[name] ?? PALETTES.tropicalWarm;
  return Object.fromEntries(LP_TOKENS.map((t) => [`--lp-${t}`, p[t]])) as React.CSSProperties;
}
```

- [ ] **Step 4: Jalankan tes**

Run: `npm test -- palettes`
Expected: PASS — 23 tes (2 `it` + 10×2 `it.each` + 1).
Kalau ada palet gagal kontras, **jangan longgarkan ambangnya** — perbaiki tokennya dan catat penyimpangannya seperti dua contoh di Step 3.

- [ ] **Step 5: Tulis lint hex literal**

`tests/unit/theme-no-literal-colors.test.ts`:

```ts
import { readFileSync, globSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

/**
 * Penegak aturan arsitektur: komponen tema tidak boleh menulis warna literal.
 * Tanpa tes ini, satu hex hardcoded merusak 9 palet lain di tempat itu — dan
 * rusaknya baru terlihat saat seseorang menukar palet, jauh setelah commit.
 */
const COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

describe('komponen tema bebas warna literal', () => {
  it('tidak ada hex/rgb/hsl di lib/landing/themes', () => {
    const files = globSync('lib/landing/themes/**/*.{ts,tsx,css}');
    expect(files.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (line.includes('lp-lint-allow')) return;
        if (COLOR.test(line)) offenders.push(`${file}:${i + 1} → ${line.trim()}`);
      });
    }
    expect(offenders, `Pakai var(--lp-*):\n${offenders.join('\n')}`).toEqual([]);
  });
});
```

`globSync` dari `node:fs` butuh Node 22+. Repo ini berjalan di **Node 24.19.0** (tercatat di `.wolf/STATUS.md` → Active architecture), jadi tanpa dependency tambahan.

- [ ] **Step 6: Jalankan lint**

Run: `npm test -- theme-no-literal-colors`
Expected: FAIL selama `wireframe` masih ada (dihapus di Task 12). Kalau kebetulan PASS, tetap lanjut — tes ini yang menjaga Task 7–11.

- [ ] **Step 7: Commit**

```bash
git add lib/landing/palettes.ts tests/unit/palettes.test.ts tests/unit/theme-no-literal-colors.test.ts
git commit -m "feat(landing): lapisan palet 20 token x 10 palet + gate kontras WCAG AA"
```

---

## Task 2: Font per tema

**Files:**
- Create: `lib/landing/fonts.ts`
- Test: `tests/unit/landing-fonts.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `THEME_FONTS: Record<'tropicalWarm', { className: string; display: string; text: string }>`

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, it, expect } from 'vitest';
import { THEME_FONTS } from '@/lib/landing/fonts';

describe('font tema', () => {
  it('tropicalWarm memasangkan serif display dengan sans teks', () => {
    const f = THEME_FONTS.tropicalWarm;
    expect(f.className).toBeTruthy();
    expect(f.display).toContain('--font-dm-serif');
    expect(f.text).toContain('--font-dm-sans');
  });

  it('setiap stack punya fallback sistem, bukan hanya satu nama', () => {
    for (const f of Object.values(THEME_FONTS)) {
      expect(f.display.split(',').length).toBeGreaterThan(1);
      expect(f.text.split(',').length).toBeGreaterThan(1);
    }
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- landing-fonts` → FAIL, modul tidak ada.

- [ ] **Step 3: Tulis `lib/landing/fonts.ts`**

```ts
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
```

- [ ] **Step 4: Jalankan tes**

Run: `npm test -- landing-fonts` → PASS

Kalau vitest gagal me-resolve `next/font/google`, tambahkan alias di `vitest.config.ts`:
```ts
// resolve.alias
'next/font/google': path.resolve(__dirname, 'tests/mocks/next-font.ts'),
```
dengan `tests/mocks/next-font.ts` mengekspor factory yang mengembalikan `{ variable: '--font-x', className: 'font-x' }`.

- [ ] **Step 5: Commit**

```bash
git add lib/landing/fonts.ts tests/unit/landing-fonts.test.ts
git commit -m "feat(landing): pasangan font per tema lewat next/font"
```

---

## Task 3: Model blok — 3 baru, 3 diperluas

**Files:**
- Create: `lib/landing/themeNames.ts`
- Modify: `lib/landing/blocks.ts`, `lib/data/types.ts`
- Test: `tests/unit/blocks.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `PricePromoBlock`, `TestimonialsBlock`, `DeveloperBlock`, `BLOCK_ORDER_BY_THEME`, `defaultBlocksForTheme(theme: ThemeName): Block[]`, `ThemeName`, `THEME_NAMES`, `DEFAULT_THEME`, `normalizeTheme`, `THEME_DEFAULT_PALETTE`

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, it, expect } from 'vitest';
import { defaultBlocksForTheme, BLOCK_LABELS } from '@/lib/landing/blocks';

describe('defaultBlocksForTheme', () => {
  it('tropicalWarm menghasilkan 14 blok dengan urutan temanya', () => {
    expect(defaultBlocksForTheme('tropicalWarm').map((b) => b.type)).toEqual([
      'hero', 'location', 'highlights', 'houseTypes', 'specs', 'facilities',
      'floorPlans', 'gallery', 'pricePromo', 'developer', 'testimonials', 'faq',
      'agentCta', 'contactForm',
    ]);
  });

  it('mematikan specs secara default karena spesifikasi sudah ada di kartu tipe unit', () => {
    const blocks = defaultBlocksForTheme('tropicalWarm');
    expect(blocks.find((b) => b.type === 'specs')?.enabled).toBe(false);
    expect(blocks.filter((b) => b.type !== 'specs').every((b) => b.enabled)).toBe(true);
  });

  it('memberi label Indonesia untuk ketiga blok baru', () => {
    expect(BLOCK_LABELS.pricePromo).toBe('Harga & Promo');
    expect(BLOCK_LABELS.developer).toBe('Developer');
    expect(BLOCK_LABELS.testimonials).toBe('Testimoni');
  });

  it('tema tak dikenal jatuh ke urutan tropicalWarm, bukan array kosong', () => {
    // @ts-expect-error sengaja: data lama bisa membawa nilai theme asing
    expect(defaultBlocksForTheme('sesuatuYangHilang')).toHaveLength(14);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- blocks` → FAIL, `defaultBlocksForTheme is not a function`

- [ ] **Step 3: Tulis `lib/landing/themeNames.ts`**

`blocks.ts` perlu `ThemeName`, tapi `lib/data/types.ts` sudah mengimpor `Block` dari `blocks.ts`. Untuk menghindari siklus, `ThemeName` pindah ke modul tanpa impor apa pun:

```ts
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
```

- [ ] **Step 4: Ubah `lib/landing/blocks.ts`**

Tambah ke `BlockType`: `'pricePromo' | 'developer' | 'testimonials'`.

```ts
export type PricePromoBlock = BlockBase<'pricePromo', {
  dpText?: string;
  installmentText?: string;
  promos?: string[];
  note?: string;
}>;

export type TestimonialsBlock = BlockBase<'testimonials', {
  items?: { quote: string; name: string; unit: string }[];
}>;

/** value bertipe string, bukan number — desain menampilkan "40+" dan "12.000". */
export type DeveloperBlock = BlockBase<'developer', {
  about?: string;
  stats?: { value: string; label: string }[];
}>;
```

Perluas dua blok yang sudah ada:
```ts
export type HeroBlock = BlockBase<'hero', { title?: string; subtitle?: string; mediaId?: string; badges?: string[] }>;
export type LocationBlock = BlockBase<'location', { address?: string; mapUrl?: string; access?: { time: string; place: string }[] }>;
```

Tambahkan ketiganya ke union `Block`, ke `BLOCK_LABELS` (`'Harga & Promo'`, `'Developer'`, `'Testimoni'`), dan ke `DEFAULT_PROPS` (`pricePromo: {}`, `developer: {}`, `testimonials: {}`).

Ganti `defaultBlocks()` dan hapus `BLOCK_ORDER`:
```ts
import type { ThemeName } from './themeNames';

/**
 * Urutan bawaan MILIK TEMA (spec §10). Ganti tema di editor menawarkan urutan
 * ini lewat konfirmasi — susunan manual agen tidak pernah ditimpa diam-diam.
 */
export const BLOCK_ORDER_BY_THEME: Partial<Record<ThemeName, BlockType[]>> = {
  tropicalWarm: [
    'hero', 'location', 'highlights', 'houseTypes', 'specs', 'facilities',
    'floorPlans', 'gallery', 'pricePromo', 'developer', 'testimonials', 'faq',
    'agentCta', 'contactForm',
  ],
};

const DISABLED_BY_DEFAULT: Partial<Record<ThemeName, BlockType[]>> = {
  tropicalWarm: ['specs'],
};

export function defaultBlocksForTheme(theme: ThemeName): Block[] {
  const order = BLOCK_ORDER_BY_THEME[theme] ?? BLOCK_ORDER_BY_THEME.tropicalWarm!;
  const off = new Set(DISABLED_BY_DEFAULT[theme] ?? DISABLED_BY_DEFAULT.tropicalWarm ?? []);
  return order.map(
    (type) => ({ id: `blk_${type}`, type, enabled: !off.has(type), props: { ...DEFAULT_PROPS[type] } }) as Block,
  );
}
```

`lib/data/types.ts`: hapus definisi `ThemeName` lama, ganti dengan `export type { ThemeName } from '@/lib/landing/themeNames'` dan `export type { PaletteName } from '@/lib/landing/palettes'`.

- [ ] **Step 5: Jalankan tes**

Run: `npm test -- blocks` → PASS.
`npm test` penuh akan merah di tempat lain (`defaultBlocks` sudah hilang) — itu diperbaiki Task 5.

- [ ] **Step 6: Commit**

```bash
git add lib/landing/blocks.ts lib/landing/themeNames.ts lib/data/types.ts tests/unit/blocks.test.ts
git commit -m "feat(landing): 3 blok baru + urutan bawaan per tema + ThemeName 10 nilai"
```

---

## Task 4: Rantai resolve

**Files:**
- Modify: `lib/landing/resolve.ts`
- Test: `tests/unit/resolve.test.ts`

**Interfaces:**
- Consumes: tipe blok Task 3
- Produces: varian `ResolvedBlock` baru —
  - `{ id; type:'pricePromo'; priceFrom: number|null; dpText: string; installmentText: string; promos: string[]; note: string }`
  - `{ id; type:'testimonials'; items: { quote:string; name:string; unit:string }[] }`
  - `{ id; type:'developer'; name: string; about: string; stats: { value:string; label:string }[] }`
  - `location` +`access: {time,place}[]` · `floorPlans` +`masterplan: Media|null` · `hero` +`badges: string[]` +`priceFrom: number|null` +`waNumber: string` +`defaultMessage: string`

- [ ] **Step 1: Tulis tes yang gagal**

Pakai helper fixture yang sudah ada di `tests/unit/resolve.test.ts`. Kalau bentuknya berbeda, salin dari tes yang sudah lulus di file itu.

```ts
describe('resolve — blok baru', () => {
  it('meneruskan promo yang diisi agen apa adanya', () => {
    const out = resolveBlocks(inputWith('pricePromo', { dpText: '10%', promos: ['Free BPHTB'] }));
    expect(out.find((x) => x.type === 'pricePromo')).toMatchObject({ dpText: '10%', promos: ['Free BPHTB'] });
  });

  it('menurunkan priceFrom dari harga tipe termurah', () => {
    const out = resolveBlocks(inputWithHouseTypes([3_200_000_000, 2_600_000_000]));
    expect(out.find((x) => x.type === 'pricePromo')).toMatchObject({ priceFrom: 2_600_000_000 });
    expect(out.find((x) => x.type === 'hero')).toMatchObject({ priceFrom: 2_600_000_000 });
  });

  it('priceFrom null ketika project belum punya tipe rumah', () => {
    expect(resolveBlocks(inputWithHouseTypes([])).find((x) => x.type === 'hero')).toMatchObject({ priceFrom: null });
  });

  it('TIDAK mengisi testimoni dari AI walau aiContent tersedia', () => {
    const out = resolveBlocks(inputWithAi({ sellingPoints: ['x'] }));
    expect(out.find((x) => x.type === 'testimonials')).toMatchObject({ items: [] });
  });

  it('mempertahankan daftar akses lokasi', () => {
    const out = resolveBlocks(inputWith('location', { access: [{ time: '3 mnt', place: 'Tol' }] }));
    expect(out.find((x) => x.type === 'location')).toMatchObject({ access: [{ time: '3 mnt', place: 'Tol' }] });
  });

  it('masterplan memilih floor_plan milik project, bukan denah per tipe', () => {
    const out = resolveBlocks(inputWithMedia([
      { id: 'm1', type: 'floor_plan', houseTypeId: null },
      { id: 'm2', type: 'floor_plan', houseTypeId: 'h1' },
    ]));
    const b = out.find((x) => x.type === 'floorPlans');
    expect(b && b.type === 'floorPlans' ? b.masterplan?.id : null).toBe('m1');
  });

  it('badge hero jatuh ke highlights lalu facilities, maksimal 4', () => {
    const a = resolveBlocks(inputWith('highlights', { items: ['a', 'b', 'c', 'd', 'e'] }));
    expect(a.find((x) => x.type === 'hero')).toMatchObject({ badges: ['a', 'b', 'c', 'd'] });
    const b = resolveBlocks(inputWithFacilities(['Kolam', 'Gym']));
    expect(b.find((x) => x.type === 'hero')).toMatchObject({ badges: ['Kolam', 'Gym'] });
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- resolve` → FAIL, blok baru belum ada di union maupun switch.

- [ ] **Step 3: Ubah `lib/landing/resolve.ts`**

Tambahkan varian ke union `ResolvedBlock` sesuai **Interfaces**. Hitung sekali di atas loop `for (const block of project.blocks)`:

```ts
const priceFrom = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : null;
const masterplan = media.find((m) => m.houseTypeId === null && m.type === 'floor_plan') ?? null;
const ctaProps = (byId('agentCta')?.props ?? {}) as { waNumber?: string; defaultMessage?: string };
const waNumber = pick(ctaProps.waNumber, undefined, agent.whatsapp);
const defaultMessage = pick(
  ctaProps.defaultMessage, undefined, `Halo ${agent.fullName}, saya tertarik dengan ${project.name}.`,
);
const highlightItems = pick(
  (byId('highlights')?.props as { items?: string[] } | undefined)?.items, ai?.sellingPoints, [],
);
```

Tiga `case` baru — perhatikan **tidak ada `pick` dengan sumber AI**:

```ts
case 'pricePromo':
  out.push({
    id: block.id, type: 'pricePromo', priceFrom,
    dpText: (p.dpText as string) ?? '',
    installmentText: (p.installmentText as string) ?? '',
    promos: (p.promos as string[]) ?? [],
    note: (p.note as string) ?? '',
  });
  break;

case 'testimonials':
  // Sengaja TANPA fallback AI. Testimoni fabrikasi yang tampil seolah asli
  // adalah penipuan terhadap calon pembeli — field ini hanya diisi agen.
  out.push({
    id: block.id, type: 'testimonials',
    items: (p.items as { quote: string; name: string; unit: string }[]) ?? [],
  });
  break;

case 'developer':
  out.push({
    id: block.id, type: 'developer',
    name: project.developer,
    about: (p.about as string) ?? '',
    stats: (p.stats as { value: string; label: string }[]) ?? [],
  });
  break;
```

Perluas tiga case yang sudah ada:
- `hero`: `badges: ((p.badges as string[])?.length ? (p.badges as string[]) : highlightItems.length ? highlightItems : project.facilities).slice(0, 4)`, plus `priceFrom`, `waNumber`, `defaultMessage`.
- `location`: `access: (p.access as { time: string; place: string }[]) ?? []`.
- `floorPlans`: `masterplan`.

`hero` menerima `waNumber`/`defaultMessage` yang juga dimiliki `agentCta` — duplikasi disengaja. `BlockRenderer` hanya meneruskan `{ block }`, jadi komponen tidak punya jalan lain untuk tahu data di luar bloknya. Ini mengikuti preseden `projectId` yang komentarnya sudah ada di file ini.

- [ ] **Step 4: Jalankan tes**

Run: `npm test -- resolve` → PASS

- [ ] **Step 5: Commit**

```bash
git add lib/landing/resolve.ts tests/unit/resolve.test.ts
git commit -m "feat(landing): resolve 3 blok baru + akses lokasi + masterplan + badge hero"
```

---

## Task 5: Migrasi store — palette, normalizeTheme, repairShape per-baris

**Files:**
- Modify: `lib/data/types.ts`, `lib/data/mock/store.ts`, `lib/data/mock/repos.ts`, `fixtures/seed.ts`
- Test: `tests/unit/theme-migration.test.ts`, `tests/unit/mock-store.test.ts`

**Interfaces:**
- Consumes: `normalizeTheme`, `DEFAULT_THEME`, `THEME_DEFAULT_PALETTE` (Task 3), `PALETTE_NAMES` (Task 1), `defaultBlocksForTheme` (Task 3)
- Produces: `Project.palette: PaletteName`

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeTheme } from '@/lib/landing/themeNames';

describe('normalizeTheme', () => {
  it('melewatkan nilai yang sudah sah apa adanya', () => {
    expect(normalizeTheme('tropicalWarm')).toBe('tropicalWarm');
    // Begitu editorialWhite dibangun di slice 2B, project yang memilihnya
    // HARUS tetap memilikinya. Ini bukan pemetaan menyeluruh.
    expect(normalizeTheme('editorialWhite')).toBe('editorialWhite');
  });

  it('memetakan nilai lama slice 1 ke tema yang sudah dibangun', () => {
    for (const old of ['modern', 'showcase', 'luxury']) {
      expect(normalizeTheme(old)).toBe('tropicalWarm');
    }
  });

  it('memetakan sampah dan nilai kosong ke default', () => {
    for (const bad of ['', null, undefined, 42, {}, 'zzz']) {
      expect(normalizeTheme(bad)).toBe('tropicalWarm');
    }
  });
});

describe('repairShape', () => {
  it('memperbaiki BARIS, bukan hanya tabel yang hilang', () => {
    // Pakai helper pembaca snapshot yang sudah ada di mock-store.test.ts.
    const store = loadSnapshotFrom({
      projects: [{ id: 'p1', userId: 'u1', name: 'X', slug: 'x', theme: 'modern' }],
    });
    expect(store.projects[0].theme).toBe('tropicalWarm');
    expect(store.projects[0].palette).toBe('tropicalWarm');
    expect(store.projects[0].blocks).toHaveLength(14);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- theme-migration` → FAIL

- [ ] **Step 3: Implementasi**

`lib/data/types.ts`: tambah `palette: PaletteName;` ke interface `Project`.

`lib/data/mock/store.ts` — `repairShape()` sekarang juga memperbaiki baris. Ini menutup jebakan yang tercatat di STATUS.md ("repairShape hanya mengisi tabel yang HILANG"):

```ts
const repaired: Record<string, unknown> = { ...seed };
for (const key of STORE_KEYS) {
  const value = parsed[key];
  if (Array.isArray(value)) repaired[key] = value.filter(isRowLike);
}

// Perbaikan tingkat BARIS. Sebelumnya repairShape hanya mengisi tabel yang
// HILANG, jadi snapshot lama diam-diam membawa theme/palette tidak sah dan
// merender halaman publik dengan tema default tanpa jejak apa pun.
repaired.projects = (repaired.projects as Project[]).map((p) => {
  const theme = normalizeTheme((p as { theme?: unknown }).theme);
  const rawPalette = (p as { palette?: unknown }).palette;
  return {
    ...p,
    theme,
    palette: PALETTE_NAMES.includes(rawPalette as PaletteName)
      ? (rawPalette as PaletteName)
      : THEME_DEFAULT_PALETTE[theme],
    blocks: Array.isArray(p.blocks) && p.blocks.length ? p.blocks : defaultBlocksForTheme(theme),
  };
});
```

> **Jangan** mengimpor `THEMES` di `store.ts` — itu menarik komponen React ke lapisan data. Pakai `THEME_DEFAULT_PALETTE` dari `themeNames.ts`.

`lib/data/mock/repos.ts` `projects.create`: `theme: 'modern' as const` → `theme: DEFAULT_THEME`; tambah `palette: THEME_DEFAULT_PALETTE[DEFAULT_THEME]`; `blocks: defaultBlocks()` → `blocks: defaultBlocksForTheme(DEFAULT_THEME)`.

`fixtures/seed.ts` helper `project()`: `theme: DEFAULT_THEME`, `palette: 'tropicalWarm'`, `blocks: defaultBlocksForTheme(DEFAULT_THEME)`.

- [ ] **Step 4: Jalankan tes + reset store**

```bash
npm test -- theme-migration mock-store
npm run seed:reset
```
Expected: PASS. `seed:reset` **WAJIB** — tanpa itu `.data/store.json` lama menyembunyikan field baru.

- [ ] **Step 5: Commit**

```bash
git add lib/data/ fixtures/seed.ts tests/unit/theme-migration.test.ts tests/unit/mock-store.test.ts
git commit -m "feat(data): Project.palette + repairShape tingkat baris + migrasi tema lama"
```

---

## Task 6: Registry tema jadi objek

**Files:**
- Modify: `lib/landing/themes/index.ts`, `lib/landing/BlockRenderer.tsx`
- Create: `lib/landing/themes/tropicalWarm/index.ts` (kerangka; komponen diisi Task 7–11)
- Test: `tests/unit/block-renderer.test.tsx` (tulis ulang)

**Interfaces:**
- Consumes: `PaletteName`, `THEME_FONTS`, `ThemeName`, `THEME_LABELS`, `THEME_DEFAULT_PALETTE`
- Produces:
```ts
export type ChromeProps = { project: Project; agent: AgentProfile; houseTypes: ResolvedHouseType[] };
export type Theme = {
  label: string;
  fonts: { className: string; display: string; text: string };
  defaultPalette: PaletteName;
  components: BlockComponents;
  Chrome: { Header: ComponentType<ChromeProps>; Footer: ComponentType<ChromeProps> };
};
export const THEMES: Record<ThemeName, Theme>;
export const AVAILABLE_THEMES: ThemeName[];
```

- [ ] **Step 1: Tulis tes yang gagal**

```ts
it('mendaftarkan kesepuluh tema tapi baru satu yang bisa dipilih', () => {
  expect(Object.keys(THEMES)).toHaveLength(10);
  expect(AVAILABLE_THEMES).toEqual(['tropicalWarm']);
});

it('setiap tema mengimplementasi keempat belas blok', () => {
  for (const name of Object.keys(THEMES) as ThemeName[]) {
    expect(Object.keys(THEMES[name].components).sort()).toEqual([
      'agentCta', 'contactForm', 'developer', 'facilities', 'faq', 'floorPlans',
      'gallery', 'hero', 'highlights', 'houseTypes', 'location', 'pricePromo',
      'specs', 'testimonials',
    ]);
  }
});

it('tema yang belum dibangun tetap punya entri agar picker tidak meledak', () => {
  expect(THEMES.editorialWhite.label).toBe('Editorial Putih');
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm test -- block-renderer` → FAIL

- [ ] **Step 3: Implementasi**

> **Penyimpangan sengaja dari spec §9.** Spec menaruh `order` dan `disabledByDefault` di dalam objek `Theme`. Plan menaruhnya di `blocks.ts` sebagai `BLOCK_ORDER_BY_THEME` (Task 3). Alasannya siklus impor: `themes/index.ts` mengimpor komponen, komponen mengimpor `resolve.ts`, dan `resolve.ts` mengimpor `blocks.ts` — kalau `blocks.ts` balik mengimpor `themes/index.ts` untuk urutan, lingkarannya tertutup. `blocks.ts` adalah lapisan yang lebih rendah, jadi urutan tinggal di sana. Perilaku yang dijanjikan spec tidak berubah.

`THEMES` diisi 10 entri. Sembilan yang belum dibangun memakai `components` dan `Chrome` milik `tropicalWarm` sebagai isian sementara — **bukan** `null`, supaya `BlockRenderer` tidak perlu cabang khusus dan tidak ada halaman publik yang bisa kosong. `AVAILABLE_THEMES` yang menjaga agar agen tidak bisa memilihnya.

`BlockRenderer` tetap menerima `{ blocks, theme }` dan tetap meneruskan hanya `{ block }`. Satu-satunya perubahan: `const set = THEMES[theme]?.components ?? THEMES.tropicalWarm.components`.

Kerangka `tropicalWarm/index.ts` untuk sekarang: setiap komponen adalah `() => null` agar tipe terpenuhi; Task 7–11 menggantinya satu per satu.

- [ ] **Step 4: Jalankan tes**

Run: `npm test -- block-renderer` → PASS

- [ ] **Step 5: Commit**

```bash
git add lib/landing/themes/ lib/landing/BlockRenderer.tsx tests/unit/block-renderer.test.tsx
git commit -m "feat(landing): registry tema jadi objek (label, font, chrome, palet bawaan)"
```

---

## Task 7–11: Komponen tema Tropis Hangat

**Sumber ukuran:** `10 Tropis Hangat.dc.html` di Claude Design project `b83ace24-6494-4409-9908-45979e7de301`. **Buka file itu saat mengerjakan setiap komponen.** Spec §11 memuat tabel pemetaan token → section; plan ini tidak menyalin ulang seluruh CSS-nya.

**Aturan untuk kelima task ini:**
- Server Component, kecuali `HouseTypes` dan `Faq` yang butuh state → `'use client'`.
- Kembalikan **`null`** kalau datanya kosong (`promos`/`items`/`stats`/`access`/`masterplan`/`badges`).
- Kelas CSS diawali `lp-tw-`, didefinisikan di `lib/landing/themes/tropicalWarm/theme.css`.
- **Nol warna literal.** Tes Task 1 Step 5 menegakkannya. Untuk warna semi-transparan pakai `color-mix(in srgb, var(--lp-x) 16%, transparent)`, bukan `rgba(...)`.
- Metrik bersama: section `padding:30px 20px`; eyebrow `11px / letter-spacing .18em / var(--lp-accent)`; H2 `var(--lp-font-display) / 29px / line-height 1.2`.

### Task 7: Chrome + Hero

**Files:** Create `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `theme.css` · Test: `tests/unit/tw-hero.test.tsx`

- [ ] **Step 1: Tes gagal** — Hero merender `block.title` sebagai satu-satunya `h1`; price bar muncul saat `priceFrom` ada dan **hilang** saat `null`; badge dirender maksimal 4; placeholder dipakai saat `image === null`; Footer merender `agent.whatsapp` dan `agent.email`.
- [ ] **Step 2:** `npm test -- tw-hero` → FAIL
- [ ] **Step 3: Implementasi.** Hero = `<section>` 500px, gradien `linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--lp-contrast) 78%, transparent) 100%)`, badge `background: color-mix(in srgb, var(--lp-on-accent) 16%, transparent)` + `backdrop-filter: blur(6px)`, h1 `var(--lp-font-display)` 40px/1.08. Price bar = `<div className="lp-tw-pricebar">` di dalam komponen Hero yang sama (bukan blok tersendiri): label + `formatRupiahShort(priceFrom)` + `<WhatsAppLink>` yang sudah ada memakai `waNumber`/`defaultMessage`.
  Header: `var(--lp-accent)`, `project.name` (display 20px) + `project.location` uppercase.
  Footer: `var(--lp-footer)`, nama project, `project.location`, `agent.whatsapp`, `agent.email`, tautan lompat `#unit`/`#kontak`, copyright. **Tanpa jam operasional** — tidak ada fieldnya di `AgentProfile`.
- [ ] **Step 4:** `npm test -- tw-hero` → PASS
- [ ] **Step 5:** `git commit -m "feat(tema): tropicalWarm chrome + hero + price bar"`

### Task 8: Location, Highlights, HouseTypes, Specs

**Files:** Create keempatnya · Test: `tests/unit/tw-unit-blocks.test.tsx`

- [ ] **Step 1: Tes gagal** — `HouseTypes` mengganti kartu saat tab diklik (`userEvent.click`); grid spesifikasi menampilkan keenam field; section ber-`id="unit"`; `Location` menyembunyikan strip akses saat `access` kosong; `Highlights` menomori item mulai dari 1.
- [ ] **Step 2:** `npm test -- tw-unit-blocks` → FAIL
- [ ] **Step 3: Implementasi.** `HouseTypes` = `'use client'` dengan `useState(0)`. Tab aktif `background: var(--lp-bg); color: var(--lp-feature)`; nonaktif transparan + `border-color: color-mix(in srgb, var(--lp-on-feature) 35%, transparent)`. Kartu aktif: foto utama, nama, `formatRupiahShort(price)`, grid 2 kolom dari `formatArea(landArea)`/`formatArea(buildingArea)`/`bedrooms`/`bathrooms`/`carport`, lalu `shortDescription`. **Legalitas "SHM" tidak disalin dari desain** — tidak ada di skema, dan mengklaimnya untuk unit yang belum tentu SHM adalah klaim hukum palsu. `Specs` = tabel perbandingan semua tipe (mati by default).
- [ ] **Step 4:** `npm test -- tw-unit-blocks` → PASS
- [ ] **Step 5:** `git commit -m "feat(tema): tropicalWarm lokasi, USP, tipe unit, spesifikasi"`

### Task 9: Facilities, FloorPlans, Gallery

**Files:** Create ketiganya · Test: `tests/unit/tw-media-blocks.test.tsx`

- [ ] **Step 1: Tes gagal** — `FloorPlans` merender masterplan saat ada dan **tidak merender section sama sekali** saat `masterplan === null` dan `plans` kosong; `Gallery` memberi `alt` bermakna pada setiap gambar; `Facilities` merender nama saja.
- [ ] **Step 2:** `npm test -- tw-media-blocks` → FAIL
- [ ] **Step 3: Implementasi.** Facilities grid 2 kolom, kartu `var(--lp-surface)`, blok foto 104px — **tanpa baris deskripsi** (`project.facilities` hanya `string[]`). FloorPlans: masterplan 1:1 lebih dulu, lalu denah per tipe; **legenda cluster dihilangkan** (tidak ada datanya). Gallery scroll-snap-x, item 230px, gambar 250px; **caption dihilangkan** (`Media` tidak punya field caption).
- [ ] **Step 4:** `npm test -- tw-media-blocks` → PASS
- [ ] **Step 5:** `git commit -m "feat(tema): tropicalWarm fasilitas, masterplan, galeri"`

### Task 10: PricePromo, Developer, Testimonials

**Files:** Create ketiganya · Test: `tests/unit/tw-new-blocks.test.tsx`

- [ ] **Step 1: Tes gagal** — ketiganya mengembalikan `null` saat kosong (assert `container.querySelector('section')` null); `PricePromo` menampilkan `formatRupiahShort(priceFrom)` dan melewati kartu DP kalau `dpText` kosong; `Developer` memakai `project.developer` sebagai nama.
- [ ] **Step 2:** `npm test -- tw-new-blocks` → FAIL
- [ ] **Step 3: Implementasi.** PricePromo `background: var(--lp-accent)`, eyebrow `var(--lp-accent-soft)`, harga display 38px, dua kartu DP/cicilan `color-mix(in srgb, var(--lp-ink) 15%, transparent)`, daftar promo. Developer: paragraf + 3 kartu statistik `var(--lp-surface)`. Testimonials: kartu `var(--lp-surface)`, kutipan display 19px/1.45, avatar 38px bulat.
- [ ] **Step 4:** `npm test -- tw-new-blocks` → PASS
- [ ] **Step 5:** `git commit -m "feat(tema): tropicalWarm harga & promo, developer, testimoni"`

### Task 11: Faq, AgentCta, ContactFormBlock

**Files:** Create ketiganya · Test: `tests/unit/tw-contact-blocks.test.tsx`

- [ ] **Step 1: Tes gagal** — akordeon FAQ membuka satu item dan menutup yang lain (`aria-expanded`); `AgentCta` merender **satu** kartu agen dengan tombol WhatsApp dan Telepon, section ber-`id="kontak"`; `ContactFormBlock` tetap merender `<ContactForm>` yang sudah ada (regresi pipeline lead).
- [ ] **Step 2:** `npm test -- tw-contact-blocks` → FAIL
- [ ] **Step 3: Implementasi.** `Faq` = `'use client'`, `useState<number>(0)`, penanda `+`/`−`, `aria-expanded` di tombol. `AgentCta` `var(--lp-surface)`, satu kartu (multi-agen di luar scope MVP). `ContactFormBlock` = blok penutup `var(--lp-contrast)` dengan headline desain + `<ContactForm>` yang sudah ada + tombol WhatsApp — desain #10 tidak punya form, tapi menghapusnya berarti mematikan pipeline lead yang sudah jalan dan sudah ada tesnya.
- [ ] **Step 4:** `npm test -- tw-contact-blocks && npm test -- theme-no-literal-colors` → PASS keduanya
- [ ] **Step 5:** `git commit -m "feat(tema): tropicalWarm FAQ, CTA agen, blok penutup + form"`

---

## Task 12: Hapus wireframe, wiring halaman publik, responsive

**Files:**
- Delete: `lib/landing/themes/wireframe/` (12 file)
- Move: `lib/landing/landing.css` → `styles/landing/landing.css`
- Modify: `app/(public)/[slug]/page.tsx`, `styles/globals.css`, `lib/landing/themes/tropicalWarm/theme.css`
- Test: `tests/unit/landing-page.test.tsx`

- [ ] **Step 1: Tes gagal**

```ts
it('memasang tema dan palet di root landing', () => {
  const { container } = renderPage({ theme: 'tropicalWarm', palette: 'premiumDark' });
  const root = container.querySelector('.lp') as HTMLElement;
  expect(root.getAttribute('data-lp-theme')).toBe('tropicalWarm');
  expect(root.getAttribute('data-lp-palette')).toBe('premiumDark');
  expect(root.style.getPropertyValue('--lp-accent')).toBe('#c9a227');
});
```

- [ ] **Step 2:** `npm test -- landing-page` → FAIL
- [ ] **Step 3: Implementasi.** Root landing:

```tsx
const theme = THEMES[data.project.theme] ?? THEMES.tropicalWarm;
const { Header, Footer } = theme.Chrome;
// ...
<div
  className={`lp ${theme.fonts.className}`}
  data-lp-theme={data.project.theme}
  data-lp-palette={data.project.palette}
  style={paletteStyle(data.project.palette)}
>
  <Header project={data.project} agent={data.agent} houseTypes={types} />
  <BlockRenderer blocks={blocks} theme={data.project.theme} />
  <Footer project={data.project} agent={data.agent} houseTypes={types} />
</div>
```

Footer satu-baris lama dihapus (digantikan Chrome). Nav pil `.lp__pills`, `PageViewTracker`, JSON-LD, dan `StickyCtaBar` dipertahankan apa adanya. `.lp__section:nth-child(even){background:var(--stone)}` **dihapus** — peretasan wireframe; tiap tema mengatur latar sectionnya sendiri.

Breakpoint di `theme.css` sesuai spec §12: `640px` grid 2→3 kolom + hero 560px; `900px` `max-width:1120px` terpusat, galeri scroll-x → grid 3, akses → 6 kolom, blok tipe unit 2 kolom, hero 640px; `1200px` padding section 56px + masterplan/denah berdampingan. Paragraf `max-width:68ch` di semua ukuran. Ukuran display naik lewat `clamp()`, bukan media query bertingkat.

- [ ] **Step 4: Verifikasi**

```bash
# pastikan next dev MATI — cek port 3000 dulu (bug-023)
npm test && npm run build
```
Expected: hijau, termasuk `theme-no-literal-colors` yang kini bersih karena `wireframe` sudah tidak ada.

- [ ] **Step 5:** `git commit -m "refactor(landing): hapus tema wireframe, wiring chrome + palet, responsive"`

---

## Task 13: Editor — palet, konfirmasi urutan, 4 panel

**Files:**
- Create: `components/editor/PalettePicker.tsx`
- Modify: `components/editor/EditorShell.tsx`, `components/editor/BlockSettingsPanel.tsx`, `app/(dashboard)/projects/[id]/editor/actions.ts`
- Test: `tests/unit/editor-palette.test.tsx`, `tests/unit/editor-panels.test.tsx`

**Interfaces:**
- Consumes: `PALETTE_NAMES`, `PALETTE_LABELS`, `PALETTES`, `paletteStyle`, `defaultBlocksForTheme`, `AVAILABLE_THEMES`, `THEME_LABELS`
- Produces: `setPaletteAction(projectId: string, palette: PaletteName): Promise<{ ok: boolean }>`

- [ ] **Step 1: Tes gagal** — memilih swatch memanggil `setPaletteAction` dan mengubah `style` pratinjau; ganti tema memunculkan konfirmasi "Terapkan urutan bawaan tema ini?"; menolak konfirmasi **mempertahankan** urutan blok agen; panel `pricePromo` bisa menambah dan menghapus baris promo; panel `testimonials` menampilkan keterangan bahwa isian ini tidak pernah diisi AI; panel `location` bisa menambah baris akses.
- [ ] **Step 2:** `npm test -- editor-palette editor-panels` → FAIL
- [ ] **Step 3: Implementasi.** `setPaletteAction` mengikuti bentuk `setThemeAction` yang sudah ada (`requireSessionUserId()` → `db.projects.update` → `revalidatePath('/'+slug)`). `PalettePicker` = baris 10 tombol swatch dengan `aria-pressed` dan `aria-label` dari `PALETTE_LABELS`; warna swatch dari `PALETTES[name].accent` lewat `style` (ini di `components/`, di luar jangkauan lint Task 1). Ganti tema: set tema dulu, lalu konfirmasi dua tombol — **Terapkan urutan bawaan** (`setBlocks(defaultBlocksForTheme(next))`) dan **Pertahankan susunan saya** (tidak melakukan apa-apa). Tidak ada state "dirty" tersembunyi. Pratinjau dibungkus `data-lp-theme`/`data-lp-palette` + `style={paletteStyle(palette)}` supaya palet ikut berubah seketika.
- [ ] **Step 4:** `npm test -- editor` → PASS
- [ ] **Step 5:** `git commit -m "feat(editor): pemilih palet, konfirmasi urutan tema, 4 panel blok baru"`

---

## Task 14: Seed, e2e, verifikasi visual

**Files:**
- Modify: `fixtures/seed.ts`
- Create: `tests/e2e/landing-theme.spec.ts`

- [ ] **Step 1: Tulis e2e yang gagal**

`tests/e2e/landing-theme.spec.ts` — landing yang dipublish merender keempat belas section; tab tipe unit berpindah; akordeon FAQ membuka; form kontak tetap membuat lead; ganti palet di editor mengubah pratinjau.

**Ingat:** suite serial di atas satu mock store bersama. Pakai `.first()`, baseline yang dibaca di tes itu sendiri, atau `toBeGreaterThanOrEqual` — **jangan** asersi bernilai absolut (`bug-024`). Semua perpindahan rute pakai `waitForURL(...)`.

- [ ] **Step 2:** `npm run test:e2e -- landing-theme` → FAIL
- [ ] **Step 3: Isi seed.** `fixtures/seed.ts` mendapat konten yang mengisi keempat belas blok untuk `prj_parkspring`, diambil dari `10 Tropis Hangat.dc.html` (Parkspring Kelapa Gading) supaya hasil render bisa dibandingkan mata langsung dengan file desain: 6 baris `location.access`, `pricePromo` (DP `'10%'`, cicilan `'Rp 18 jt'`, 4 promo), `developer` (paragraf + 3 statistik `{value:'28',label:'Tahun'}` dst.), 2 `testimonials`, dan 4 `hero.badges`.
- [ ] **Step 4: Reset dan verifikasi penuh**

```bash
npm run seed:reset
# pastikan tidak ada next dev di port 3000
npm run verify
```
Expected: EXIT_CODE=0 — unit hijau, `npm run build` bersih, e2e hijau.

- [ ] **Step 5: Verifikasi visual 3 breakpoint.** Spec Playwright sementara yang login, membuka landing yang dipublish di 390px, 768px, dan 1440px, lalu menyimpan screenshot. Bandingkan mata dengan `10 Tropis Hangat.dc.html`. **Hapus spec sementaranya setelah selesai.** (`openwolf designqc` TIDAK ada di CLI 2.0.1 walau OPENWOLF.md menyebutnya.) Lampirkan ketiga screenshot ke laporan task.
- [ ] **Step 6: Commit**

```bash
git add fixtures/seed.ts tests/e2e/landing-theme.spec.ts
git commit -m "feat(landing): seed konten 14 blok + e2e tema + verifikasi 3 breakpoint"
```

---

## Definisi selesai

Spec §18, diringkas:

1. `npm run verify` EXIT_CODE=0.
2. `/{slug}` merender Tropis Hangat dan tetap **server-rendered** — dibuktikan lewat View Source, lengkap meta/OG/JSON-LD/canonical.
3. Menukar palet di editor mengubah seluruh halaman tanpa reload dan tanpa flash.
4. Kesepuluh palet lolos gate kontras Task 1.
5. Lint hex literal melaporkan nol pelanggaran.
6. Landing proporsional di 390px, 768px, 1440px — screenshot dilampirkan.
7. Alur penuh slice 1 masih lolos, termasuk pengiriman lead lewat form.
8. Ganti tema menawarkan urutan bawaan dan menghormati penolakan agen.

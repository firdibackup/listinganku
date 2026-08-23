import { readFileSync, globSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PALETTES, PALETTE_NAMES, LP_TOKENS } from '@/lib/landing/palettes';
import type { LpToken } from '@/lib/landing/palettes';

/**
 * Penegak KONTRAK PERAN TOKEN (lihat header lib/landing/palettes.ts).
 *
 * `theme-no-literal-colors` sudah melarang hex hardcoded, tapi tema tetap bisa
 * memakai var(--lp-*) yang SALAH PERAN: `background: var(--lp-feature)` +
 * `color: var(--lp-accent)` lolos lint warna literal, padahal di palet yang
 * feature-nya sama dengan accent hasilnya kontras 1,00:1 — teks hilang total.
 * Itu persis yang terjadi di palet natureCalm (bug-036) dan di tema premiumDark
 * yang dipasangkan dengan palet natureCalm (bug-037).
 *
 * Dua hal yang diuji, keduanya di KESEPULUH palet (10 tema x 10 palet):
 *   1. tiap latar hanya dipasangkan dengan token tulisan yang sah untuknya;
 *   2. pasangan itu benar-benar lolos 4,5:1 secara numerik.
 * Nomor 2 tidak redundan: nomor 1 menjaga niatnya, nomor 2 menjaga nilainya
 * tetap benar kalau ada yang menyetel ulang hex di palettes.ts.
 */

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

/** Tulisan apa saja yang boleh berdiri di atas tiap token latar. */
const ALLOWED_ON: Partial<Record<LpToken, LpToken[]>> = {
  bg: ['ink', 'ink-soft', 'ink-faint', 'accent-ink'],
  surface: ['ink', 'ink-soft', 'ink-faint', 'accent-ink'],
  'ph-a': ['ink', 'ink-soft', 'ink-faint', 'accent-ink'],
  'ph-b': ['ink', 'ink-soft', 'ink-faint', 'accent-ink'],
  accent: ['on-accent'],
  'accent-soft': ['on-accent-soft'],
  contrast: ['on-contrast', 'on-contrast-soft', 'contrast-accent'],
  feature: ['on-feature', 'on-feature-soft'],
  footer: ['on-footer'],
};

interface Decl { file: string; line: number; selector: string; bg: LpToken; fg: LpToken }

/**
 * Mengumpulkan tiap aturan CSS yang menyetel background DAN color sekaligus
 * lewat var(--lp-*) polos. Aturan yang latarnya diwarisi dari induk tidak
 * terjangkau di sini — bagian itu dijaga audit kontras di browser, bukan unit
 * test. Komentar dinetralkan (diganti spasi, jumlah baris dipertahankan) supaya
 * nomor barisnya tetap akurat.
 */
function collectDeclarations(): Decl[] {
  const files = globSync('lib/landing/themes/*/theme.css');
  expect(files.length, 'tidak ada theme.css yang terbaca').toBe(10);

  const out: Decl[] = [];
  const tokens = new Set<string>(LP_TOKENS);

  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const rule = /([^{}]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = rule.exec(css))) {
      const body = m[2];
      const bg = body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*var\(--lp-([a-z-]+)\)\s*(?:;|$)/);
      const fg = body.match(/(?:^|;)\s*color\s*:\s*var\(--lp-([a-z-]+)\)\s*(?:;|$)/);
      if (!bg || !fg) continue;
      if (!tokens.has(bg[1]) || !tokens.has(fg[1])) continue;
      out.push({
        file: file.replace(/\\/g, '/'),
        line: css.slice(0, m.index).split('\n').length,
        selector: m[1].trim().replace(/\s+/g, ' '),
        bg: bg[1] as LpToken,
        fg: fg[1] as LpToken,
      });
    }
  }
  return out;
}

describe('kontrak peran token di kesepuluh tema', () => {
  const decls = collectDeclarations();

  it('menemukan deklarasi latar+tulisan untuk diperiksa', () => {
    expect(decls.length).toBeGreaterThan(50);
  });

  it('tidak ada latar yang dipasangkan dengan tulisan di luar perannya', () => {
    const offenders = decls
      .filter((d) => {
        const allowed = ALLOWED_ON[d.bg];
        return allowed ? !allowed.includes(d.fg) : false;
      })
      .map((d) => `${d.file}:${d.line} ${d.selector} -> background:${d.bg} + color:${d.fg} (sah: ${ALLOWED_ON[d.bg]!.join(', ')})`);

    expect(offenders, `Lihat KONTRAK PERAN TOKEN di lib/landing/palettes.ts:\n${offenders.join('\n')}`).toEqual([]);
  });

  it.each(PALETTE_NAMES)('setiap pasangan lolos 4,5:1 memakai palet %s', (paletteName) => {
    const p = PALETTES[paletteName];
    const offenders = decls
      .map((d) => ({ d, ratio: contrast(p[d.bg], p[d.fg]) }))
      .filter(({ ratio }) => ratio < 4.5)
      .map(({ d, ratio }) => `${d.file}:${d.line} ${d.selector} -> ${d.bg}/${d.fg} = ${ratio.toFixed(2)}:1`);

    expect(offenders, `Palet ${paletteName}:\n${offenders.join('\n')}`).toEqual([]);
  });
});

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

type LpTokenName = (typeof LP_TOKENS)[number];

/** Pasangan teks-di-atas-latar yang WAJIB terbaca di setiap palet. */
const PAIRS: [LpTokenName, LpTokenName][] = [
  ['ink', 'bg'], ['ink-soft', 'bg'],
  ['on-accent', 'accent'],
  ['on-contrast', 'contrast'],
  ['on-feature', 'feature'],
  ['on-footer', 'footer'],
];

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

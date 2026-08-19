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

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

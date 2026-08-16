import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const STYLES = path.resolve(__dirname, '../../styles');
const read = (p: string) => readFileSync(path.join(STYLES, p), 'utf8');

function allCss(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? allCss(path.join(dir, e.name))
      : e.name.endsWith('.css')
        ? [path.join(dir, e.name)]
        : [],
  );
}

describe('design token', () => {
  it('memakai nilai palette design system yang persis', () => {
    const css = read('tokens/colors.css');
    expect(css).toContain('--evergreen:#233D2D');
    expect(css).toContain('--orange:#D2421A');
    expect(css).toContain('--leaf:#00803A');
    expect(css).toContain('--mint:#E5EDE7');
    expect(css).toContain('--stone:#F3F5F2');
    expect(css).toContain('--ash:#D3D8D5');
    expect(css).toContain('--sage:#66736B');
    expect(css).toContain('--ink:#121212');
  });

  it('tidak memakai biru dari dokumen pen.dev yang sudah usang', () => {
    for (const file of allCss(STYLES)) {
      expect(readFileSync(file, 'utf8').toLowerCase(), `${file} memuat #2563eb`).not.toContain('#2563eb');
    }
  });

  it('memakai skala radius dan tinggi kontrol design system', () => {
    expect(read('tokens/radius.css')).toContain('--radius-sm:4px');
    expect(read('tokens/radius.css')).toContain('--radius-md:8px');
    expect(read('tokens/spacing.css')).toContain('--control-height:46px');
    expect(read('tokens/spacing.css')).toContain('--card-pad:32px');
  });

  it('menjaga body copy tetap di platform sans, bukan Archivo', () => {
    const type = read('tokens/typography.css');
    expect(type).toMatch(/--font-body:\s*"Helvetica Neue"/);
    expect(type).toContain('--font-display:var(--font-archivo)');
  });
});

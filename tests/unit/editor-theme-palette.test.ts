import { afterAll, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — pola sama dengan landing-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-editor-theme-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => 'usr_owner' }));

import { db } from '@/lib/data';
import { setThemeAction, setPaletteAction } from '@/app/(dashboard)/projects/[id]/editor/actions';
import { THEME_NAMES, THEME_DEFAULT_PALETTE } from '@/lib/landing/themeNames';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);
let seq = 0;

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

async function makeProject() {
  seq += 1;
  return db.projects.create({
    userId: 'usr_owner', name: `Cluster Uji ${seq}`, location: 'Jakarta', developer: 'Dev',
    description: 'Deskripsi lengkap.', facilities: [],
  });
}

/**
 * Tiap theme.css ditranskrip 1:1 dari satu file desain yang mengandaikan
 * paletnya sendiri. Sebelum ini `theme` dan `palette` berdiri sendiri, dan
 * project demo tersimpan sebagai premiumDark + natureCalm — inisial avatar
 * jadi kontras 1,00:1 (bug-037).
 */
describe('setThemeAction menjaga palet tetap sepasang dengan tema', () => {
  it.each(THEME_NAMES)('mengganti tema ke %s ikut menyetel paletnya', async (theme) => {
    const project = await makeProject();
    // Sengaja dibuat tidak cocok dulu supaya terlihat aksi ini yang merapikan.
    await setPaletteAction(project.id, 'boldRetail');

    const res = await setThemeAction(project.id, theme);

    expect(res.palette).toBe(THEME_DEFAULT_PALETTE[theme]);
    const saved = await db.projects.get(project.id);
    expect(saved?.theme).toBe(theme);
    expect(saved?.palette).toBe(THEME_DEFAULT_PALETTE[theme]);
  });

  it('penyimpangan palet yang DISENGAJA tetap boleh dan tetap tersimpan', async () => {
    const project = await makeProject();
    await setThemeAction(project.id, 'premiumDark');

    await setPaletteAction(project.id, 'natureCalm');

    const saved = await db.projects.get(project.id);
    expect(saved?.theme).toBe('premiumDark');
    expect(saved?.palette).toBe('natureCalm');
  });
});

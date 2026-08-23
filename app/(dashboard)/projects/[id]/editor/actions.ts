'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { THEME_DEFAULT_PALETTE } from '@/lib/landing/themeNames';
import type { Block } from '@/lib/landing/blocks';
import type { PaletteName, ThemeName } from '@/lib/data/types';

export async function saveBlocksAction(projectId: string, blocks: Block[]): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { blocks });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}

/**
 * Ganti tema SEKALIGUS menyetel palet ke bawaan tema itu.
 *
 * Tiap `theme.css` ditranskrip 1:1 dari satu file desain yang mengandaikan
 * paletnya sendiri, jadi 90 dari 100 pasangan tema x palet tidak pernah
 * didesain. Dulu kedua field ini berdiri sendiri, dan project demo tersimpan
 * sebagai tema `premiumDark` + palet `natureCalm`: inisial avatar jadi kontras
 * 1,00:1 alias tak terlihat (bug-037). Agen tetap boleh menyimpang setelahnya
 * lewat PalettePicker — yang dihapus hanya penyimpangan DIAM-DIAM.
 *
 * Palet dikembalikan supaya klien menyamakan state-nya tanpa menebak.
 */
export async function setThemeAction(
  projectId: string,
  theme: ThemeName,
): Promise<{ ok: boolean; palette: PaletteName }> {
  await requireSessionUserId();
  const palette = THEME_DEFAULT_PALETTE[theme];
  const project = await db.projects.update(projectId, { theme, palette });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/${project.slug}`);
  return { ok: true, palette };
}

export async function setPaletteAction(projectId: string, palette: PaletteName): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { palette });
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}

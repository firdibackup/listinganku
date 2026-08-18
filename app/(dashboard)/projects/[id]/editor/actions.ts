'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import type { Block } from '@/lib/landing/blocks';
import type { ThemeName } from '@/lib/data/types';

export async function saveBlocksAction(projectId: string, blocks: Block[]): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { blocks });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}

export async function setThemeAction(projectId: string, theme: ThemeName): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { theme });
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}

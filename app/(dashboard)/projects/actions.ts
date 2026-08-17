'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { ProjectDraftSchema, ProjectPublishSchema } from '@/lib/schemas';
import type { ProjectDraftInput } from '@/lib/schemas';
import type { Project } from '@/lib/data/types';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]> };

/**
 * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma
 * membuktikan ADA sesi — tidak pernah memverifikasi kepemilikan project yang
 * jadi target. Pola dan alasan sama persis dengan requireOwnedProject di
 * lib/media/actions.ts (bug-008): tanpa gate ini sesi mana pun bisa
 * update/publish/delete project user lain hanya dengan menebak id-nya. Pesan
 * gagal generik ("tidak ditemukan") baik project benar-benar tidak ada
 * maupun ada tapi bukan milik userId — tidak membocorkan mana yang mana.
 */
async function requireOwnedProject(userId: string, projectId: string): Promise<Project | null> {
  const project = await db.projects.get(projectId);
  if (!project || project.userId !== userId) return null;
  return project;
}

export async function createProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  // Seluruh badan dibungkus try/catch: requireSessionUserId() (sesi kedaluwarsa)
  // dan db.projects.create() (baris gagal ditulis) bisa melempar, dan pemanggil
  // (wizard) tidak membungkusnya sendiri — exception yang lolos dari sini jadi
  // unhandled rejection yang didiamkan, persis bug-010 di media actions.
  try {
    const userId = await requireSessionUserId();
    const parsed = ProjectDraftSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    // `slug` dibuang di sini: repo yang menurunkannya dari nama sekaligus
    // menyelesaikan bentrok. NewProject sengaja tidak menerimanya.
    const { slug: _slug, ...draft } = parsed.data as ProjectDraftInput;
    const project = await db.projects.create({ userId, ...draft });
    revalidatePath('/dashboard');
    return { ok: true, data: { id: project.id } };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menyimpan project. Coba lagi.'] } };
  }
}

export async function updateProjectAction(id: string, input: unknown): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    const owned = await requireOwnedProject(userId, id);
    if (!owned) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    const parsed = ProjectDraftSchema.partial().safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    await db.projects.update(id, parsed.data);
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard');
    return { ok: true, data: null };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menyimpan project. Coba lagi.'] } };
  }
}

export async function publishProjectAction(id: string): Promise<ActionResult<{ slug: string }>> {
  try {
    const userId = await requireSessionUserId();
    const project = await requireOwnedProject(userId, id);
    if (!project) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    const parsed = ProjectPublishSchema.safeParse(project);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    const updated = await db.projects.update(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
    revalidatePath('/dashboard');
    revalidatePath(`/${updated.slug}`);
    return { ok: true, data: { slug: updated.slug } };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal mempublikasikan project. Coba lagi.'] } };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<null>> {
  // Brief aslinya memberi fungsi ini tanda tangan Promise<void> tanpa
  // try/catch. Belum ada caller yang memakainya di task ini, tapi begitu UI
  // hapus-project dibuat, Promise<void> tanpa try/catch di sini akan jadi
  // unhandled rejection yang didiamkan — persis pola silent-failure (bug-010)
  // yang tiga action lain di file ini sudah dijaga. Disamakan ke ActionResult
  // supaya konsisten sebelum ada yang bergantung padanya.
  try {
    const userId = await requireSessionUserId();
    const owned = await requireOwnedProject(userId, id);
    if (!owned) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    await db.projects.remove(id);
    revalidatePath('/dashboard');
    return { ok: true, data: null };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menghapus project. Coba lagi.'] } };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { ProjectDraftSchema, ProjectPublishSchema } from '@/lib/schemas';
import type { ProjectDraftInput } from '@/lib/schemas';
import type { Project } from '@/lib/data/types';
import { applySectionPreset } from '@/lib/landing/sectionPreset';

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
    // Preset diterapkan di sini karena inilah saat projectType pertama diketahui.
    if (draft.projectType) {
      await db.projects.update(project.id, {
        blocks: applySectionPreset(project.blocks, draft.projectType),
      });
    }
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

    // Ganti tipe project = ganti section yang relevan. Wizard SUDAH meminta
    // konfirmasi ke agen sebelum memanggil ini, jadi di sini diterapkan tanpa
    // tanya — tapi HANYA saat nilainya benar-benar BERUBAH, supaya penyimpanan
    // langkah lain tidak menimpa toggle manual agen di step 2.
    const patch = { ...parsed.data } as Omit<typeof parsed.data, 'blocks'> & { blocks?: typeof owned.blocks };
    const nextType = patch.projectType;
    if (nextType && nextType !== owned.projectType) {
      // `patch.blocks ?? owned.blocks`, BUKAN `owned.blocks` telanjang: mulai
      // Task 11 wizard mengirim `blocks` miliknya sendiri di payload yang sama
      // — memakai owned.blocks membuang toggle/props yang baru saja disunting
      // agen di step 2 karena itu salinan server yang sudah basi.
      patch.blocks = applySectionPreset(patch.blocks ?? owned.blocks, nextType);
    }

    // Spec §4.3: `project.facilities` (string[] lama) TIDAK dihapus — ia
    // disinkronkan dari `brief.facilities` setiap kali brief ikut dikirim.
    // Tanpa ini `project.facilities` tetap [] selamanya begitu agen mengisi
    // fasilitas di wizard step 2, dan lib/landing/seo.ts + rantai fallback
    // facilities yang membaca project.facilities (bukan brief.facilities)
    // tidak pernah melihatnya. Hanya jalan saat `brief` benar-benar ada di
    // patch — update lain (mis. cuma projectType) tidak boleh menimpa
    // project.facilities dengan array kosong dari brief yang tidak dikirim.
    if (patch.brief) {
      patch.facilities = patch.brief.facilities.map((f) => f.name);
    }

    await db.projects.update(id, patch);
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

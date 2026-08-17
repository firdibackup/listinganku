'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { HouseTypeSchema } from '@/lib/schemas';
import type { Block } from '@/lib/landing/blocks';
import type { HouseType, Project } from '@/lib/data/types';
import type { ActionResult } from '../actions';

/**
 * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma
 * membuktikan ADA sesi — tidak pernah memverifikasi kepemilikan project yang
 * jadi target. Pola dan alasan sama persis dengan requireOwnedProject di
 * app/(dashboard)/projects/actions.ts dan lib/media/actions.ts (bug-008): tanpa
 * gate ini sesi mana pun bisa create/update/delete tipe rumah di project user
 * lain hanya dengan menebak projectId-nya. Pesan gagal generik ("tidak
 * ditemukan") baik project benar-benar tidak ada maupun ada tapi bukan milik
 * userId — tidak membocorkan mana yang mana.
 */
async function requireOwnedProject(userId: string, projectId: string): Promise<Project | null> {
  const project = await db.projects.get(projectId);
  if (!project || project.userId !== userId) return null;
  return project;
}

/**
 * requireOwnedProject membuktikan projectId milik sesi — TAPI tidak membuktikan
 * bahwa houseTypeId yang dikirim benar-benar anak dari project itu. Tanpa
 * pengecekan ini, sesi yang punya project SENDIRI (jadi lolos requireOwnedProject)
 * bisa mengirim id tipe rumah milik project ORANG LAIN dan tetap
 * mengubah/menghapusnya, karena db.houseTypes.update/remove hanya mencari
 * berdasarkan id, tidak pernah memvalidasi projectId induknya. Pola sama dengan
 * scoping mediaId ke projectId di setPrimaryMediaAction (lib/media/actions.ts).
 */
async function requireOwnedHouseType(projectId: string, houseTypeId: string): Promise<HouseType | null> {
  const houseType = await db.houseTypes.get(houseTypeId);
  if (!houseType || houseType.projectId !== projectId) return null;
  return houseType;
}

/**
 * Blok `houseTypes` menyimpan REFERENSI houseTypeId di `order`/`hidden`, bukan
 * salinan (lihat lib/landing/blocks.ts). Editor block (task berikutnya) belum
 * pernah menulis referensi ini di slice ini, tapi begitu ia ada, menghapus
 * tipe rumah tanpa membersihkan referensinya akan meninggalkan id yatim di
 * blocks — landing page publik lalu mencoba merender tipe yang sudah tidak ada.
 * Dibersihkan di sini secara defensif supaya delete selalu konsisten dengan
 * blocks, terlepas dari kapan editor block benar-benar menulis ke sana.
 */
function stripHouseTypeFromBlocks(blocks: Block[], houseTypeId: string): Block[] {
  return blocks.map((b) => {
    if (b.type !== 'houseTypes') return b;
    return {
      ...b,
      props: {
        order: b.props.order?.filter((id) => id !== houseTypeId),
        hidden: b.props.hidden?.filter((id) => id !== houseTypeId),
      },
    };
  });
}

export async function createHouseTypeAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  // Seluruh badan dibungkus try/catch: requireSessionUserId() (sesi kedaluwarsa)
  // dan db.houseTypes.create() (baris gagal ditulis) bisa melempar, dan
  // HouseTypeSheet memanggil action ini lewat startTransition tanpa
  // try/catch sendiri — exception yang lolos dari sini jadi unhandled
  // rejection yang didiamkan.
  try {
    const userId = await requireSessionUserId();
    const owned = await requireOwnedProject(userId, projectId);
    if (!owned) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    const parsed = HouseTypeSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    const created = await db.houseTypes.create({ projectId, ...parsed.data });
    // dashboard/page.tsx menampilkan houseTypeCount per project lewat ProjectCard
    // — jumlah itu berubah setiap create/delete di sini, jadi /dashboard ikut
    // di-revalidate, sama seperti tiga action lain di app/(dashboard)/projects/actions.ts.
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id } };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menyimpan tipe rumah. Coba lagi.'] } };
  }
}

export async function updateHouseTypeAction(
  id: string,
  projectId: string,
  input: unknown,
): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    const owned = await requireOwnedProject(userId, projectId);
    if (!owned) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    const target = await requireOwnedHouseType(projectId, id);
    if (!target) return { ok: false, fieldErrors: { _: ['Tipe rumah tidak ditemukan.'] } };

    const parsed = HouseTypeSchema.partial().safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    await db.houseTypes.update(id, parsed.data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { ok: true, data: null };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menyimpan tipe rumah. Coba lagi.'] } };
  }
}

export async function deleteHouseTypeAction(id: string, projectId: string): Promise<ActionResult<null>> {
  // Brief aslinya memberi fungsi ini tanda tangan Promise<void> tanpa
  // try/catch dan tanpa gate kepemilikan sama sekali. Disamakan ke
  // ActionResult<null> supaya konsisten dengan deleteProjectAction (yang
  // punya catatan persis sama) dan supaya HouseTypeSheet punya sesuatu untuk
  // diperiksa alih-alih mengasumsikan delete selalu berhasil.
  try {
    const userId = await requireSessionUserId();
    const owned = await requireOwnedProject(userId, projectId);
    if (!owned) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

    const target = await requireOwnedHouseType(projectId, id);
    if (!target) return { ok: false, fieldErrors: { _: ['Tipe rumah tidak ditemukan.'] } };

    await db.houseTypes.remove(id);

    const cleaned = stripHouseTypeFromBlocks(owned.blocks, id);
    await db.projects.update(projectId, { blocks: cleaned });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { ok: true, data: null };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal menghapus tipe rumah. Coba lagi.'] } };
  }
}

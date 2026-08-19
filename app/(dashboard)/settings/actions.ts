'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { AppearanceSchema, GeneralSchema, ProfileSchema } from '@/lib/schemas';
import { normalizeIndonesianPhone } from '@/lib/phone';
import type { ActionResult } from '../projects/actions';

/**
 * Tidak ada gate kepemilikan bergaya requireOwnedProject di sini: setiap action
 * di file ini menulis ke agentProfile milik userId SESI, tidak pernah ke id yang
 * datang dari klien. Tidak ada baris orang lain yang bisa dijangkau.
 *
 * agentProfile.update() melempar bila userId tidak punya profil; try/catch di
 * tiap action mengubahnya jadi ActionResult, bukan exception yang lolos.
 */
const GAGAL = { ok: false as const, fieldErrors: { _: ['Perubahan gagal disimpan. Coba lagi.'] } };

function revalidate() {
  revalidatePath('/settings');
  // Dashboard menampilkan kartu "Website Anda sudah live" dan sidebar memakai
  // nama agen — keduanya ikut basi saat profil berubah.
  revalidatePath('/dashboard');
}

export async function updateAppearanceAction(input: unknown): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    const parsed = AppearanceSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    await db.agentProfile.update(userId, parsed.data);
    revalidate();
    return { ok: true, data: null };
  } catch {
    return GAGAL;
  }
}

export async function updateProfileAction(input: unknown): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    const parsed = ProfileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    const current = await db.agentProfile.get(userId);
    if (!current) return GAGAL;

    const { about, closings, listings, specialistArea, whatsapp } = parsed.data;
    await db.agentProfile.update(userId, {
      about,
      specialistArea,
      // Bentuk kanonik yang sama dengan leads.phone dan link wa.me.
      whatsapp: normalizeIndonesianPhone(whatsapp),
      // stats disebar dari nilai saat ini: agentProfile.update memakai
      // Object.assign (merge dangkal), jadi mengirim objek stats baru akan
      // menghapus `years` yang tidak punya field di form ini.
      stats: { ...current.stats, closings, listings },
    });
    revalidate();
    return { ok: true, data: null };
  } catch {
    return GAGAL;
  }
}

export async function updateGeneralAction(input: unknown): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    const parsed = GeneralSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    await db.agentProfile.update(userId, { notifyOnLead: parsed.data.notifyOnLead });
    revalidate();
    return { ok: true, data: null };
  } catch {
    return GAGAL;
  }
}

export async function setProfilePublishedAction(published: boolean): Promise<ActionResult<null>> {
  try {
    const userId = await requireSessionUserId();
    await db.agentProfile.update(userId, { isPublished: published });
    revalidate();
    return { ok: true, data: null };
  } catch {
    return GAGAL;
  }
}

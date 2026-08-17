'use server';

import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { newId } from '@/lib/ids';
import { requireSessionUserId } from '@/lib/session';
import { validateUpload } from './downscale';

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Direktori unggahan bisa dioverride lewat LISTINGKU_UPLOAD_DIR — dibaca ulang
 * setiap panggilan (bukan konstanta level modul), simetris dengan
 * LISTINGKU_DATA_DIR di lib/data/mock/snapshot.ts, supaya tes bisa mengarahkan
 * berkas ke direktori sementara tanpa pernah menulis ke public/uploads
 * sungguhan milik developer.
 */
function uploadDir(): string {
  return path.resolve(process.cwd(), process.env.LISTINGKU_UPLOAD_DIR ?? path.join('public', 'uploads'));
}

/**
 * Slice 1 menulis ke public/uploads (gitignored) dan menyajikannya sebagai file
 * statis. Ini meniru bucket publik bernama acak di Supabase Storage, sehingga
 * migrasinya sebatas mengganti sumber URL. Hanya untuk pengembangan lokal —
 * filesystem host produksi bersifat sementara.
 */
export async function uploadMediaAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const userId = await requireSessionUserId();
  const file = formData.get('file');
  const projectId = String(formData.get('projectId') ?? '');
  const houseTypeIdRaw = String(formData.get('houseTypeId') ?? '');
  const houseTypeId = houseTypeIdRaw === '' ? null : houseTypeIdRaw;
  const type = String(formData.get('type') ?? 'photo') as 'photo' | 'floor_plan';

  if (!(file instanceof File)) return { ok: false, message: 'Berkas tidak terbaca.' };

  const existing = (await db.media.listByProject(projectId)).filter(
    (m) => m.houseTypeId === houseTypeId && m.type === type,
  );
  const check = validateUpload({ type: file.type, size: file.size }, existing.length);
  if (!check.ok) return { ok: false, message: check.message };

  // Nama file asli TIDAK PERNAH dipakai untuk membentuk path — id acak + ekstensi
  // yang diturunkan dari file.type yang sudah divalidasi (whitelist di EXT) adalah
  // satu-satunya bahan nama berkas. "../../../evil.jpg" atau byte null di nama asli
  // tidak berpengaruh sama sekali karena tidak pernah dibaca.
  const ext = EXT[file.type] ?? 'jpg';
  const id = newId('med');
  const dir = uploadDir();

  // Kegagalan filesystem (disk penuh, izin ditolak, direktori tak bisa dibuat)
  // tidak boleh melempar sampai ke pemanggil — komponen memanggil action ini di
  // dalam startTransition tanpa try/catch, jadi exception tak tertangani akan
  // jatuh ke error boundary terdekat alih-alih pesan yang bisa ditampilkan.
  // Ditangkap di sini dan diubah jadi respons {ok:false} yang bisa dirender.
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.${ext}`), Buffer.from(await file.arrayBuffer()));
  } catch {
    return { ok: false, message: 'Gagal menyimpan berkas. Coba lagi.' };
  }

  await db.media.create({
    userId, projectId, houseTypeId, type,
    url: `/uploads/${id}.${ext}`,
    size: file.size,
  });

  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function deleteMediaAction(mediaId: string, projectId: string): Promise<void> {
  await requireSessionUserId();
  const all = await db.media.listByProject(projectId);
  const target = all.find((m) => m.id === mediaId);
  if (!target) return;

  // target.url selalu berbentuk "/uploads/<nama-file>" (lihat uploadMediaAction),
  // jadi basename + uploadDir() cukup — sekaligus menghormati override
  // LISTINGKU_UPLOAD_DIR yang sama dipakai saat menulis berkas.
  await rm(path.join(uploadDir(), path.basename(target.url)), { force: true });
  await db.media.remove(mediaId);

  // db.media.remove() tidak tahu konsep "utama" — kalau baris yang dihapus
  // kebetulan foto utama, tanpa langkah ini hero landing kehilangan gambar
  // sampai agen membuka galeri dan memilih ulang secara manual. Foto berikutnya
  // (urutan sortOrder terkecil yang tersisa) otomatis dipromosikan. Hanya
  // berlaku untuk type 'photo' — floor plan tidak punya slot utama.
  if (target.isPrimary && target.type === 'photo') {
    const remaining = (await db.media.listByProject(projectId)).filter(
      (m) => m.houseTypeId === target.houseTypeId && m.type === 'photo',
    );
    if (remaining.length > 0) await db.media.setPrimary(remaining[0].id);
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function setPrimaryMediaAction(mediaId: string, projectId: string): Promise<void> {
  await requireSessionUserId();
  await db.media.setPrimary(mediaId);
  revalidatePath(`/projects/${projectId}`);
}

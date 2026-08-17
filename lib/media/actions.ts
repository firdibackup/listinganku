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
 * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma
 * membuktikan ADA sesi — tidak pernah memverifikasi kepemilikan project yang
 * jadi target. Tanpa pemeriksaan ini, sesi mana pun bisa unggah/hapus/ubah
 * primary media project siapa saja hanya dengan menebak projectId, dan
 * projectId yang tidak pernah ada pun lolos begitu saja (db.media.create tidak
 * memvalidasi ke mana pun). Satu fungsi ini menutup kedua celah sekaligus.
 * Pesan gagal sengaja generik ("tidak ditemukan") baik project benar-benar
 * tidak ada maupun ada tapi bukan milik userId — tidak membocorkan mana yang
 * mana ke sesi yang tidak berwenang.
 */
async function requireOwnedProject(userId: string, projectId: string) {
  const project = await db.projects.get(projectId);
  if (!project || project.userId !== userId) return null;
  return project;
}

/**
 * Slice 1 menulis ke public/uploads (gitignored) dan menyajikannya sebagai file
 * statis. Ini meniru bucket publik bernama acak di Supabase Storage, sehingga
 * migrasinya sebatas mengganti sumber URL. Hanya untuk pengembangan lokal —
 * filesystem host produksi bersifat sementara.
 */
export async function uploadMediaAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  // Seluruh isi fungsi dibungkus try/catch — requireSessionUserId() (sesi
  // kedaluwarsa), db.media.create() (baris gagal ditulis), dan batas ukuran
  // body Server Action (413 dari framework di atas 10MB, lihat next.config.ts)
  // semuanya bisa melempar. Komponen memanggil action ini lewat startTransition
  // tanpa try/catch sendiri, jadi exception yang lolos dari sini jadi unhandled
  // rejection yang didiamkan — pengguna tidak pernah tahu unggahannya gagal.
  try {
    const userId = await requireSessionUserId();
    const file = formData.get('file');
    const projectId = String(formData.get('projectId') ?? '');
    const houseTypeIdRaw = String(formData.get('houseTypeId') ?? '');
    const houseTypeId = houseTypeIdRaw === '' ? null : houseTypeIdRaw;
    const type = String(formData.get('type') ?? 'photo') as 'photo' | 'floor_plan';

    const project = await requireOwnedProject(userId, projectId);
    if (!project) return { ok: false, message: 'Project tidak ditemukan.' };

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
    const filePath = path.join(dir, `${id}.${ext}`);

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    try {
      await db.media.create({
        userId, projectId, houseTypeId, type,
        url: `/uploads/${id}.${ext}`,
        size: file.size,
      });
    } catch (err) {
      // Berkas sudah tertulis di disk tapi baris DB gagal dibuat — tanpa
      // pembersihan ini, file itu jadi yatim: memakan ruang selamanya tanpa
      // ada baris media yang pernah menunjuk ke sana. rethrow supaya jatuh ke
      // catch terluar dan tetap mengembalikan {ok:false}, bukan melempar.
      await rm(filePath, { force: true });
      throw err;
    }

    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Gagal mengunggah foto. Coba lagi.' };
  }
}

export async function deleteMediaAction(mediaId: string, projectId: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const userId = await requireSessionUserId();
    const project = await requireOwnedProject(userId, projectId);
    if (!project) return { ok: false, message: 'Project tidak ditemukan.' };

    const all = await db.media.listByProject(projectId);
    const target = all.find((m) => m.id === mediaId);
    // Sudah tidak ada di project ini (baik memang tidak pernah ada, sudah
    // dihapus sebelumnya, atau id itu milik project lain) — hasil akhir yang
    // diinginkan (media itu tidak ada di sini) sudah tercapai, jadi dianggap
    // berhasil, bukan error. Tidak menyentuh baris atau berkas project lain.
    if (!target) return { ok: true };

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
    return { ok: true };
  } catch {
    return { ok: false, message: 'Gagal menghapus foto. Coba lagi.' };
  }
}

export async function setPrimaryMediaAction(
  mediaId: string,
  projectId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const userId = await requireSessionUserId();
    const project = await requireOwnedProject(userId, projectId);
    if (!project) return { ok: false, message: 'Project tidak ditemukan.' };

    // Cari mediaId DI DALAM daftar milik projectId ini (sama seperti
    // deleteMediaAction) — tanpa scoping ini, mediaId dari project lain bisa
    // dipakai untuk mengubah primary project lain sekaligus me-revalidate path
    // project yang salah, membuat galeri project asal media itu basi.
    const target = (await db.media.listByProject(projectId)).find((m) => m.id === mediaId);
    if (!target) return { ok: false, message: 'Foto tidak ditemukan di project ini.' };

    await db.media.setPrimary(mediaId);
    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Gagal menjadikan foto utama. Coba lagi.' };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { LeadSchema } from '@/lib/schemas';
import { normalizeIndonesianPhone } from '@/lib/phone';
import type { EventType } from '@/lib/data/types';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]> };

const EVENT_TYPES: readonly EventType[] = ['visitor', 'whatsapp_click', 'form_submit'];

/**
 * houseTypeId dianggap valid HANYA kalau baris itu benar-benar ada DAN milik
 * projectId yang sama. Nilai lain (tidak pernah ada / milik project lain)
 * dinormalkan jadi null, bukan menolak seluruh panggilan — pengunjung asli
 * tidak pernah bisa mengirim kombinasi tidak cocok lewat dropdown yang
 * disediakan (dropdown hanya berisi tipe milik project ini), jadi cabang ini
 * murni penjagaan sisi server terhadap panggilan action mentah. Membuang
 * referensi yang tidak masuk akal juga membatasi jumlah kombinasi
 * (projectId, houseTypeId) yang valid — lihat komentar di recordEventAction
 * soal kenapa itu penting untuk menahan pertumbuhan tabel events.
 */
async function resolvedHouseTypeId(projectId: string, houseTypeId: string | null | undefined): Promise<string | null> {
  if (!houseTypeId) return null;
  const houseType = await db.houseTypes.get(houseTypeId);
  if (!houseType || houseType.projectId !== projectId) return null;
  return houseTypeId;
}

/**
 * ============================================================================
 * TIDAK ADA requireSessionUserId()/requireOwnedProject() DI FILE INI —
 * DISENGAJA. JANGAN dikembalikan meniru pola action lain di branch ini.
 * ============================================================================
 *
 * Setiap action lain di branch ini (app/(dashboard)/projects/actions.ts,
 * lib/media/actions.ts, houseTypeActions.ts) memverifikasi baris target milik
 * user sesi SEBELUM menyentuh apa pun. Kedua action publik di file ini TIDAK
 * BISA memakai pola itu: pengirimnya adalah calon pembeli anonim yang membuka
 * landing publik tanpa pernah login — memaksa gate sesi di sini tidak
 * memperketat keamanan, itu MEMATIKAN fitur intinya (satu-satunya sesi yang
 * ada di browser pengunjung adalah tidak ada sesi sama sekali).
 *
 * Konsekuensinya: karena tidak ada gate sesi, SETIAP argumen di sini dianggap
 * bermusuhan, bukan hanya yang lolos validasi Zod.
 *  - `input` divalidasi ULANG di server lewat LeadSchema.safeParse — hasil
 *    parse di komponen klien (ContactForm) tidak pernah dipercaya begitu
 *    saja, karena action ini bisa dipanggil langsung tanpa lewat form itu
 *    sama sekali.
 *  - projectId HARUS menunjuk project berstatus published. Landing publik
 *    (app/(public)/[slug]/page.tsx) sudah notFound() untuk draft, jadi lead
 *    yang menempel ke draft/id yang tidak pernah ada hanya bisa datang dari
 *    panggilan action mentah — ditolak, dengan pesan generik yang sama baik
 *    project benar-benar tidak ada maupun ada tapi belum terbit (tidak
 *    membocorkan mana yang mana, sama seperti requireOwnedProject di action
 *    lain).
 */
export async function submitLeadAction(projectId: string, input: unknown): Promise<ActionResult<null>> {
  // Seluruh badan dibungkus try/catch: pemanggil (ContactForm) tidak
  // membungkusnya sendiri di luar startTransition, jadi exception yang lolos
  // dari sini jadi unhandled rejection yang didiamkan — pola silent-failure
  // yang sama yang sudah dijaga di setiap action lain pada branch ini.
  try {
    const parsed = LeadSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    const project = await db.projects.get(projectId);
    if (!project || project.status !== 'published') {
      return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };
    }

    const houseTypeId = await resolvedHouseTypeId(projectId, parsed.data.houseTypeId);
    const phone = normalizeIndonesianPhone(parsed.data.phone);
    const email = parsed.data.email && parsed.data.email !== '' ? parsed.data.email : null;

    await db.leads.create({
      projectId,
      houseTypeId,
      name: parsed.data.name,
      phone,
      email,
      message: parsed.data.message,
      source: 'form',
    });

    // Lead SUDAH tersimpan di atas titik ini. recordEventAction tidak pernah
    // melempar (lihat definisinya) — event form_submit ini best-effort dengan
    // sengaja, supaya kegagalan mencatat event analitik tidak pernah membuat
    // pengunjung melihat "gagal terkirim" padahal pesannya benar-benar sudah
    // tersimpan (skenario "submit yang gagal di tengah jalan").
    await recordEventAction(projectId, 'form_submit');

    revalidatePath('/dashboard');
    return { ok: true, data: null };
  } catch {
    return { ok: false, fieldErrors: { _: ['Gagal mengirim permintaan. Coba lagi.'] } };
  }
}

/**
 * Sama seperti submitLeadAction: TIDAK ADA gate sesi, dipanggil oleh
 * pengunjung anonim — dan jauh lebih sering, karena ini terpasang di setiap
 * page view (PageViewTracker) dan setiap klik tombol WhatsApp (WhatsAppLink),
 * bukan hanya sekali per kunjungan seperti form.
 *
 * Yang dipikirkan soal skrip yang memanggil endpoint ini dalam loop (diminta
 * eksplisit di brief task, TIDAK diselesaikan dengan rate limiting — itu di
 * luar cakupan slice 1, tapi pertumbuhan tabel `events` DIBATASI lewat tiga
 * penjagaan murah di bawah, bukan dibiarkan tak terbatas):
 *  1. `type` harus salah satu dari tiga nilai yang dikenal — nilai lain
 *     diabaikan. Tanpa ini, memvariasikan `type` di setiap panggilan membuat
 *     baris baru setiap kali (lihat kunci upsert di db.events.record:
 *     projectId+houseTypeId+type+date).
 *  2. project harus ada DAN published — draft/id yang tidak pernah ada tidak
 *     pernah menghasilkan baris sama sekali, jadi menebak-nebak projectId
 *     acak tidak bisa membuat tabel tumbuh.
 *  3. houseTypeId dinormalkan lewat resolvedHouseTypeId — memvariasikan
 *     houseTypeId di setiap panggilan (bahkan untuk project yang benar-benar
 *     published) tidak bisa membuat baris baru tanpa batas, karena nilai
 *     yang tidak cocok selalu jatuh ke bucket null yang sama. Dibuktikan
 *     lewat tes: 20 panggilan dengan houseTypeId acak untuk project yang
 *     sama hanya pernah menghasilkan SATU baris (null bucket, count 20), bukan
 *     20 baris terpisah.
 *  Dengan tiga ini, jumlah baris per project per hari dibatasi oleh jumlah
 *  tipe rumah project itu SENDIRI (+1 untuk null) dikali 3 jenis event — nilai
 *  yang ditentukan oleh data project, bukan oleh berapa kali skrip memanggil
 *  endpoint ini. Yang TIDAK dibatasi: berapa kali COUNT pada satu baris itu
 *  boleh bertambah — itu satu increment integer, murah, dan tidak berbeda
 *  dari lalu lintas bot sungguhan yang memang sengaja diterima untuk MVP
 *  (lihat komentar di PageViewTracker).
 */
export async function recordEventAction(
  projectId: string,
  type: EventType,
  houseTypeId?: string,
): Promise<void> {
  // Dipanggil dari klien lewat `void recordEventAction(...)` tanpa await dan
  // tanpa startTransition (lihat PageViewTracker/WhatsAppLink) — tidak ada
  // apa pun di sisi klien yang pernah memeriksa hasilnya. Seluruh badan
  // dibungkus try/catch dan TIDAK PERNAH melempar keluar: kehilangan satu
  // event diterima untuk MVP, melempar exception ke konsol pengunjung tidak.
  try {
    if (typeof projectId !== 'string' || !EVENT_TYPES.includes(type)) return;

    const project = await db.projects.get(projectId);
    if (!project || project.status !== 'published') return;

    const normalizedHouseTypeId = await resolvedHouseTypeId(projectId, houseTypeId);
    await db.events.record({ projectId, houseTypeId: normalizedHouseTypeId, type });

    // TIDAK ADA revalidatePath('/dashboard') di sini — sengaja beda dari
    // submitLeadAction, yang berjalan paling banyak sekali per kunjungan
    // (butuh manusia mengisi form). Endpoint ini publik, tanpa sesi, dan bisa
    // dipicu berkali-kali per detik oleh satu pengunjung/bot. Memanggil
    // revalidatePath pada SETIAP hit mengubah satu increment counter yang
    // murah menjadi biaya invalidasi cache Next.js di setiap panggilan —
    // memberi pengungkit amplifikasi gratis ke siapa pun yang memukul
    // endpoint ini dalam loop. Dashboard (app/(dashboard)/dashboard/page.tsx)
    // sendiri sudah dynamic per-request (requireSessionUserId membaca
    // cookies), jadi tidak ada data basi yang sebenarnya dicegah oleh
    // revalidate di sini — biayanya nyata, manfaatnya nol.
  } catch {
    // Diam-diam gagal: lihat komentar di atas fungsi.
  }
}

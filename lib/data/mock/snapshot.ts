import {
  mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync, existsSync,
} from 'node:fs';
import path from 'node:path';
import { seedStore } from '@/fixtures/seed';
import type { StoreShape } from '../types';

/**
 * Direktori data bisa dioverride lewat LISTINGKU_DATA_DIR — dibaca ulang setiap
 * panggilan (bukan konstanta level modul) supaya tes bisa mengarahkan store ke
 * direktori sementara tanpa pernah menyentuh .data/store.json milik developer
 * sungguhan.
 */
function dataDir(): string {
  return path.resolve(process.cwd(), process.env.LISTINGKU_DATA_DIR ?? '.data');
}

function storeFile(): string {
  return path.join(dataDir(), 'store.json');
}

const STORE_KEYS = ['agentProfiles', 'projects', 'houseTypes', 'media', 'leads', 'events', 'aiUsage'] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Baris yang bukan objek (null, string, angka, ...) tidak bisa dipakai repos.ts — buang, jangan diteruskan. */
function isRowLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Menyerap skema lama atau bentuk yang salah sama sekali. Vektor realistisnya
 * bukan file korup, tapi schema drift: `.data/store.json` ditulis sebelum
 * task berikutnya menambah tabel baru ke StoreShape (mis. leads/aiUsage belum
 * ada), atau salah satu baris di dalam tabel itu sendiri rusak. Tabel yang
 * hilang atau bertipe salah jatuh ke nilai seed-nya masing-masing; elemen
 * array yang bukan objek (mis. `null`) dibuang satu per satu. Ini bukan
 * validasi skema Zod penuh (itu tugas lain di proyek ini) — cukup jaminan
 * minimal supaya setiap baris yang sampai ke repos.ts adalah objek dengan
 * properti, karena itulah yang diasumsikan kode di sana.
 */
function repairShape(parsed: unknown): StoreShape {
  const seed = seedStore();
  if (!isPlainObject(parsed)) return seed;

  const repaired: Record<string, unknown> = { ...seed };
  for (const key of STORE_KEYS) {
    const value = parsed[key];
    if (Array.isArray(value)) repaired[key] = value.filter(isRowLike);
  }
  // Batas kepercayaan: satu-satunya tempat JSON yang belum tervalidasi menjadi
  // StoreShape yang dipercaya penuh oleh repos.ts. Filter di atas adalah semua
  // jaminan yang diberikan sebelum baris ini — tidak ada validasi lebih dalam.
  return repaired as unknown as StoreShape;
}

export function loadSnapshot(): StoreShape | null {
  const file = storeFile();
  if (!existsSync(file)) return null;
  try {
    return repairShape(JSON.parse(readFileSync(file, 'utf8')));
  } catch {
    return null;
  }
}

/** Tulis atomic: file sementara lalu rename, supaya tidak ada state setengah jadi di Windows. */
export function saveSnapshot(state: StoreShape): void {
  const dir = dataDir();
  const file = storeFile();
  mkdirSync(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  renameSync(tmp, file);
  sweepStaleTmp(dir, file);
}

const STALE_TMP_AGE_MS = 60_000;

/**
 * Sapu sisa `store.json.<pid>.tmp` dari proses yang crash di tengah tulis
 * sebelumnya. Hanya menyentuh file setua STALE_TMP_AGE_MS: tulis yang sedang
 * berlangsung dari proses lain pasti baru, jadi ambang umur memisahkan
 * "crash minggu lalu" dari "sedang ditulis sekarang" tanpa perlu cek proses
 * masih hidup atau tidak (tidak bisa diandalkan lintas platform). Nama file
 * yang tidak cocok pola tidak pernah disentuh; setiap kegagalan stat/unlink
 * (file hilang di antara readdir dan sini — race dengan penulis lain) diabaikan.
 */
function sweepStaleTmp(dir: string, file: string): void {
  const prefix = `${path.basename(file)}.`;
  const now = Date.now();
  for (const entry of readdirSync(dir)) {
    if (!entry.startsWith(prefix) || !entry.endsWith('.tmp')) continue;
    const full = path.join(dir, entry);
    try {
      if (now - statSync(full).mtimeMs < STALE_TMP_AGE_MS) continue;
      unlinkSync(full);
    } catch {
      // Race dengan proses lain (file hilang / sedang ditulis) — biarkan, tidak fatal.
    }
  }
}

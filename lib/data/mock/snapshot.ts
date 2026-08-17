import { mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
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

/**
 * Menyerap skema lama atau bentuk yang salah sama sekali. Vektor realistisnya
 * bukan file korup, tapi schema drift: `.data/store.json` ditulis sebelum
 * task berikutnya menambah tabel baru ke StoreShape (mis. leads/aiUsage belum
 * ada). Tabel yang hilang atau bertipe salah jatuh ke nilai seed-nya masing-
 * masing — developer yang bawa store lama harus dapat aplikasi yang jalan,
 * bukan "Cannot read properties of undefined".
 */
function repairShape(parsed: unknown): StoreShape {
  const seed = seedStore();
  if (!isPlainObject(parsed)) return seed;

  const repaired: Record<string, unknown> = { ...seed };
  for (const key of STORE_KEYS) {
    const value = parsed[key];
    if (Array.isArray(value)) repaired[key] = value;
  }
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

/** Sapu sisa `store.json.<pid>.tmp` dari proses yang crash di tengah tulis sebelumnya. */
function sweepStaleTmp(dir: string, file: string): void {
  const prefix = `${path.basename(file)}.`;
  for (const entry of readdirSync(dir)) {
    if (!entry.startsWith(prefix) || !entry.endsWith('.tmp')) continue;
    try {
      unlinkSync(path.join(dir, entry));
    } catch {
      // Proses lain sedang menulis bersamaan — biarkan, tidak fatal.
    }
  }
}

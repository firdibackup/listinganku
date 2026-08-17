import type { DataStore } from './repo';
import { createMockStore } from './mock/repos';

declare global {
  // eslint-disable-next-line no-var
  var __listingkuStore: DataStore | undefined;
}

/**
 * Singleton disimpan di globalThis supaya HMR Next.js tidak me-reset store
 * di tengah sesi dev. Snapshot ke .data/store.json jadi jaring pengaman kedua.
 */
export function getDataStore(): DataStore {
  const driver = process.env.DATA_DRIVER ?? 'mock';
  if (driver !== 'mock') throw new Error(`DATA_DRIVER "${driver}" belum diimplementasikan.`);
  globalThis.__listingkuStore ??= createMockStore({ persist: true });
  return globalThis.__listingkuStore;
}

// Kode Edge runtime TIDAK BOLEH mengimpor barrel ini: getDataStore() menyentuh
// node:fs (lewat mock store) saat modul dimuat, yang gagal di Edge. Slice 1
// tidak punya middleware Edge, jadi ini dibiarkan sampai subdomain middleware
// benar-benar mendarat dan bentuknya jelas.
export const db: DataStore = getDataStore();
export type { DataStore } from './repo';

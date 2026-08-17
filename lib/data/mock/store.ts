import type { StoreShape } from '../types';
import { seedStore } from '@/fixtures/seed';
import { loadSnapshot, saveSnapshot } from './snapshot';

export interface StoreHandle {
  state: StoreShape;
  commit(): void;
}

export function createStoreHandle(opts: { persist: boolean; initial?: StoreShape }): StoreHandle {
  const state = opts.initial
    ? structuredClone(opts.initial)
    : ((opts.persist ? loadSnapshot() : null) ?? seedStore());

  return {
    state,
    /**
     * Tulis sinkron, tanpa debounce. Ini mock single-user untuk dev lokal atas
     * satu file kecil — beberapa milidetik per tulis jauh lebih murah daripada
     * jendela hilangnya data antara commit dan restart, dan tidak ada exit hook
     * yang bisa menyelamatkan write tertunda dari SIGKILL.
     */
    commit() {
      if (!opts.persist) return;
      saveSnapshot(state);
    },
  };
}

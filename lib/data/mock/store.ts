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

  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    state,
    commit() {
      if (!opts.persist) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => saveSnapshot(state), 50);
    },
  };
}

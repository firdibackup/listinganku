import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { StoreShape } from '../types';

const DIR = path.resolve(process.cwd(), '.data');
const FILE = path.join(DIR, 'store.json');

export function loadSnapshot(): StoreShape | null {
  if (!existsSync(FILE)) return null;
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as StoreShape;
  } catch {
    return null;
  }
}

/** Tulis atomic: file sementara lalu rename, supaya tidak ada state setengah jadi di Windows. */
export function saveSnapshot(state: StoreShape): void {
  mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  renameSync(tmp, FILE);
}

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizeTheme } from '@/lib/landing/themeNames';
import { loadSnapshot } from '@/lib/data/mock/snapshot';
import { seedStore } from '@/fixtures/seed';

describe('normalizeTheme', () => {
  it('melewatkan nilai yang sudah sah apa adanya', () => {
    expect(normalizeTheme('tropicalWarm')).toBe('tropicalWarm');
    // Begitu editorialWhite dibangun di slice 2B, project yang memilihnya
    // HARUS tetap memilikinya. Ini bukan pemetaan menyeluruh.
    expect(normalizeTheme('editorialWhite')).toBe('editorialWhite');
  });

  it('memetakan nilai lama slice 1 ke tema yang sudah dibangun', () => {
    for (const old of ['modern', 'showcase', 'luxury']) {
      expect(normalizeTheme(old)).toBe('tropicalWarm');
    }
  });

  it('memetakan sampah dan nilai kosong ke default', () => {
    for (const bad of ['', null, undefined, 42, {}, 'zzz']) {
      expect(normalizeTheme(bad)).toBe('tropicalWarm');
    }
  });
});

describe('repairShape — perbaikan tingkat baris', () => {
  let tmpDir: string;
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.LISTINGKU_DATA_DIR;
    tmpDir = mkdtempSync(path.join(os.tmpdir(), 'listingku-migrate-'));
    process.env.LISTINGKU_DATA_DIR = tmpDir;
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.LISTINGKU_DATA_DIR;
    else process.env.LISTINGKU_DATA_DIR = originalEnv;
    rmSync(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  it('memperbaiki BARIS project (theme/palette/blocks), bukan hanya tabel yang hilang', () => {
    const shape: Record<string, unknown> = seedStore();
    shape.projects = [{ id: 'p1', userId: 'u1', name: 'X', slug: 'x', theme: 'modern' }];
    writeFileSync(path.join(tmpDir, 'store.json'), JSON.stringify(shape), 'utf8');

    const store = loadSnapshot();
    expect(store?.projects[0].theme).toBe('tropicalWarm');
    expect(store?.projects[0].palette).toBe('tropicalWarm');
    expect(store?.projects[0].blocks).toHaveLength(14);
  });

  it('mempertahankan palet sah yang dipilih agen', () => {
    const shape: Record<string, unknown> = seedStore();
    shape.projects = [{ id: 'p1', userId: 'u1', name: 'X', slug: 'x', theme: 'tropicalWarm', palette: 'premiumDark', blocks: [] }];
    writeFileSync(path.join(tmpDir, 'store.json'), JSON.stringify(shape), 'utf8');

    const store = loadSnapshot();
    expect(store?.projects[0].palette).toBe('premiumDark');
    expect(store?.projects[0].blocks).toHaveLength(14);
  });
});

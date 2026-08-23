import { afterAll, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — pola yang sama dengan project-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const dataDirRel = `.tmp-test-data-brief-store-${process.pid}-${Date.now()}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

import { db } from '@/lib/data';
import { emptyBrief } from '@/lib/data/types';

afterAll(() => rmSync(path.resolve(process.cwd(), dataDirRel), { recursive: true, force: true }));

describe('projects.create — default brief', () => {
  it('project baru selalu punya brief kosong, bukan undefined', async () => {
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Brief', location: '', developer: '',
      description: '', facilities: [],
    });
    expect(p.brief).toEqual(emptyBrief());
    expect(p.projectType).toBeNull();
  });

  it('menerima projectType dan brief saat create', async () => {
    const brief = { ...emptyBrief(), highlights: ['Bebas banjir'] };
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Terisi', location: '', developer: '',
      description: '', facilities: [], projectType: 'kavling', brief,
    });
    expect(p.projectType).toBe('kavling');
    expect(p.brief.highlights).toEqual(['Bebas banjir']);
  });

  it('brief yang disimpan tidak teraliaskan ke pemanggil', async () => {
    const brief = { ...emptyBrief(), highlights: ['Awal'] };
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Clone', location: '', developer: '',
      description: '', facilities: [], brief,
    });
    brief.highlights.push('Disisipkan setelah create');
    const reread = await db.projects.get(p.id);
    expect(reread?.brief.highlights).toEqual(['Awal']);
  });
});

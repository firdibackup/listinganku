import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — vi.hoisted menjamin blok ini jalan sebelum
// import statement lain di file ini. Pola sama dengan tests/unit/media-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-project-actions-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

const session = vi.hoisted(() => ({ userId: 'usr_owner' }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { db } from '@/lib/data';
import {
  createProjectAction, updateProjectAction, publishProjectAction, deleteProjectAction,
} from '@/app/(dashboard)/projects/actions';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

afterEach(() => {
  session.userId = 'usr_owner';
});

describe('createProjectAction', () => {
  it('menolak nama kosong tanpa membuat baris apa pun', async () => {
    const before = (await db.projects.list('usr_owner')).length;
    const result = await createProjectAction({ name: '', location: '', developer: '', description: '', facilities: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.name?.[0]).toBe('Wajib diisi.');
    expect(await db.projects.list('usr_owner')).toHaveLength(before);
  });

  it('membuat project draft milik userId dari sesi, mengabaikan slug yang dikirim klien', async () => {
    const result = await createProjectAction({ name: 'Cluster Aksi', slug: 'apa-saja-yang-dikirim' });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');

    const created = await db.projects.get(result.data.id);
    expect(created?.userId).toBe('usr_owner');
    expect(created?.status).toBe('draft');
    // Slug diturunkan dari nama oleh repo, bukan dari input klien.
    expect(created?.slug).toBe('cluster-aksi');
  });

  it('nama yang sama dikirim dua kali menghasilkan dua project dengan slug berbeda, bukan error', async () => {
    const first = await createProjectAction({ name: 'Cluster Kembar' });
    const second = await createProjectAction({ name: 'Cluster Kembar' });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error('expected ok');

    const firstProject = await db.projects.get(first.data.id);
    const secondProject = await db.projects.get(second.data.id);
    expect(firstProject?.slug).not.toBe(secondProject?.slug);
  });
});

describe('updateProjectAction — upsert per langkah wizard', () => {
  it('create lalu update dengan id yang sama tetap menghasilkan satu baris, bukan baris baru', async () => {
    const before = (await db.projects.list('usr_owner')).length;
    const created = await createProjectAction({ name: 'Cluster Upsert' });
    if (!created.ok) throw new Error('expected ok');

    const updated = await updateProjectAction(created.data.id, {
      name: 'Cluster Upsert', location: 'Bekasi', developer: 'Dev Y', description: '', facilities: ['Taman'],
    });
    expect(updated).toEqual({ ok: true, data: null });

    const rows = await db.projects.list('usr_owner');
    expect(rows).toHaveLength(before + 1);
    const row = rows.find((p) => p.id === created.data.id);
    expect(row?.location).toBe('Bekasi');
    expect(row?.facilities).toEqual(['Taman']);
  });

  it('menolak update ke project milik user lain, tanpa mengubah apa pun', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await createProjectAction({ name: 'Milik Bob', location: 'Awal' });
    if (!bobsProject.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const result = await updateProjectAction(bobsProject.data.id, { location: 'Diubah paksa' });

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    const untouched = await db.projects.get(bobsProject.data.id);
    expect(untouched?.location).toBe('Awal');
  });

  it('menolak update ke project yang tidak pernah ada', async () => {
    const result = await updateProjectAction('prj_tidak_pernah_ada', { location: 'X' });
    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
  });
});

describe('publishProjectAction', () => {
  it('menolak publish tanpa deskripsi terisi', async () => {
    const created = await createProjectAction({ name: 'Cluster Tanpa Deskripsi' });
    if (!created.ok) throw new Error('expected ok');

    const result = await publishProjectAction(created.data.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.description?.[0]).toBe('Wajib diisi.');
    expect((await db.projects.get(created.data.id))?.status).toBe('draft');
  });

  it('mempublikasikan project yang deskripsinya sudah terisi', async () => {
    const created = await createProjectAction({ name: 'Cluster Siap Publish', description: 'Deskripsi lengkap.' });
    if (!created.ok) throw new Error('expected ok');

    const result = await publishProjectAction(created.data.id);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.data.slug).toBe('cluster-siap-publish');

    const published = await db.projects.get(created.data.id);
    expect(published?.status).toBe('published');
    expect(published?.publishedAt).not.toBeNull();
  });

  it('menolak publish project milik user lain', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await createProjectAction({ name: 'Punya Bob Publish', description: 'Isi.' });
    if (!bobsProject.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const result = await publishProjectAction(bobsProject.data.id);

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    expect((await db.projects.get(bobsProject.data.id))?.status).toBe('draft');
  });
});

describe('deleteProjectAction', () => {
  it('menghapus project milik sendiri dan mengembalikan ActionResult ok', async () => {
    const created = await createProjectAction({ name: 'Cluster Hapus' });
    if (!created.ok) throw new Error('expected ok');

    const result = await deleteProjectAction(created.data.id);
    expect(result).toEqual({ ok: true, data: null });
    expect(await db.projects.get(created.data.id)).toBeNull();
  });

  it('menolak hapus milik user lain, tanpa menghapus apa pun', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await createProjectAction({ name: 'Punya Bob Hapus' });
    if (!bobsProject.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const result = await deleteProjectAction(bobsProject.data.id);

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    expect(await db.projects.get(bobsProject.data.id)).not.toBeNull();
  });

  it('menolak hapus project yang tidak pernah ada, tanpa melempar', async () => {
    const result = await deleteProjectAction('prj_tidak_pernah_ada');
    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
  });

  it('kegagalan tak terduga saat menghapus mengembalikan ok:false, bukan melempar (unhandled rejection)', async () => {
    const created = await createProjectAction({ name: 'Cluster Hapus Gagal' });
    if (!created.ok) throw new Error('expected ok');

    const removeSpy = vi.spyOn(db.projects, 'remove').mockRejectedValueOnce(new Error('DB down'));
    const result = await deleteProjectAction(created.data.id);
    removeSpy.mockRestore();

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Gagal menghapus project. Coba lagi.'] } });
    // Baris tidak sungguhan terhapus — remove() gagal sebelum sempat commit.
    expect(await db.projects.get(created.data.id)).not.toBeNull();
  });
});

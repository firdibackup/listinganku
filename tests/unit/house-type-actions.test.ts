import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — vi.hoisted menjamin blok ini jalan sebelum
// import statement lain di file ini. Pola sama dengan tests/unit/project-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-house-type-actions-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

const session = vi.hoisted(() => ({ userId: 'usr_owner' }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import {
  createHouseTypeAction, updateHouseTypeAction, deleteHouseTypeAction,
} from '@/app/(dashboard)/projects/[id]/houseTypeActions';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

const VALID = {
  name: 'Villa', price: '2450000000', landArea: '90', buildingArea: '120',
  bedrooms: '3', bathrooms: '2', carport: '1',
};

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

afterEach(() => {
  session.userId = 'usr_owner';
  vi.mocked(revalidatePath).mockClear();
});

async function makeProject(ownerId = 'usr_owner', name = 'Project Uji') {
  return db.projects.create({
    userId: ownerId, name, location: '', developer: '', description: '', facilities: [],
  });
}

describe('createHouseTypeAction', () => {
  it('menolak harga nol dengan pesan Bahasa Indonesia, tanpa membuat baris apa pun', async () => {
    const project = await makeProject();
    const result = await createHouseTypeAction(project.id, { ...VALID, price: '0' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.price?.[0]).toBe('Harga harus lebih dari nol.');
    expect(await db.houseTypes.listByProject(project.id)).toHaveLength(0);
  });

  it('menolak harga bukan angka dengan pesan Bahasa Indonesia', async () => {
    const project = await makeProject();
    const result = await createHouseTypeAction(project.id, { ...VALID, price: 'abc' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.price?.[0]).toBe('Harga harus berupa angka.');
  });

  it('membuat tipe rumah milik project yang dimiliki sesi', async () => {
    const project = await makeProject();
    const result = await createHouseTypeAction(project.id, VALID);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');

    const created = await db.houseTypes.get(result.data.id);
    expect(created?.projectId).toBe(project.id);
    expect(created?.name).toBe('Villa');
    expect(created?.price).toBe(2_450_000_000);

    // dashboard/page.tsx menghitung houseTypeCount per project (ProjectCard) —
    // tanpa revalidate ini, kartu project di dashboard tetap menampilkan
    // jumlah tipe rumah yang lama sampai reload manual.
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/${project.id}`);
  });

  it('nama tipe yang sama dikirim dua kali pada project yang sama menghasilkan dua baris dengan slug berbeda, bukan error', async () => {
    const project = await makeProject();
    const first = await createHouseTypeAction(project.id, VALID);
    const second = await createHouseTypeAction(project.id, VALID);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error('expected ok');

    const firstType = await db.houseTypes.get(first.data.id);
    const secondType = await db.houseTypes.get(second.data.id);
    expect(firstType?.name).toBe(secondType?.name);
    expect(firstType?.slug).not.toBe(secondType?.slug);
  });

  it('menolak membuat tipe rumah pada project yang tidak pernah ada', async () => {
    const before = await db.houseTypes.listByProject('prj_tidak_pernah_ada');
    const result = await createHouseTypeAction('prj_tidak_pernah_ada', VALID);

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    expect(await db.houseTypes.listByProject('prj_tidak_pernah_ada')).toEqual(before);
  });

  it('menolak membuat tipe rumah pada project milik user lain, tanpa membuat baris apa pun', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await makeProject('usr_bob', 'Punya Bob');

    session.userId = 'usr_mallory';
    const result = await createHouseTypeAction(bobsProject.id, VALID);

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    expect(await db.houseTypes.listByProject(bobsProject.id)).toEqual([]);
  });
});

describe('updateHouseTypeAction', () => {
  it('mengubah tipe rumah pada project yang dimiliki sesi', async () => {
    const project = await makeProject();
    const created = await createHouseTypeAction(project.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    vi.mocked(revalidatePath).mockClear();
    const result = await updateHouseTypeAction(created.data.id, project.id, { ...VALID, price: '3000000000' });
    expect(result).toEqual({ ok: true, data: null });

    const updated = await db.houseTypes.get(created.data.id);
    expect(updated?.price).toBe(3_000_000_000);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('menolak update dengan harga nol, tidak mengubah baris', async () => {
    const project = await makeProject();
    const created = await createHouseTypeAction(project.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    const result = await updateHouseTypeAction(created.data.id, project.id, { ...VALID, price: '0' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.price?.[0]).toBe('Harga harus lebih dari nol.');

    const untouched = await db.houseTypes.get(created.data.id);
    expect(untouched?.price).toBe(2_450_000_000);
  });

  it('menolak update pada project milik user lain, tanpa mengubah apa pun', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await makeProject('usr_bob', 'Punya Bob Update');
    const created = await createHouseTypeAction(bobsProject.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const result = await updateHouseTypeAction(created.data.id, bobsProject.id, { ...VALID, price: '9999' });

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    const untouched = await db.houseTypes.get(created.data.id);
    expect(untouched?.price).toBe(2_450_000_000);
  });

  it('menolak update saat houseTypeId sebenarnya milik project LAIN, walau projectId yang dikirim milik sesi sendiri', async () => {
    // Skenario: Mallory memiliki projectId sendiri (jadi lolos requireOwnedProject),
    // tapi mengirim houseTypeId milik project Bob. Tanpa pengecekan houseType.projectId
    // === projectId, update ini akan lolos dan mengubah baris milik project lain.
    session.userId = 'usr_bob';
    const bobsProject = await makeProject('usr_bob', 'Punya Bob Silang');
    const bobsHouseType = await createHouseTypeAction(bobsProject.id, VALID);
    if (!bobsHouseType.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const mallorysProject = await makeProject('usr_mallory', 'Punya Mallory');

    const result = await updateHouseTypeAction(bobsHouseType.data.id, mallorysProject.id, { ...VALID, price: '1' });

    expect(result.ok).toBe(false);
    const untouched = await db.houseTypes.get(bobsHouseType.data.id);
    expect(untouched?.price).toBe(2_450_000_000);
  });

  it('menolak update pada tipe rumah yang tidak pernah ada', async () => {
    const project = await makeProject();
    const result = await updateHouseTypeAction('hts_tidak_pernah_ada', project.id, VALID);
    expect(result.ok).toBe(false);
  });
});

describe('deleteHouseTypeAction', () => {
  it('menghapus tipe rumah milik project sendiri dan mengembalikan ActionResult ok', async () => {
    const project = await makeProject();
    const created = await createHouseTypeAction(project.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    vi.mocked(revalidatePath).mockClear();
    const result = await deleteHouseTypeAction(created.data.id, project.id);
    expect(result).toEqual({ ok: true, data: null });
    expect(await db.houseTypes.get(created.data.id)).toBeNull();
    // Menghapus tipe rumah mengubah houseTypeCount yang ditampilkan ProjectCard
    // di dashboard — path itu harus ikut di-revalidate, bukan cuma /projects/[id].
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('menolak hapus tipe rumah milik project user lain, tanpa menghapus apa pun', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await makeProject('usr_bob', 'Punya Bob Hapus');
    const created = await createHouseTypeAction(bobsProject.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const result = await deleteHouseTypeAction(created.data.id, bobsProject.id);

    expect(result).toEqual({ ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } });
    expect(await db.houseTypes.get(created.data.id)).not.toBeNull();
  });

  it('menolak hapus saat houseTypeId sebenarnya milik project LAIN, walau projectId yang dikirim milik sesi sendiri', async () => {
    session.userId = 'usr_bob';
    const bobsProject = await makeProject('usr_bob', 'Punya Bob Hapus Silang');
    const bobsHouseType = await createHouseTypeAction(bobsProject.id, VALID);
    if (!bobsHouseType.ok) throw new Error('expected ok');

    session.userId = 'usr_mallory';
    const mallorysProject = await makeProject('usr_mallory', 'Punya Mallory Hapus');

    const result = await deleteHouseTypeAction(bobsHouseType.data.id, mallorysProject.id);

    expect(result.ok).toBe(false);
    expect(await db.houseTypes.get(bobsHouseType.data.id)).not.toBeNull();
  });

  it('menolak hapus tipe rumah yang tidak pernah ada', async () => {
    const project = await makeProject();
    const result = await deleteHouseTypeAction('hts_tidak_pernah_ada', project.id);
    expect(result.ok).toBe(false);
  });

  it('membersihkan referensi houseTypeId di blocks.houseTypes (order/hidden) saat tipe itu dihapus', async () => {
    const project = await makeProject();
    const created = await createHouseTypeAction(project.id, VALID);
    if (!created.ok) throw new Error('expected ok');
    const otherId = 'hts_lain_yang_tetap_ada';

    const current = await db.projects.get(project.id);
    if (!current) throw new Error('expected project');
    const blocks = current.blocks.map((b) =>
      b.type === 'houseTypes'
        ? { ...b, props: { order: [created.data.id, otherId], hidden: [created.data.id] } }
        : b,
    );
    await db.projects.update(project.id, { blocks });

    await deleteHouseTypeAction(created.data.id, project.id);

    const after = await db.projects.get(project.id);
    const houseTypesBlock = after?.blocks.find((b) => b.type === 'houseTypes');
    const props = houseTypesBlock?.props as { order?: string[]; hidden?: string[] } | undefined;
    expect(props?.order).toEqual([otherId]);
    expect(props?.hidden).toEqual([]);
  });

  it('kegagalan tak terduga saat menghapus mengembalikan ok:false, bukan melempar', async () => {
    const project = await makeProject();
    const created = await createHouseTypeAction(project.id, VALID);
    if (!created.ok) throw new Error('expected ok');

    const removeSpy = vi.spyOn(db.houseTypes, 'remove').mockRejectedValueOnce(new Error('DB down'));
    const result = await deleteHouseTypeAction(created.data.id, project.id);
    removeSpy.mockRestore();

    expect(result.ok).toBe(false);
    expect(await db.houseTypes.get(created.data.id)).not.toBeNull();
  });
});

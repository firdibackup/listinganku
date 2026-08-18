import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — pola sama dengan tests/unit/project-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-landing-actions-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { db } from '@/lib/data';
import { submitLeadAction, recordEventAction } from '@/app/(public)/[slug]/actions';
import type { EventType } from '@/lib/data/types';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);
const OWNER = 'usr_owner';
let seq = 0;

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

async function makeProject(status: 'draft' | 'published') {
  seq += 1;
  const created = await db.projects.create({
    userId: OWNER, name: `Cluster Uji ${seq}`, location: 'Jakarta', developer: 'Dev',
    description: 'Deskripsi lengkap.', facilities: [],
  });
  if (status === 'draft') return created;
  return db.projects.update(created.id, { status: 'published', publishedAt: new Date().toISOString() });
}

async function makeHouseType(projectId: string, name = 'Villa') {
  return db.houseTypes.create({
    projectId, name, price: 1_000_000_000, landArea: 90, buildingArea: 100,
    bedrooms: 2, bathrooms: 1, carport: 1,
  });
}

const validInput = (overrides: Record<string, unknown> = {}) => ({
  name: 'Rina Wijaya',
  phone: '081322449087',
  email: '',
  message: 'Tipe Midea masih ada unit hadap timur?',
  ...overrides,
});

describe('submitLeadAction', () => {
  it('menyimpan lead untuk project published dan mencatat event form_submit', async () => {
    const project = await makeProject('published');
    const result = await submitLeadAction(project.id, validInput());

    expect(result).toEqual({ ok: true, data: null });

    const dump = db.__dump();
    const lead = dump.leads.find((l) => l.projectId === project.id);
    expect(lead).toBeDefined();
    expect(lead?.name).toBe('Rina Wijaya');
    expect(lead?.source).toBe('form');
    expect(lead?.houseTypeId).toBeNull();

    const event = dump.events.find((e) => e.projectId === project.id && e.type === 'form_submit');
    expect(event?.count).toBe(1);
  });

  it('menolak nomor telepon tidak valid dengan pesan Indonesia, tanpa membuat lead', async () => {
    const project = await makeProject('published');
    const before = db.__dump().leads.length;

    const result = await submitLeadAction(project.id, validInput({ phone: '123' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.phone?.[0]).toBe('Masukkan nomor WhatsApp yang valid.');
    expect(db.__dump().leads).toHaveLength(before);
  });

  it('menolak nama dan pesan kosong, tanpa membuat lead', async () => {
    const project = await makeProject('published');
    const before = db.__dump().leads.length;

    const result = await submitLeadAction(project.id, validInput({ name: '', message: '' }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.name?.[0]).toBe('Wajib diisi.');
      expect(result.fieldErrors.message?.[0]).toBe('Wajib diisi.');
    }
    expect(db.__dump().leads).toHaveLength(before);
  });

  it('menolak lead ke project draft — tidak boleh ada baris publik yang menunjuk project belum terbit', async () => {
    const draft = await makeProject('draft');
    const before = db.__dump().leads.length;

    const result = await submitLeadAction(draft.id, validInput());

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors._?.[0]).toBe('Project tidak ditemukan.');
    expect(db.__dump().leads).toHaveLength(before);
  });

  it('menolak lead ke project yang tidak pernah ada, tanpa melempar', async () => {
    const before = db.__dump().leads.length;
    const result = await submitLeadAction('prj_tidak_pernah_ada', validInput());

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors._?.[0]).toBe('Project tidak ditemukan.');
    expect(db.__dump().leads).toHaveLength(before);
  });

  it('houseTypeId milik project lain dinormalkan jadi null, bukan menolak seluruh pengiriman', async () => {
    const project = await makeProject('published');
    const otherProject = await makeProject('published');
    const foreignType = await makeHouseType(otherProject.id);

    const result = await submitLeadAction(project.id, validInput({ houseTypeId: foreignType.id }));

    expect(result).toEqual({ ok: true, data: null });
    const lead = db.__dump().leads.find((l) => l.projectId === project.id);
    expect(lead?.houseTypeId).toBeNull();
  });

  it('houseTypeId yang tidak pernah ada dinormalkan jadi null', async () => {
    const project = await makeProject('published');
    const result = await submitLeadAction(project.id, validInput({ houseTypeId: 'hts_tidak_ada' }));

    expect(result).toEqual({ ok: true, data: null });
    const lead = db.__dump().leads.find((l) => l.projectId === project.id);
    expect(lead?.houseTypeId).toBeNull();
  });

  it('houseTypeId milik project yang sama dipertahankan', async () => {
    const project = await makeProject('published');
    const type = await makeHouseType(project.id);

    const result = await submitLeadAction(project.id, validInput({ houseTypeId: type.id }));

    expect(result).toEqual({ ok: true, data: null });
    const lead = db.__dump().leads.find((l) => l.projectId === project.id && l.houseTypeId === type.id);
    expect(lead).toBeDefined();
  });

  it('menyimpan nomor dengan format sama walau diketik dalam tiga gaya berbeda', async () => {
    const shapes = ['081322449087', '+6281322449087', '62 813-2244-9087'];
    const stored: string[] = [];

    for (const phone of shapes) {
      const project = await makeProject('published');
      await submitLeadAction(project.id, validInput({ phone }));
      const lead = db.__dump().leads.find((l) => l.projectId === project.id);
      stored.push(lead!.phone);
    }

    expect(new Set(stored).size).toBe(1);
    expect(stored[0]).toBe('6281322449087');
  });

  it('kegagalan mencatat event form_submit tidak menggagalkan lead yang sudah tersimpan', async () => {
    const project = await makeProject('published');
    const recordSpy = vi.spyOn(db.events, 'record').mockRejectedValueOnce(new Error('store down'));

    const result = await submitLeadAction(project.id, validInput());
    recordSpy.mockRestore();

    expect(result).toEqual({ ok: true, data: null });
    const lead = db.__dump().leads.find((l) => l.projectId === project.id);
    expect(lead).toBeDefined();
  });

  it('mengirim dua kali dengan data sama menghasilkan dua lead terpisah — tidak ada dedup sisi server (keputusan disengaja)', async () => {
    const project = await makeProject('published');
    const input = validInput();

    const first = await submitLeadAction(project.id, input);
    const second = await submitLeadAction(project.id, input);

    expect(first).toEqual({ ok: true, data: null });
    expect(second).toEqual({ ok: true, data: null });
    const leads = db.__dump().leads.filter((l) => l.projectId === project.id);
    expect(leads).toHaveLength(2);
  });
});

describe('recordEventAction', () => {
  it('mencatat event untuk project published', async () => {
    const project = await makeProject('published');
    await recordEventAction(project.id, 'visitor');

    const event = db.__dump().events.find((e) => e.projectId === project.id && e.type === 'visitor');
    expect(event?.count).toBe(1);
  });

  it('tidak mencatat apa pun untuk project draft', async () => {
    const draft = await makeProject('draft');
    const before = db.__dump().events.length;

    await recordEventAction(draft.id, 'visitor');

    expect(db.__dump().events).toHaveLength(before);
  });

  it('tidak mencatat apa pun untuk project yang tidak pernah ada, dan tidak melempar', async () => {
    const before = db.__dump().events.length;
    await expect(recordEventAction('prj_tidak_pernah_ada', 'visitor')).resolves.toBeUndefined();
    expect(db.__dump().events).toHaveLength(before);
  });

  it('mengabaikan type yang bukan salah satu dari tiga nilai yang dikenal', async () => {
    const project = await makeProject('published');
    const before = db.__dump().events.length;

    await recordEventAction(project.id, 'garbage' as unknown as EventType);

    expect(db.__dump().events).toHaveLength(before);
  });

  it('tidak pernah melempar walau projectId berupa nilai bukan string', async () => {
    // Simulasi panggilan action mentah yang bypass TypeScript — argumen bisa
    // apa saja secara runtime. Fire-and-forget tidak boleh pernah melempar.
    await expect(
      recordEventAction({ malicious: true } as unknown as string, 'visitor'),
    ).resolves.toBeUndefined();
  });

  it('houseTypeId acak/tidak valid dinormalkan ke null — jumlah baris event tetap terbatas walau dipanggil berkali-kali', async () => {
    const project = await makeProject('published');
    const typeA = await makeHouseType(project.id, 'Villa');
    const typeB = await makeHouseType(project.id, 'Midea');

    // Simulasi flood: 20 panggilan, houseTypeId acak/berbeda-beda setiap kali
    // (mensimulasikan skrip bermusuhan yang menebak-nebak id).
    for (let i = 0; i < 20; i += 1) {
      await recordEventAction(project.id, 'visitor', `hts_acak_${i}`);
    }
    await recordEventAction(project.id, 'visitor', typeA.id);
    await recordEventAction(project.id, 'visitor', typeB.id);

    const rows = db.__dump().events.filter((e) => e.projectId === project.id && e.type === 'visitor');
    // Terbatas pada: null (semua id acak dinormalkan ke sini) + typeA + typeB = 3 baris,
    // bukan 22 baris — inilah yang mencegah flood houseTypeId membuat tabel events tumbuh tanpa batas.
    expect(rows).toHaveLength(3);
    const nullBucket = rows.find((r) => r.houseTypeId === null);
    expect(nullBucket?.count).toBe(20);
  });
});

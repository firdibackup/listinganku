// @vitest-environment node
//
// Butuh File/Blob dengan arrayBuffer() sungguhan seperti runtime Next.js
// (Node's undici) — jsdom (default proyek ini) hanya menyediakan Blob minimal
// tanpa arrayBuffer()/text()/stream(), jadi berkas ini dipin ke environment
// node. Server action yang diuji tidak menyentuh DOM sama sekali.

import { afterAll, describe, expect, it, vi } from 'vitest';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR dan LISTINGKU_UPLOAD_DIR harus di-set SEBELUM '@/lib/data'
// dan '@/lib/media/actions' dievaluasi (singleton db dibuat sekali saat modul
// dimuat) — vi.hoisted menjamin blok ini jalan sebelum import statement
// lain di file ini, walau posisinya di tengah file secara tekstual.
const { dataDirRel, uploadDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-media-${suffix}`;
  const uploadDirRel = `.tmp-test-uploads-media-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  process.env.LISTINGKU_UPLOAD_DIR = uploadDirRel;
  return { dataDirRel, uploadDirRel };
});

vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => 'usr_test' }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, writeFile: vi.fn(actual.writeFile) };
});

import { writeFile } from 'node:fs/promises';
import { db } from '@/lib/data';
import { deleteMediaAction, setPrimaryMediaAction, uploadMediaAction } from '@/lib/media/actions';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);
const UPLOAD_DIR_ABS = path.resolve(process.cwd(), uploadDirRel);

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
  rmSync(UPLOAD_DIR_ABS, { recursive: true, force: true });
});

let projectCounter = 0;
async function makeProject() {
  projectCounter += 1;
  return db.projects.create({
    userId: 'usr_test',
    name: `Proyek Uji Media ${projectCounter}`,
    location: 'Jakarta',
    developer: 'Dev Uji',
    description: '',
    facilities: [],
  });
}

function photoFile(name = 'foto.jpg', type = 'image/jpeg', bytes = 10): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function formFor(
  file: File,
  projectId: string,
  houseTypeId: string | null = null,
  type: 'photo' | 'floor_plan' = 'photo',
): FormData {
  const data = new FormData();
  data.set('file', file);
  data.set('projectId', projectId);
  data.set('houseTypeId', houseTypeId ?? '');
  data.set('type', type);
  return data;
}

describe('uploadMediaAction', () => {
  it('menyimpan file ke disk (bukan public/uploads sungguhan) dan membuat baris media', async () => {
    const project = await makeProject();
    const result = await uploadMediaAction(formFor(photoFile(), project.id));
    expect(result).toEqual({ ok: true });

    const items = await db.media.listByProject(project.id);
    expect(items).toHaveLength(1);
    expect(items[0].url).toMatch(/^\/uploads\/med_[a-f0-9]{12}\.jpg$/);
    expect(existsSync(path.join(UPLOAD_DIR_ABS, path.basename(items[0].url)))).toBe(true);
  });

  it('foto pertama pada kombinasi project/houseType/type otomatis jadi utama', async () => {
    const project = await makeProject();
    await uploadMediaAction(formFor(photoFile(), project.id));
    const [first] = await db.media.listByProject(project.id);
    expect(first.isPrimary).toBe(true);
  });

  it('mengunggah file yang sama dua kali menghasilkan dua baris media terpisah (tanpa deduplikasi)', async () => {
    const project = await makeProject();
    const file = photoFile('sama.jpg');
    const first = await uploadMediaAction(formFor(file, project.id));
    const second = await uploadMediaAction(formFor(file, project.id));
    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });

    const items = await db.media.listByProject(project.id);
    expect(items).toHaveLength(2);
    expect(items[0].url).not.toBe(items[1].url);
  });

  it('nama file berbahaya (../ dan sejenisnya) tidak pernah dipakai untuk membentuk path di disk', async () => {
    const project = await makeProject();
    const before = new Set(existsSync(UPLOAD_DIR_ABS) ? readdirSync(UPLOAD_DIR_ABS) : []);
    const evil = photoFile('../../../../../../evil.png', 'image/png');

    const result = await uploadMediaAction(formFor(evil, project.id));
    expect(result.ok).toBe(true);

    const after = readdirSync(UPLOAD_DIR_ABS);
    const added = after.filter((name) => !before.has(name));
    // Tepat satu file baru muncul, dan namanya adalah id acak + ekstensi — bukan
    // "evil.png" dan bukan apa pun turunan dari nama asli yang dikirim klien.
    expect(added).toHaveLength(1);
    expect(added[0]).toMatch(/^med_[a-f0-9]{12}\.png$/);
    expect(added[0]).not.toBe('evil.png');

    const [item] = await db.media.listByProject(project.id);
    expect(item.url).toBe(`/uploads/${added[0]}`);
    // Tidak ada file yang bocor ke luar direktori upload (mis. ke root proyek,
    // hasil traversal "../../../../../../evil.png" kalau nama asli sempat dipakai).
    expect(existsSync(path.resolve(process.cwd(), 'evil.png'))).toBe(false);
  });

  it('kegagalan menulis ke disk mengembalikan ok:false tanpa melempar dan tanpa membuat baris media', async () => {
    const project = await makeProject();
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));

    const result = await uploadMediaAction(formFor(photoFile(), project.id));
    expect(result).toEqual({ ok: false, message: 'Gagal menyimpan berkas. Coba lagi.' });
    expect(await db.media.listByProject(project.id)).toEqual([]);
  });

  it('menolak tipe file di luar whitelist tanpa menyentuh disk atau db', async () => {
    const project = await makeProject();
    const before = existsSync(UPLOAD_DIR_ABS) ? readdirSync(UPLOAD_DIR_ABS).length : 0;
    const pdf = photoFile('dokumen.pdf', 'application/pdf');

    const result = await uploadMediaAction(formFor(pdf, project.id));
    expect(result).toEqual({ ok: false, message: 'Format harus JPG, PNG, atau WebP.' });
    expect(await db.media.listByProject(project.id)).toEqual([]);
    expect(existsSync(UPLOAD_DIR_ABS) ? readdirSync(UPLOAD_DIR_ABS).length : 0).toBe(before);
  });

  it('menghitung batas 20 foto per kombinasi project/houseType, bukan per project', async () => {
    const project = await makeProject();
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await uploadMediaAction(formFor(photoFile(`f${i}.jpg`), project.id, 'hts_a'));
      expect(result.ok).toBe(true);
    }
    const blocked = await uploadMediaAction(formFor(photoFile('f21.jpg'), project.id, 'hts_a'));
    expect(blocked).toEqual({ ok: false, message: 'Maksimal 20 foto per tipe rumah.' });

    // houseType lain pada project yang sama punya kuota terpisah.
    const otherHouseType = await uploadMediaAction(formFor(photoFile('lain.jpg'), project.id, 'hts_b'));
    expect(otherHouseType).toEqual({ ok: true });
  });
});

describe('deleteMediaAction', () => {
  it('menghapus baris media dan file fisiknya di disk', async () => {
    const project = await makeProject();
    await uploadMediaAction(formFor(photoFile(), project.id));
    const [item] = await db.media.listByProject(project.id);
    const filePath = path.join(UPLOAD_DIR_ABS, path.basename(item.url));
    expect(existsSync(filePath)).toBe(true);

    await deleteMediaAction(item.id, project.id);

    expect(existsSync(filePath)).toBe(false);
    expect(await db.media.listByProject(project.id)).toEqual([]);
  });

  it('menghapus foto utama memindahkan status utama ke foto berikutnya', async () => {
    const project = await makeProject();
    await uploadMediaAction(formFor(photoFile('a.jpg'), project.id));
    await uploadMediaAction(formFor(photoFile('b.jpg'), project.id));
    const [first, second] = await db.media.listByProject(project.id);
    expect(first.isPrimary).toBe(true);
    expect(second.isPrimary).toBe(false);

    await deleteMediaAction(first.id, project.id);

    const remaining = await db.media.listByProject(project.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
    expect(remaining[0].isPrimary).toBe(true);
  });

  it('menghapus satu-satunya foto tidak menyisakan error atau baris yatim', async () => {
    const project = await makeProject();
    await uploadMediaAction(formFor(photoFile(), project.id));
    const [item] = await db.media.listByProject(project.id);

    await expect(deleteMediaAction(item.id, project.id)).resolves.toBeUndefined();
    expect(await db.media.listByProject(project.id)).toEqual([]);
  });

  it('menghapus mediaId yang tidak ada di project tersebut tidak melempar', async () => {
    const project = await makeProject();
    await expect(deleteMediaAction('med_tidak_ada', project.id)).resolves.toBeUndefined();
  });
});

describe('setPrimaryMediaAction', () => {
  it('memindahkan status utama ke foto yang dipilih dan melepasnya dari foto lama', async () => {
    const project = await makeProject();
    await uploadMediaAction(formFor(photoFile('a.jpg'), project.id));
    await uploadMediaAction(formFor(photoFile('b.jpg'), project.id));
    const [first, second] = await db.media.listByProject(project.id);

    await setPrimaryMediaAction(second.id, project.id);

    const after = await db.media.listByProject(project.id);
    expect(after.find((m) => m.id === first.id)?.isPrimary).toBe(false);
    expect(after.find((m) => m.id === second.id)?.isPrimary).toBe(true);
  });
});

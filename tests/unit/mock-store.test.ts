import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, readFileSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createMockStore } from '@/lib/data/mock/repos';
import { loadSnapshot, saveSnapshot } from '@/lib/data/mock/snapshot';
import { SEED_USER_ID, seedStore } from '@/fixtures/seed';

let db: ReturnType<typeof createMockStore>;
beforeEach(() => {
  db = createMockStore({ persist: false });
});

describe('seed', () => {
  it('menyediakan agen dan tiga project sesuai file design', async () => {
    const agent = await db.agentProfile.get(SEED_USER_ID);
    expect(agent?.siteName).toBe('Audi Property');
    expect(agent?.subdomain).toBe('audi');

    const projects = await db.projects.list(SEED_USER_ID);
    expect(projects.map((p) => p.name)).toEqual([
      'Parkspring Gading', 'Casa Verde Alam Sutera', 'Bintaro Loop Residence',
    ]);
  });

  it('hanya memaparkan project published lewat listPublished', async () => {
    const published = await db.projects.listPublished();
    expect(published.every((p) => p.status === 'published')).toBe(true);
    expect(published.map((p) => p.slug)).not.toContain('casa-verde-alam-sutera');
  });
});

describe('projects', () => {
  it('membuat project draft dengan slug unik dan blok default', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Parkspring Gading', location: 'Serpong',
      developer: 'Paramount', description: 'Cluster baru.', facilities: ['Taman'],
    });
    expect(created.status).toBe('draft');
    expect(created.slug).toBe('parkspring-gading-2');
    expect(created.blocks).toHaveLength(11);
    expect(created.theme).toBe('modern');
  });

  it('menemukan project lewat slug', async () => {
    expect((await db.projects.getBySlug('parkspring-gading'))?.name).toBe('Parkspring Gading');
    expect(await db.projects.getBySlug('tidak-ada')).toBeNull();
  });

  it('menghapus project beserta tipe rumah dan medianya', async () => {
    const target = (await db.projects.list(SEED_USER_ID))[0];
    await db.projects.remove(target.id);
    expect(await db.projects.get(target.id)).toBeNull();
    expect(await db.houseTypes.listByProject(target.id)).toEqual([]);
    expect(await db.media.listByProject(target.id)).toEqual([]);
  });
});

describe('houseTypes', () => {
  it('mengurutkan tipe rumah berdasarkan sortOrder', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    expect((await db.houseTypes.listByProject(project.id)).map((h) => h.name)).toEqual(['Villa', 'Midea', 'Grand']);
  });
});

describe('events', () => {
  it('mengakumulasi hitungan per tipe event', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    const before = (await db.events.countsByProject(project.id)).visitor;
    await db.events.record({ projectId: project.id, type: 'visitor' });
    await db.events.record({ projectId: project.id, type: 'visitor' });
    expect((await db.events.countsByProject(project.id)).visitor).toBe(before + 2);
  });
});

describe('snapshot', () => {
  it('memulihkan state dari serialisasi', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Snapshot', location: 'Bandung',
      developer: '', description: '', facilities: [],
    });
    const restored = createMockStore({ persist: false, initial: db.__dump() });
    expect((await restored.projects.get(created.id))?.name).toBe('Uji Snapshot');
  });
});

// --- Tes tambahan di luar brief: edge case yang benar-benar menggigit di sini. ---

describe('salinan data — baca tidak boleh membocorkan referensi internal', () => {
  it('projects.get() mengembalikan salinan; memutasi hasilnya tidak mengubah store', async () => {
    const project = await db.projects.get('prj_parkspring');
    project!.name = 'DIUBAH LANGSUNG';
    project!.blocks[0].enabled = false;

    const reread = await db.projects.get('prj_parkspring');
    expect(reread?.name).toBe('Parkspring Gading');
    expect(reread?.blocks[0].enabled).toBe(true);
  });

  it('projects.list() mengembalikan salinan; memutasi elemen array tidak bocor ke store', async () => {
    const projects = await db.projects.list(SEED_USER_ID);
    projects[0].facilities.push('Bocor');

    const reread = await db.projects.list(SEED_USER_ID);
    expect(reread[0].facilities).not.toContain('Bocor');
  });

  it('projects.create() mengembalikan salinan; memutasi hasilnya tidak mengubah store', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Salinan', location: 'Bogor',
      developer: '', description: '', facilities: [],
    });
    created.name = 'DIUBAH SETELAH CREATE';

    const reread = await db.projects.get(created.id);
    expect(reread?.name).toBe('Uji Salinan');
  });
});

describe('slug — tabrakan nama dan rute cadangan', () => {
  it('memberi slug berurutan untuk dua project baru dengan nama sama', async () => {
    const first = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Duplikat', location: 'Depok',
      developer: '', description: '', facilities: [],
    });
    const second = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Duplikat', location: 'Depok',
      developer: '', description: '', facilities: [],
    });
    expect(first.slug).toBe('uji-duplikat');
    expect(second.slug).toBe('uji-duplikat-2');
  });

  it('menghindari slug yang bentrok dengan rute aplikasi (reserved)', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Dashboard', location: 'Jakarta',
      developer: '', description: '', facilities: [],
    });
    expect(created.slug).toBe('dashboard-2');
  });
});

describe('projects.remove — cascading penuh', () => {
  it('menghapus tipe rumah dan media milik project, termasuk media yang baru dibuat', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    await db.media.create({
      userId: SEED_USER_ID, projectId: project.id, houseTypeId: null,
      type: 'photo', url: '/uploads/contoh.jpg', size: 1024,
    });
    expect(await db.media.listByProject(project.id)).toHaveLength(1);
    expect(await db.houseTypes.listByProject(project.id)).not.toEqual([]);

    await db.projects.remove(project.id);

    expect(await db.projects.get(project.id)).toBeNull();
    expect(await db.houseTypes.listByProject(project.id)).toEqual([]);
    expect(await db.media.listByProject(project.id)).toEqual([]);
  });
});

describe('update pada baris yang tidak ada', () => {
  it('projects.update menolak dengan error saat id tidak ditemukan', async () => {
    await expect(db.projects.update('prj_tidak_ada', { name: 'X' })).rejects.toThrow();
  });

  it('houseTypes.update menolak dengan error saat id tidak ditemukan', async () => {
    await expect(db.houseTypes.update('hts_tidak_ada', { name: 'X' })).rejects.toThrow();
  });

  it('agentProfile.update menolak dengan error saat userId tidak ditemukan', async () => {
    await expect(db.agentProfile.update('usr_tidak_ada', { fullName: 'X' })).rejects.toThrow();
  });
});

describe('snapshot berkas (.data/store.json) — persist: true', () => {
  const DATA_DIR = path.resolve(process.cwd(), '.data');
  const SNAPSHOT_FILE = path.join(DATA_DIR, 'store.json');
  let backup: string | null = null;

  // Lindungi state nyata dari dev server / run sebelumnya: simpan sebelum tes, pulihkan sesudahnya.
  beforeAll(() => {
    backup = existsSync(SNAPSHOT_FILE) ? readFileSync(SNAPSHOT_FILE, 'utf8') : null;
  });

  afterEach(() => {
    rmSync(SNAPSHOT_FILE, { force: true });
  });

  afterAll(() => {
    if (backup !== null) {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(SNAPSHOT_FILE, backup, 'utf8');
    } else {
      rmSync(SNAPSHOT_FILE, { force: true });
      try {
        rmdirSync(DATA_DIR);
      } catch {
        // Direktori tidak kosong atau sudah tidak ada — biarkan.
      }
    }
  });

  it('memuat kembali data yang ditulis saveSnapshot pada run sebelumnya', () => {
    const state = seedStore();
    state.projects[0].name = 'Dari Snapshot Sebelumnya';
    saveSnapshot(state);

    const loaded = loadSnapshot();
    expect(loaded?.projects[0].name).toBe('Dari Snapshot Sebelumnya');
  });

  it('createMockStore({ persist: true }) memuat state dari snapshot berkas yang sudah ada', async () => {
    const state = seedStore();
    state.projects[0].name = 'Nama Dari Disk';
    saveSnapshot(state);

    const persisted = createMockStore({ persist: true });
    const reloaded = await persisted.projects.get(state.projects[0].id);
    expect(reloaded?.name).toBe('Nama Dari Disk');
  });

  it('berkas hilang membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    rmSync(SNAPSHOT_FILE, { force: true });
    expect(loadSnapshot()).toBeNull();
  });

  it('berkas kosong membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SNAPSHOT_FILE, '', 'utf8');
    expect(loadSnapshot()).toBeNull();
  });

  it('berkas JSON rusak membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SNAPSHOT_FILE, '{ "projects": [ INI BUKAN JSON', 'utf8');
    expect(loadSnapshot()).toBeNull();
  });

  it('createMockStore({ persist: true }) jatuh kembali ke seed saat berkas rusak, tidak crash', async () => {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SNAPSHOT_FILE, 'bukan json sama sekali', 'utf8');

    const fallback = createMockStore({ persist: true });
    const agent = await fallback.agentProfile.get(SEED_USER_ID);
    expect(agent?.siteName).toBe('Audi Property');
  });
});

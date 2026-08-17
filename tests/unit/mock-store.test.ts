import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import os from 'node:os';
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
    // Seed punya 3 project, 2 published (Parkspring, Bintaro) dan 1 draft (Casa Verde).
    // Tanpa toHaveLength ini lolos meski listPublished() mengembalikan array kosong.
    expect(published).toHaveLength(2);
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
    await db.events.record({ projectId: project.id, type: 'visitor' });
    await db.events.record({ projectId: project.id, type: 'visitor' });
    // Seed prj_parkspring sudah punya 1.420 visitor (evt_1, lihat fixtures/seed.ts).
    // Literal, bukan diturunkan dari pemanggilan countsByProject sebelum tindakan.
    expect((await db.events.countsByProject(project.id)).visitor).toBe(1422);
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

describe('salinan data — masukan (write) juga tidak boleh dialiaskan ke store', () => {
  it('projects.create tidak mengaliaskan array facilities milik pemanggil', async () => {
    const facilities = ['Kolam renang'];
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Alias Masuk', location: 'Cibubur',
      developer: '', description: '', facilities,
    });
    facilities.push('Bocor Masuk');

    const reread = await db.projects.get(created.id);
    expect(reread?.facilities).not.toContain('Bocor Masuk');
  });

  it('projects.update tidak mengaliaskan array blocks dari patch pemanggil', async () => {
    const target = (await db.projects.list(SEED_USER_ID))[0];
    const blocks = target.blocks; // sudah salinan lewat clone exit-point, aman dipakai sbg basis patch
    const updated = await db.projects.update(target.id, { blocks });
    blocks[0].enabled = false;

    const reread = await db.projects.get(target.id);
    expect(reread?.blocks[0].enabled).toBe(true);
    expect(updated.blocks[0].enabled).toBe(true);
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

describe('update tidak boleh mengubah primary key atau slug', () => {
  it('projects.update mengabaikan id dan slug pada patch', async () => {
    const target = (await db.projects.list(SEED_USER_ID))[0];
    const updated = await db.projects.update(target.id, {
      id: 'prj_bajakan', slug: 'dashboard', location: 'Lokasi baru',
    });

    expect(updated.id).toBe(target.id);
    expect(updated.slug).toBe(target.slug);
    expect(updated.location).toBe('Lokasi baru');

    const bySlug = await db.projects.getBySlug(target.slug);
    expect(bySlug?.id).toBe(target.id);
    expect(await db.projects.get('prj_bajakan')).toBeNull();
  });

  it('houseTypes.update mengabaikan id dan slug pada patch', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    const target = (await db.houseTypes.listByProject(project.id))[0];
    const updated = await db.houseTypes.update(target.id, {
      id: 'hts_bajakan', slug: 'grand', bedrooms: 5,
    });

    expect(updated.id).toBe(target.id);
    expect(updated.slug).toBe(target.slug);
    expect(updated.bedrooms).toBe(5);
    expect(await db.houseTypes.get('hts_bajakan')).toBeNull();
  });
});

describe('projects.remove — cascading penuh', () => {
  it('membersihkan SEMUA tabel yang mereferensikan project yang dihapus', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    await db.media.create({
      userId: SEED_USER_ID, projectId: project.id, houseTypeId: null,
      type: 'photo', url: '/uploads/contoh.jpg', size: 1024,
    });
    await db.leads.create({
      projectId: project.id, houseTypeId: null, name: 'Budi', phone: '081200000000',
      email: null, message: 'Tanya harga', source: 'form',
    });
    await db.aiUsage.record({
      userId: SEED_USER_ID, projectId: project.id, model: 'gemini-2.5-flash',
      promptTokens: 100, completionTokens: 200, latencyMs: 900, success: true, error: null,
    });
    await db.events.record({ projectId: project.id, type: 'visitor' });
    expect(await db.houseTypes.listByProject(project.id)).not.toEqual([]);

    await db.projects.remove(project.id);

    const dump = db.__dump();
    expect(dump.projects.some((p) => p.id === project.id)).toBe(false);
    expect(dump.houseTypes.some((h) => h.projectId === project.id)).toBe(false);
    expect(dump.media.some((m) => m.projectId === project.id)).toBe(false);
    expect(dump.events.some((e) => e.projectId === project.id)).toBe(false);
    expect(dump.leads.some((l) => l.projectId === project.id)).toBe(false);
    expect(dump.aiUsage.some((u) => u.projectId === project.id)).toBe(false);
  });
});

describe('houseTypes.remove — cascading', () => {
  it('membersihkan media, events, dan leads yang mereferensikan tipe rumah yang dihapus', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    const houseType = (await db.houseTypes.listByProject(project.id))[0];

    await db.media.create({
      userId: SEED_USER_ID, projectId: project.id, houseTypeId: houseType.id,
      type: 'photo', url: '/uploads/tipe.jpg', size: 2048,
    });
    await db.leads.create({
      projectId: project.id, houseTypeId: houseType.id, name: 'Siti', phone: '081300000000',
      email: null, message: 'Minat tipe ini', source: 'whatsapp',
    });
    await db.events.record({ projectId: project.id, houseTypeId: houseType.id, type: 'visitor' });

    await db.houseTypes.remove(houseType.id);

    const dump = db.__dump();
    expect(dump.houseTypes.some((h) => h.id === houseType.id)).toBe(false);
    expect(dump.media.some((m) => m.houseTypeId === houseType.id)).toBe(false);
    expect(dump.events.some((e) => e.houseTypeId === houseType.id)).toBe(false);
    expect(dump.leads.some((l) => l.houseTypeId === houseType.id)).toBe(false);
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

describe('snapshot berkas — persist: true', () => {
  // LISTINGKU_DATA_DIR mengarahkan store ke direktori OS temp sekali pakai,
  // bukan .data/ milik developer — jadi tidak butuh dance backup/restore, dan
  // Ctrl-C di tengah tes tidak bisa merusak data nyata karena tidak pernah disentuh.
  let tmpDir: string;
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.LISTINGKU_DATA_DIR;
    tmpDir = mkdtempSync(path.join(os.tmpdir(), 'listingku-store-'));
    process.env.LISTINGKU_DATA_DIR = tmpDir;
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.LISTINGKU_DATA_DIR;
    else process.env.LISTINGKU_DATA_DIR = originalEnv;
    rmSync(tmpDir, { recursive: true, force: true });
  });

  const snapshotFile = () => path.join(tmpDir, 'store.json');

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

  it('create() lewat store persist:true langsung ada di berkas untuk instance store baru', async () => {
    const first = createMockStore({ persist: true });
    const created = await first.projects.create({
      userId: SEED_USER_ID, name: 'Uji Persist End-to-End', location: 'Tangerang',
      developer: '', description: '', facilities: [],
    });

    // Instance kedua, independen, dibangun dari berkas yang sama — membuktikan
    // commit() menulis sinkron, bukan hilang di jendela debounce.
    const second = createMockStore({ persist: true });
    const reread = await second.projects.get(created.id);
    expect(reread?.name).toBe('Uji Persist End-to-End');
  });

  it('berkas hilang membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    rmSync(snapshotFile(), { force: true });
    expect(loadSnapshot()).toBeNull();
  });

  it('berkas kosong membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), '', 'utf8');
    expect(loadSnapshot()).toBeNull();
  });

  it('berkas JSON rusak (syntax error) membuat loadSnapshot mengembalikan null, bukan melempar error', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), '{ "projects": [ INI BUKAN JSON', 'utf8');
    expect(loadSnapshot()).toBeNull();
  });

  it('createMockStore({ persist: true }) jatuh kembali ke seed saat berkas rusak, tidak crash', async () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), 'bukan json sama sekali', 'utf8');

    const fallback = createMockStore({ persist: true });
    const agent = await fallback.agentProfile.get(SEED_USER_ID);
    expect(agent?.siteName).toBe('Audi Property');
  });

  it('JSON valid berupa array tidak berbentuk StoreShape jatuh kembali ke seed penuh', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), '[]', 'utf8');
    expect(loadSnapshot()).toEqual(seedStore());
  });

  it('JSON valid berupa objek kosong jatuh kembali ke seed penuh (semua tabel hilang)', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), '{}', 'utf8');
    expect(loadSnapshot()).toEqual(seedStore());
  });

  it('field bertipe salah (projects sebagai string) diganti nilai seed, bukan bikin crash', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), JSON.stringify({ projects: 'nope' }), 'utf8');

    const loaded = loadSnapshot();
    expect(loaded?.projects).toEqual(seedStore().projects);
  });

  it('JSON valid berupa string murni jatuh kembali ke seed penuh', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), JSON.stringify('halo'), 'utf8');
    expect(loadSnapshot()).toEqual(seedStore());
  });

  it('JSON valid berupa angka murni jatuh kembali ke seed penuh', () => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(snapshotFile(), '123', 'utf8');
    expect(loadSnapshot()).toEqual(seedStore());
  });

  it('snapshot skema lama (tanpa leads/aiUsage) tidak crash; tabel yang hilang default ke array kosong', () => {
    mkdirSync(tmpDir, { recursive: true });
    const oldShape: Record<string, unknown> = seedStore();
    delete oldShape.leads;
    delete oldShape.aiUsage;
    writeFileSync(snapshotFile(), JSON.stringify(oldShape), 'utf8');

    const loaded = loadSnapshot();
    expect(loaded?.leads).toEqual([]);
    expect(loaded?.aiUsage).toEqual([]);
    expect(loaded?.projects.map((p) => p.name)).toEqual(seedStore().projects.map((p) => p.name));
  });

  it('leads.listByUser dan aiUsage.record tetap jalan lewat store yang dipulihkan dari skema lama', async () => {
    mkdirSync(tmpDir, { recursive: true });
    const oldShape: Record<string, unknown> = seedStore();
    delete oldShape.leads;
    delete oldShape.aiUsage;
    writeFileSync(snapshotFile(), JSON.stringify(oldShape), 'utf8');

    const store = createMockStore({ persist: true });
    await expect(store.leads.listByUser(SEED_USER_ID)).resolves.toEqual([]);
    await expect(store.aiUsage.record({
      userId: SEED_USER_ID, projectId: 'prj_parkspring', model: 'gemini-2.5-flash',
      promptTokens: 10, completionTokens: 20, latencyMs: 500, success: true, error: null,
    })).resolves.toBeUndefined();
  });

  it('saveSnapshot membersihkan .tmp basi (mtime lama), tapi tidak menyentuh .tmp yang baru saja ditulis', () => {
    mkdirSync(tmpDir, { recursive: true });
    const staleTmp = path.join(tmpDir, 'store.json.11111.tmp');
    const freshTmp = path.join(tmpDir, 'store.json.22222.tmp');
    writeFileSync(staleTmp, '{}', 'utf8');
    writeFileSync(freshTmp, '{}', 'utf8');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000);
    utimesSync(staleTmp, fiveMinutesAgo, fiveMinutesAgo);
    // freshTmp dibiarkan bermtime "sekarang" — mensimulasikan proses lain yang sedang menulis.

    saveSnapshot(seedStore());

    const remainingTmp = readdirSync(tmpDir).filter((f) => f.endsWith('.tmp'));
    expect(remainingTmp).not.toContain(path.basename(staleTmp));
    // Tanpa cek umur, sweep lama menghapus SEMUA .tmp tanpa pandang bulu — termasuk
    // yang sedang ditulis proses lain. Baris ini adalah inti perbaikannya.
    expect(remainingTmp).toContain(path.basename(freshTmp));
  });

  it('repairShape membuang elemen null dalam array; baris valid selamat dan projects.list() tidak crash', async () => {
    mkdirSync(tmpDir, { recursive: true });
    const validProject = seedStore().projects[0];
    writeFileSync(snapshotFile(), JSON.stringify({ projects: [null, validProject] }), 'utf8');

    const loaded = loadSnapshot();
    expect(loaded?.projects).toHaveLength(1);
    expect(loaded?.projects[0]?.id).toBe(validProject.id);

    const store = createMockStore({ persist: true });
    const listed = await store.projects.list(validProject.userId);
    expect(listed.map((p) => p.id)).toContain(validProject.id);
  });
});

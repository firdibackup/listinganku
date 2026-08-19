import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// Pola sama dengan house-type-actions.test.ts: LISTINGKU_DATA_DIR harus di-set
// sebelum '@/lib/data' dievaluasi, karena db adalah singleton level modul.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-settings-actions-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

const session = vi.hoisted(() => ({ userId: 'usr_audi' }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { db } from '@/lib/data';
import {
  updateAppearanceAction, updateProfileAction, updateGeneralAction, setProfilePublishedAction,
} from '@/app/(dashboard)/settings/actions';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

afterEach(() => { session.userId = 'usr_audi'; });
afterAll(() => { rmSync(DATA_DIR_ABS, { recursive: true, force: true }); });

describe('updateAppearanceAction', () => {
  it('menyimpan tema, aksen, dan nama situs', async () => {
    const res = await updateAppearanceAction({
      theme: 'Luxury', colorScheme: 'Hijau', siteName: 'Audi Realty',
    });

    expect(res.ok).toBe(true);
    const agent = await db.agentProfile.get('usr_audi');
    expect(agent?.theme).toBe('Luxury');
    expect(agent?.colorScheme).toBe('Hijau');
    expect(agent?.siteName).toBe('Audi Realty');
  });

  it('mengembalikan fieldErrors tanpa menyentuh data saat tema tidak dikenal', async () => {
    const before = await db.agentProfile.get('usr_audi');

    const res = await updateAppearanceAction({
      theme: 'Brutalist', colorScheme: 'Oranye', siteName: 'X',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors.theme).toBeTruthy();
    expect((await db.agentProfile.get('usr_audi'))?.theme).toBe(before?.theme);
  });
});

describe('updateProfileAction', () => {
  it('menyimpan about, statistik, wilayah spesialis, dan WhatsApp ternormalisasi', async () => {
    const res = await updateProfileAction({
      about: 'Agen properti Gading Serpong.', closings: '64', listings: '18',
      specialistArea: 'Gading Serpong', whatsapp: '0812-8899-4410',
    });

    expect(res.ok).toBe(true);
    const agent = await db.agentProfile.get('usr_audi');
    expect(agent?.about).toBe('Agen properti Gading Serpong.');
    expect(agent?.stats.closings).toBe(64);
    expect(agent?.stats.listings).toBe(18);
    expect(agent?.specialistArea).toBe('Gading Serpong');
    // Disimpan kanonik seperti leads.phone, bukan apa adanya dari form.
    expect(agent?.whatsapp).toBe('6281288994410');
  });

  it('mempertahankan stats.years yang tidak ada di form ini', async () => {
    const before = await db.agentProfile.get('usr_audi');
    await updateProfileAction({
      about: '', closings: '1', listings: '2', specialistArea: '', whatsapp: '081288994410',
    });

    // Form Profil tidak punya field "years"; menulis ulang objek stats secara
    // utuh akan menghapusnya diam-diam.
    expect((await db.agentProfile.get('usr_audi'))?.stats.years).toBe(before?.stats.years);
  });

  it('menolak WhatsApp tidak valid', async () => {
    const res = await updateProfileAction({
      about: '', closings: '0', listings: '0', specialistArea: '', whatsapp: '123',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors.whatsapp).toBeTruthy();
  });
});

describe('updateGeneralAction', () => {
  it('menyimpan preferensi notifikasi yang dinyalakan dan dimatikan', async () => {
    await updateGeneralAction({ notifyOnLead: 'on' });
    expect((await db.agentProfile.get('usr_audi'))?.notifyOnLead).toBe(true);

    // Checkbox yang tidak dicentang tidak mengirim field sama sekali.
    await updateGeneralAction({});
    expect((await db.agentProfile.get('usr_audi'))?.notifyOnLead).toBe(false);
  });
});

describe('setProfilePublishedAction', () => {
  it('bisa unpublish dan publish kembali — bukan jalan satu arah', async () => {
    await setProfilePublishedAction(false);
    expect((await db.agentProfile.get('usr_audi'))?.isPublished).toBe(false);

    await setProfilePublishedAction(true);
    expect((await db.agentProfile.get('usr_audi'))?.isPublished).toBe(true);
  });
});

describe('otorisasi', () => {
  it('gagal rapi tanpa menulis apa pun saat sesi menunjuk user tanpa agent profile', async () => {
    session.userId = 'usr_hantu';

    const res = await updateAppearanceAction({
      theme: 'Modern', colorScheme: 'Oranye', siteName: 'Situs Hantu',
    });

    expect(res.ok).toBe(false);
    expect(await db.agentProfile.get('usr_hantu')).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = { value: undefined as string | undefined };
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'listingku_session' && store.value ? { value: store.value } : undefined),
    set: (name: string, value: string) => { if (name === 'listingku_session') store.value = value; },
    delete: () => { store.value = undefined; },
  }),
}));

import { getSessionUserId, setSession, clearSession, requireSessionUserId } from '@/lib/session';

beforeEach(() => { store.value = undefined; });

describe('sesi', () => {
  it('mengembalikan null saat belum login', async () => {
    expect(await getSessionUserId()).toBeNull();
  });

  it('menyimpan dan membaca userId', async () => {
    await setSession('usr_audi');
    expect(await getSessionUserId()).toBe('usr_audi');
    await clearSession();
    expect(await getSessionUserId()).toBeNull();
  });

  it('requireSessionUserId melempar saat belum login', async () => {
    await expect(requireSessionUserId()).rejects.toThrow(/Sesi tidak ditemukan/);
  });
});

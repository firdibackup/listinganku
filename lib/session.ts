import { cookies } from 'next/headers';

/**
 * Sesi dummy slice 1: TIDAK ADA autentikasi sungguhan di sini. Ini hanyalah
 * cookie berisi userId polos, dibaca/ditulis langsung tanpa token yang
 * ditandatangani atau diverifikasi. Jangan jadikan pola ini acuan keamanan —
 * saat Supabase Auth masuk, modul ini diganti seluruhnya.
 */
export const SESSION_COOKIE = 'listingku_session';

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Sesi tidak ditemukan.');
  return userId;
}

export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

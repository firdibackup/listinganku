'use server';

import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';
import { SEED_USER_ID } from '@/fixtures/seed';

/**
 * Sesi dummy slice 1: tidak ada auth sungguhan. Tombol mana pun menandatangani
 * agen yang di-seed. Saat Supabase Auth masuk, hanya fungsi ini yang berubah.
 */
export async function signInAction(): Promise<void> {
  await setSession(SEED_USER_ID);
  redirect('/dashboard');
}

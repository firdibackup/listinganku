import { NextResponse } from 'next/server';
import { searchRegions } from '@/lib/places/regions';

/**
 * Dataset statis, jadi tidak ada sesi maupun store yang disentuh — route ini
 * TIDAK boleh mengimpor `@/lib/data` (barrel-nya menyentuh node:fs saat modul
 * dimuat).
 *
 * Membaca `request.url` seharusnya sudah membuat route ini dinamis. Verifikasi
 * lewat tabel rute `next build` (`ƒ` dinamis vs `○` statis) — `next dev` tidak
 * akan pernah menampakkan kekeliruannya karena dev selalu re-eksekusi.
 */
export function GET(request: Request): NextResponse {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  return NextResponse.json({ results: searchRegions(q) });
}

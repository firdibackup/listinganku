'use client';

import { useEffect } from 'react';
import { recordEventAction } from '@/app/(public)/[slug]/actions';

/**
 * Mencatat satu event `visitor` per project per sesi tab. Dipasang di landing
 * publik alih-alih mencatat di Server Component (page.tsx): pageview di SSR
 * bisa dihitung ganda oleh cache/prefetch Next, sementara komponen klien ini
 * hanya berjalan sekali di browser pengunjung sungguhan.
 *
 * Kunci per-project di sessionStorage menahan refresh/navigasi ulang dalam tab
 * yang sama supaya tidak menggelembungkan hitungan; membuka tab/sesi baru
 * dihitung sebagai kunjungan baru, yang memang perilaku yang diinginkan.
 * Tidak merender apa pun ke DOM.
 */
export function PageViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const key = `lk_pv_${projectId}`;
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(key) !== null;
      if (!alreadySeen) sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage bisa tidak tersedia (mode privasi ketat); jangan sampai
      // itu membuat komponen melempar — cukup catat sekali per mount.
      alreadySeen = false;
    }
    if (alreadySeen) return;
    void recordEventAction(projectId, 'visitor');
  }, [projectId]);

  return null;
}

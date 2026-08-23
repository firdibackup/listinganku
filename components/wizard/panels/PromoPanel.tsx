'use client';

import { Input } from '@/components/ds';
import type { BriefPromo } from '@/lib/data/types';
import type { PanelProps } from './HeroPanel';

const KOSONG: BriefPromo = {
  name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '',
};

/**
 * Memecah teks textarea jadi array butir promo. Baris TERAKHIR (yang sedang
 * diketik) sengaja TIDAK di-trim/filter di sini — kalau setiap baris
 * diperlakukan sama, spasi atau baris-baru yang BARU SAJA diketik langsung
 * tersapu balik oleh trim()/filter() sebelum karakter berikutnya sempat
 * diketik (elemen controlled menulis ulang DOM ke `value` baru pada render
 * berikutnya, yang terjadi SEBELUM keystroke fisik selanjutnya tiba) —
 * ketikan multi-kata ("Free BPHTB") atau multi-baris jadi rusak jadi
 * "FreeBPHTB" walau state parent sudah benar tersambung ke `onChange`
 * (dibuktikan lewat harness ber-state sungguhan di tes, bukan mock).
 * Baris SEBELUM baris terakhir sudah "selesai" (kursor sudah pindah),
 * aman dibersihkan seperti biasa. `parsePromoLines` diekspor supaya
 * dites langsung tanpa perlu simulasi ketikan.
 */
export function parsePromoLines(raw: string): string[] {
  const lines = raw.split('\n');
  const last = lines.length - 1;
  return lines
    .map((s, i) => (i === last ? s : s.trim()))
    .filter((s, i) => i === last || s.length > 0);
}

export function PromoPanel({ brief, onChange }: PanelProps) {
  const promo = brief.promo;
  const set = (patch: Partial<BriefPromo>) => onChange({ promo: { ...(promo ?? KOSONG), ...patch } });

  return (
    <>
      <label className="wz-panel__opt">
        <input
          type="checkbox"
          checked={promo !== null}
          onChange={() => onChange({ promo: promo ? null : { ...KOSONG } })}
        />
        <span>Ada promo</span>
      </label>

      {promo ? (
        <>
          <Input label="Nama promo" placeholder="Contoh: Free BPHTB" value={promo.name} onChange={(e) => set({ name: e.target.value })} />
          <Input
            label="Butir promo" textarea rows={4}
            hint="Satu butir per baris. Inilah yang tampil di halaman."
            value={promo.items.join('\n')}
            onChange={(e) => set({ items: parsePromoLines(e.target.value) })}
            // Baris terakhir yang mungkin masih kosong/berspasi (belum diisi
            // saat onChange terakhir berjalan) dirapikan begitu field
            // ditinggalkan — supaya baris kosong yang tersisa tidak lolos ke
            // penyimpanan (BriefPromoSchema menolak butir kosong).
            onBlur={() => set({ items: promo.items.map((s) => s.trim()).filter(Boolean) })}
          />
          <Input label="Catatan" placeholder="Contoh: Berlaku untuk pemesanan bulan ini." value={promo.detail} onChange={(e) => set({ detail: e.target.value })} />
          <Input
            label="Berlaku sampai" type="date"
            value={promo.validUntil ?? ''}
            onChange={(e) => set({ validUntil: e.target.value || null })}
          />
          <Input label="DP" placeholder="Contoh: 10%" value={promo.dpText} onChange={(e) => set({ dpText: e.target.value })} />
          <Input label="Cicilan" placeholder="Contoh: Rp 18 jt/bln" value={promo.installmentText} onChange={(e) => set({ installmentText: e.target.value })} />
        </>
      ) : null}
    </>
  );
}

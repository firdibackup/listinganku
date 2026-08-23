'use client';

import { Input } from '@/components/ds';
import type { BriefPromo } from '@/lib/data/types';
import type { PanelProps } from './HeroPanel';

const KOSONG: BriefPromo = {
  name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '',
};

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
            // Uncontrolled dengan sengaja: kalau di-`value`-kan dari promo.items,
            // React menulis ulang DOM textarea ke prop lama setiap kali onChange
            // TIDAK memicu re-render dengan value baru (mis. di unit test yang
            // memakai mock onChange) — tiap keystroke saling menghapus keystroke
            // sebelumnya dan hanya karakter terakhir yang tersimpan. defaultValue
            // membiarkan browser yang memegang teksnya; kita hanya membaca lewat
            // e.target.value saat berubah.
            label="Butir promo" textarea rows={4}
            hint="Satu butir per baris. Inilah yang tampil di halaman."
            defaultValue={promo.items.join('\n')}
            onChange={(e) => set({ items: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
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

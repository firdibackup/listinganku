'use client';

import { Button, Input } from '@/components/ds';
import { NEARBY_CATEGORIES, NEARBY_CATEGORY_LABELS } from '@/lib/schemas';
import { formatRegion } from '@/lib/places/regions';
import type { NearbyCategory, NearbyItem } from '@/lib/data/types';
import type { PanelProps } from './HeroPanel';

export function LocationPanel({ brief, onChange }: PanelProps) {
  const set = (i: number, patch: Partial<NearbyItem>) => {
    const next = [...brief.nearby];
    next[i] = { ...next[i], ...patch };
    onChange({ nearby: next });
  };

  const setAddress = (address: string) =>
    onChange({
      location: { ...(brief.location ?? { area: '', district: '', city: '', province: '' }), address },
    });

  const adaTanpaMenit = brief.nearby.some((n) => n.minutes === null);

  return (
    <>
      {brief.location ? (
        <p style={{ fontSize: 14 }}>{formatRegion(brief.location)}</p>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>Lokasi dipilih di langkah sebelumnya.</p>
      )}

      <Input
        label="Alamat lengkap"
        hint="Opsional. Data wilayah berhenti di kecamatan, jadi alamat jalan diketik di sini."
        placeholder="Contoh: Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240"
        value={brief.location?.address ?? ''}
        onChange={(e) => setAddress(e.target.value)}
      />

      <span className="lw-label">Dekat dengan</span>
      {brief.nearby.map((n, i) => (
        <div key={i} className="wz-panel__row">
          <label className="ds-field">
            <span className="ds-field__label">{`Kategori ${i + 1}`}</span>
            <select
              className="ds-field__input"
              value={n.category}
              onChange={(e) => set(i, { category: e.target.value as NearbyCategory })}
            >
              {NEARBY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{NEARBY_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </label>
          <Input label={`Nama tempat ${i + 1}`} placeholder="Contoh: Tol Jakarta–Merak" value={n.name} onChange={(e) => set(i, { name: e.target.value })} />
          <Input
            label={`Menit ${i + 1}`}
            type="number" min={1} inputMode="numeric"
            placeholder="Kosongkan jika tidak tahu"
            value={n.minutes === null ? '' : String(n.minutes)}
            // Kosong menjadi null, BUKAN 0. Nol akan tampil sebagai "0 mnt" di
            // halaman — mengarang angka persis seperti yang desain ini cegah.
            onChange={(e) => set(i, { minutes: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus tempat ${i + 1}`}
            onClick={() => onChange({ nearby: brief.nearby.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        variant="link" size="sm"
        onClick={() => onChange({ nearby: [...brief.nearby, { category: 'tol', name: '', minutes: null }] })}
      >
        Tambah tempat terdekat
      </Button>

      {adaTanpaMenit ? (
        <p style={{ fontSize: 13, color: 'var(--sage)' }}>
          Tanpa waktu tempuh, tempat ini menjadi bahan tulisan dan tidak tampil sebagai kartu akses.
        </p>
      ) : null}
    </>
  );
}

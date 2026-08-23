'use client';

import { Button, Input } from '@/components/ds';
import type { PanelProps } from './HeroPanel';

/**
 * Keunggulan BEDA dari fasilitas: "bebas banjir", "one gate system",
 * "potensi investasi" — klaim tentang kawasan, bukan benda di dalamnya.
 * Ini bahan yang membuat sellingPoints AI ter-grounding.
 */
export function HighlightsPanel({ brief, onChange }: PanelProps) {
  const set = (i: number, value: string) => {
    const next = [...brief.highlights];
    next[i] = value;
    onChange({ highlights: next });
  };

  /**
   * Baris yang ditinggalkan kosong ("Tambah keunggulan" diklik lalu tidak
   * diisi) disaring begitu field-nya blur — pola yang sama dengan
   * PromoPanel.onBlur (lihat parsePromoLines untuk alasan filternya harus
   * di onBlur, bukan onChange): menyaring di TIAP keystroke akan membuang
   * baris begitu sempat kosong sesaat (mis. backspace penuh sebelum
   * mengetik ulang), membuat baris yang sedang diketik menghilang dari
   * bawah kursor. Menyaring di onBlur hanya menyentuh baris yang sudah
   * ditinggalkan (dan karena setiap baris adalah input terkendali sendiri,
   * baris lain yang sedang aktif diketik tidak pernah ikut tersapu — beda
   * dari kasus PromoPanel yang satu textarea dipecah jadi banyak baris).
   */
  const cleanOnBlur = () =>
    onChange({ highlights: brief.highlights.map((h) => h.trim()).filter((h) => h.length > 0) });

  return (
    <>
      {brief.highlights.map((h, i) => (
        <div key={i} className="wz-panel__row">
          <Input
            label={`Keunggulan ${i + 1}`}
            placeholder="Contoh: Bebas banjir"
            value={h}
            onChange={(e) => set(i, e.target.value)}
            onBlur={cleanOnBlur}
          />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus keunggulan ${i + 1}`}
            onClick={() => onChange({ highlights: brief.highlights.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}
      <Button variant="link" size="sm" onClick={() => onChange({ highlights: [...brief.highlights, ''] })}>
        Tambah keunggulan
      </Button>
    </>
  );
}

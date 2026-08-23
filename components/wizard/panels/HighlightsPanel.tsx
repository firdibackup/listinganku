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

  return (
    <>
      {brief.highlights.map((h, i) => (
        <div key={i} className="wz-panel__row">
          <Input
            label={`Keunggulan ${i + 1}`}
            placeholder="Contoh: Bebas banjir"
            value={h}
            onChange={(e) => set(i, e.target.value)}
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

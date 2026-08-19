'use client';

import { PALETTE_NAMES, PALETTE_LABELS, PALETTES } from '@/lib/landing/palettes';
import type { PaletteName } from '@/lib/data/types';

/**
 * Baris 10 swatch palet. Warna swatch diambil dari PALETTES[name].accent lewat
 * inline style — komponen ini di components/, di luar jangkauan lint no-literal
 * yang hanya menjaga lib/landing/themes. Memilih swatch mengubah Project.palette;
 * pratinjau ikut berubah seketika karena root-nya membaca var(--lp-*).
 */
export function PalettePicker({
  value, onSelect,
}: {
  value: PaletteName;
  onSelect: (palette: PaletteName) => void;
}) {
  return (
    <div className="ed__palettes" role="group" aria-label="Skema warna">
      {PALETTE_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          className="ed__swatch"
          aria-pressed={value === name}
          aria-label={PALETTE_LABELS[name]}
          title={PALETTE_LABELS[name]}
          onClick={() => onSelect(name)}
          style={{ background: PALETTES[name].accent }}
        />
      ))}
    </div>
  );
}

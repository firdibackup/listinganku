'use client';

import { useState } from 'react';
import type { ResolvedBlock } from '../../resolve';
import { formatArea, formatRupiahShort } from '@/lib/format';
import { Img } from './parts';

/**
 * Blok tipe unit bertab (spec §11). Ganti tab menukar kartu tanpa reload.
 * Legalitas "SHM" dari desain SENGAJA tidak disalin — tidak ada di skema, dan
 * mengklaimnya untuk unit yang belum tentu SHM adalah klaim hukum palsu.
 */
export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  const [active, setActive] = useState(0);
  if (block.houseTypes.length === 0) return null;

  const current = block.houseTypes[Math.min(active, block.houseTypes.length - 1)];
  const specs: { label: string; value: string }[] = [
    { label: 'Luas tanah', value: formatArea(current.landArea) },
    { label: 'Luas bangunan', value: formatArea(current.buildingArea) },
    { label: 'Kamar tidur', value: String(current.bedrooms) },
    { label: 'Kamar mandi', value: String(current.bathrooms) },
    { label: 'Carport', value: String(current.carport) },
    { label: 'Harga', value: formatRupiahShort(current.price) },
  ];

  return (
    <section className="lp-tw-units" id="unit">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Tipe unit</p>
        <h2 className="lp-tw-h2">Pilih tipe yang cocok</h2>

        <div className="lp-tw-tabs" role="tablist" aria-label="Tipe unit">
          {block.houseTypes.map((h, i) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className="lp-tw-tab"
              onClick={() => setActive(i)}
            >
              {h.name}
            </button>
          ))}
        </div>

        <article className="lp-tw-unitcard" id={current.slug}>
          <div className="lp-tw-unitcard__media">
            <Img media={current.primaryPhoto} alt={`Tipe ${current.name}`} />
          </div>
          <div className="lp-tw-unitcard__body">
            <h3 className="lp-tw-unitcard__name">{current.name}</h3>
            <p className="lp-tw-unitcard__price">{formatRupiahShort(current.price)}</p>
            <div className="lp-tw-specgrid">
              {specs.map((s) => (
                <div key={s.label} className="lp-tw-spec">
                  <div className="lp-tw-spec__label">{s.label}</div>
                  <div className="lp-tw-spec__value">{s.value}</div>
                </div>
              ))}
            </div>
            {current.shortDescription ? (
              <p className="lp-tw-unitcard__desc">{current.shortDescription}</p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

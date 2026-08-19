import type { ResolvedBlock } from '../../resolve';
import { formatArea, formatRupiahShort } from '@/lib/format';
import { Img } from '../tropicalWarm/parts';

/**
 * Varian "daftar" untuk blok tipe unit (dipakai tema editorial/arsitektural):
 * semua tipe ditumpuk sebagai daftar, bukan bertab. Server component — tanpa
 * state. Legalitas "SHM" dari desain sengaja tidak disalin (klaim hukum palsu).
 */
export function HouseTypesList({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  if (block.houseTypes.length === 0) return null;
  return (
    <section className="lp-tw-section" id="unit">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Tipe unit</p>
        <h2 className="lp-tw-h2">Pilihan tipe unit</h2>
        <div className="lp-x-unitlist">
          {block.houseTypes.map((h) => (
            <article key={h.id} id={h.slug} className="lp-x-unitrow">
              <div className="lp-x-unitrow__head">
                <h3 className="lp-x-unitrow__name">Tipe {h.name}</h3>
                <span className="lp-x-unitrow__price">{formatRupiahShort(h.price)}</span>
              </div>
              <div className="lp-x-unitrow__media">
                <Img media={h.primaryPhoto} alt={`Denah ${h.name}`} />
              </div>
              <div className="lp-x-unitrow__specs">
                {[
                  { k: 'Luas tanah', v: formatArea(h.landArea) },
                  { k: 'Bangunan', v: formatArea(h.buildingArea) },
                  { k: 'Kamar tidur', v: String(h.bedrooms) },
                  { k: 'Kamar mandi', v: String(h.bathrooms) },
                  { k: 'Carport', v: String(h.carport) },
                ].map((s) => (
                  <div key={s.k} className="lp-x-unitrow__spec">
                    <div className="lp-x-unitrow__spec-k">{s.k}</div>
                    <div className="lp-x-unitrow__spec-v">{s.v}</div>
                  </div>
                ))}
              </div>
              {h.shortDescription ? <p className="lp-x-unitrow__desc">{h.shortDescription}</p> : null}
              <a href="#kontak" className="lp-x-unitrow__link">Lihat detail unit →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

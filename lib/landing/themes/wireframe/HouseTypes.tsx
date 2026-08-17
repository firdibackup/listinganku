import { PlaceholderBox } from './Hero';
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ResolvedBlock } from '../../resolve';

export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  if (block.houseTypes.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Tipe rumah</h2>
        <div className="lp__grid lp__grid--3" style={{ marginTop: 16 }}>
          {block.houseTypes.map((h) => (
            <article key={h.id} id={h.slug} className="lp__card">
              {h.primaryPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.primaryPhoto.url} alt={h.name} style={{ height: 150, width: '100%', objectFit: 'cover' }} />
              ) : (
                <PlaceholderBox label={`Foto ${h.name}`} height={150} />
              )}
              <div style={{ padding: 18 }}>
                <h3 className="lw-h3">{h.name}</h3>
                <p className="lw-label" style={{ marginTop: 6, color: 'var(--evergreen)' }}>
                  {formatRupiahShort(h.price)}
                </p>
                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
                  LT {formatArea(h.landArea)} · LB {formatArea(h.buildingArea)} · {h.bedrooms} KT · {h.bathrooms} KM
                </p>
                {h.shortDescription ? (
                  <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
                    {h.shortDescription}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

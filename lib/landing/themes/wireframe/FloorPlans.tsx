import { PlaceholderBox } from './Hero';
import type { ResolvedBlock } from '../../resolve';

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Denah</h2>
        <div className="lp__grid lp__grid--3" style={{ marginTop: 16 }}>
          {block.plans.length > 0
            ? block.plans.map(({ houseType, media }) => (
                <figure key={houseType.id} className="lp__card" style={{ margin: 0, padding: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media.url} alt={`Denah ${houseType.name}`} style={{ width: '100%' }} />
                  <figcaption style={{ marginTop: 10, fontSize: 14, color: 'var(--sage)' }}>
                    Denah {houseType.name}
                  </figcaption>
                </figure>
              ))
            : <PlaceholderBox label="Denah belum diunggah" height={180} />}
        </div>
      </div>
    </section>
  );
}

import type { ResolvedBlock } from '../../resolve';
import { Ph } from './parts';

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Fasilitas</p>
        <h2 className="lp-tw-h2">Fasilitas kawasan</h2>
        <div className="lp-tw-fac">
          {block.items.map((item) => (
            <div key={item.name} className="lp-tw-fac__item">
              <div className="lp-tw-fac__ph"><Ph label={`Foto ${item.name}`} /></div>
              <div className="lp-tw-fac__body">
                <div className="lp-tw-fac__name">{item.name}</div>
                {item.desc ? <div className="lp-tw-fac__desc">{item.desc}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

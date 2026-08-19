import type { ResolvedBlock } from '../../resolve';
import { Ph } from './parts';

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Fasilitas</p>
        <h2 className="lp-tw-h2">Ruang bersama di dalam cluster</h2>
        <div className="lp-tw-fac">
          {block.items.map((name) => (
            <div key={name} className="lp-tw-fac__item">
              <div className="lp-tw-fac__ph"><Ph label={name} /></div>
              <div className="lp-tw-fac__name">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

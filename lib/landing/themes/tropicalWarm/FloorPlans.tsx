import type { ResolvedBlock } from '../../resolve';
import { Img } from './parts';
import { planSlots } from '../slots';

/** Masterplan kawasan + denah per tipe. Legenda klaster mewarnai diri dari palet. */
export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Masterplan</p>
        <h2 className="lp-tw-h2">Denah kawasan</h2>
        <div className="lp-tw-master">
          <Img media={block.masterplan} alt="Masterplan kawasan" />
        </div>
        {block.legend.length ? (
          <ul className="lp-tw-legend">
            {block.legend.map((name, i) => (
              <li key={name} className="lp-tw-legend__item" data-slot={i % 4}>
                <span className="lp-tw-legend__dot" aria-hidden />
                {name}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="lp-tw-plans">
          {slots.map((slot) => (
            <div key={slot.key} className="lp-tw-plan">
              <div className="lp-tw-plan__media">
                <Img media={slot.media} alt={`Denah tipe ${slot.name}`} />
              </div>
              <div className="lp-tw-plan__name">Denah {slot.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

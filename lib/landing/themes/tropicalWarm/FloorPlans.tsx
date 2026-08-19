import type { ResolvedBlock } from '../../resolve';
import { Img } from './parts';

/** Masterplan project dulu, lalu denah per tipe. Section tak dirender bila keduanya kosong. */
export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  if (!block.masterplan && block.plans.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Denah</p>
        <h2 className="lp-tw-h2">Masterplan & denah unit</h2>
        <div className="lp-tw-plans">
          {block.masterplan ? (
            <div className="lp-tw-master">
              <Img media={block.masterplan} alt="Masterplan cluster" />
            </div>
          ) : null}
          {block.plans.map(({ houseType, media }) => (
            <div key={houseType.id} className="lp-tw-plan">
              <div className="lp-tw-plan__media">
                <Img media={media} alt={`Denah tipe ${houseType.name}`} />
              </div>
              <div className="lp-tw-plan__name">Denah {houseType.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

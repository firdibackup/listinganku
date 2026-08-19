import type { ResolvedBlock } from '../../resolve';

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Kenapa proyek ini</p>
        <h2 className="lp-tw-h2">Alasan utama</h2>
        <div className="lp-tw-usp">
          {block.items.map((item, i) => (
            <div key={item} className="lp-tw-usp__item">
              <span className="lp-tw-usp__num">{i + 1}</span>
              <span className="lp-tw-usp__text">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { ResolvedBlock } from '../../resolve';

/** USP bernomor: judul tebal + satu kalimat penjelas (desain #10, blok "Enam alasan utama"). */
export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Kenapa {'proyek ini'}</p>
        <h2 className="lp-tw-h2">Enam alasan utama</h2>
        <div className="lp-tw-usp">
          {block.items.map((item, i) => (
            <div key={item.title} className="lp-tw-usp__item">
              <span className="lp-tw-usp__num">{i + 1}</span>
              <span className="lp-tw-usp__body">
                <span className="lp-tw-usp__text">{item.title}</span>
                {item.desc ? <span className="lp-tw-usp__desc">{item.desc}</span> : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

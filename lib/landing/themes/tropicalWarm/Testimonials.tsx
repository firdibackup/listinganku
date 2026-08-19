import type { ResolvedBlock } from '../../resolve';

/** Testimoni HANYA diisi agen (tidak pernah dari AI). Kosong = tidak dirender. */
export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Testimoni</p>
        <div className="lp-tw-tst">
          {block.items.map((t, i) => (
            <figure key={`${t.name}-${i}`} className="lp-tw-tst__card">
              <blockquote className="lp-tw-tst__quote">“{t.quote}”</blockquote>
              <figcaption className="lp-tw-tst__who">
                <span className="lp-tw-tst__avatar" aria-hidden />
                <span>
                  <span className="lp-tw-tst__name">{t.name}</span>
                  {t.unit ? <span className="lp-tw-tst__unit"> · {t.unit}</span> : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

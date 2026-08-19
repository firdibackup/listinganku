import type { ResolvedBlock } from '../../resolve';
import { formatRupiahShort } from '@/lib/format';

export function PricePromo({ block }: { block: Extract<ResolvedBlock, { type: 'pricePromo' }> }) {
  const empty =
    block.priceFrom === null && !block.dpText && !block.installmentText && block.promos.length === 0 && !block.note;
  if (empty) return null;

  return (
    <section className="lp-tw-promo">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Harga &amp; promo</p>
        {block.priceFrom !== null ? (
          <p className="lp-tw-promo__price">
            {formatRupiahShort(block.priceFrom)} <small>mulai dari</small>
          </p>
        ) : null}

        {block.dpText || block.installmentText ? (
          <div className="lp-tw-promo__cards">
            {block.dpText ? (
              <div className="lp-tw-promo__card">
                <div className="lp-tw-promo__card-label">DP</div>
                <div className="lp-tw-promo__card-value">{block.dpText}</div>
              </div>
            ) : null}
            {block.installmentText ? (
              <div className="lp-tw-promo__card">
                <div className="lp-tw-promo__card-label">Cicilan</div>
                <div className="lp-tw-promo__card-value">{block.installmentText}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        {block.promos.length ? (
          <ul className="lp-tw-promo__list">
            {block.promos.map((promo) => (
              <li key={promo} className="lp-tw-promo__li">
                <span aria-hidden>✓</span>
                <span>{promo}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {block.note ? <p className="lp-tw-promo__note">{block.note}</p> : null}
      </div>
    </section>
  );
}

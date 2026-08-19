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
        <h2 className="lp-tw-h2">Miliki hunian impian Anda</h2>
        {block.priceFrom !== null ? (
          <div className="lp-tw-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</div>
        ) : null}

        {block.dpText || block.installmentText ? (
          <div className="lp-tw-promo__cards">
            {block.dpText ? (
              <div className="lp-tw-promo__card">
                <div className="lp-tw-promo__card-label">DP mulai</div>
                <div className="lp-tw-promo__card-value">{block.dpText}</div>
              </div>
            ) : null}
            {block.installmentText ? (
              <div className="lp-tw-promo__card">
                <div className="lp-tw-promo__card-label">Cicilan mulai</div>
                <div className="lp-tw-promo__card-value">{block.installmentText}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        {block.promos.length ? (
          <ul className="lp-tw-promo__list">
            {block.promos.map((promo) => (
              <li key={promo} className="lp-tw-promo__li">{promo}</li>
            ))}
          </ul>
        ) : null}

        {block.note ? <p className="lp-tw-promo__note">{block.note}</p> : null}
      </div>
    </section>
  );
}

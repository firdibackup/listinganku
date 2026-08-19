import type { ResolvedBlock } from '../../resolve';
import { formatRupiahShort } from '@/lib/format';
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';
import { Img } from './parts';

/**
 * Hero + price bar dalam satu komponen (price bar bukan blok tersendiri, spec §11).
 * Badge maksimal 4 sudah dipotong di resolve.ts. Price bar hilang saat priceFrom
 * null (project belum punya tipe rumah).
 */
export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <>
      <section className="lp-tw-hero">
        <div className="lp-tw-hero__media">
          <Img media={block.image} alt={block.title} />
        </div>
        <div className="lp-tw-hero__overlay" />
        <div className="lp-tw-hero__body">
          {block.badges.length ? (
            <div className="lp-tw-hero__badges">
              {block.badges.map((b) => (
                <span key={b} className="lp-tw-badge">{b}</span>
              ))}
            </div>
          ) : null}
          <h1 className="lp-tw-hero__title">{block.title}</h1>
          {block.subtitle ? <p className="lp-tw-hero__sub">{block.subtitle}</p> : null}
        </div>
      </section>

      {block.priceFrom !== null ? (
        <div className="lp-tw-pricebar">
          <div>
            <p className="lp-tw-pricebar__label">Harga mulai</p>
            <p className="lp-tw-pricebar__value">{formatRupiahShort(block.priceFrom)}</p>
          </div>
          <WhatsAppLink
            projectId={block.projectId}
            waNumber={block.waNumber}
            message={block.defaultMessage}
            className="lp-tw-pricebar__cta"
          >
            Hubungi Marketing
          </WhatsAppLink>
        </div>
      ) : null}
    </>
  );
}

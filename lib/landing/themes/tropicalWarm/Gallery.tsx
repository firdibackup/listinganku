import type { ResolvedBlock } from '../../resolve';
import { Img } from './parts';

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  if (block.images.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Galeri</p>
        <h2 className="lp-tw-h2">Suasana kawasan</h2>
        <div className="lp-tw-gallery">
          {block.images.map((media, i) => (
            <div key={media.id} className="lp-tw-gallery__item">
              <div className="lp-tw-gallery__media">
                <Img media={media} alt={`Foto suasana ${i + 1}`} />
              </div>
              <div className="lp-tw-gallery__cap">Foto {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

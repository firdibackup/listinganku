import type { ResolvedBlock } from '../../resolve';
import { Img } from './parts';

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  if (block.images.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Galeri</p>
        <h2 className="lp-tw-h2">Suasana hunian</h2>
        <div className="lp-tw-gallery">
          {block.images.map((media, i) => (
            <div key={media.id} className="lp-tw-gallery__item">
              <Img media={media} alt={`Foto suasana ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

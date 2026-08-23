import type { ResolvedBlock } from '../../resolve';
import { Img } from './parts';
import { gallerySlots } from '../slots';

/**
 * Carousel horizontal. Slot dibentuk dari keterangan (blok) DAN foto (media):
 * selama agen belum mengunggah apa pun, keterangan tetap memberi bentuk pada
 * section ini — sama seperti file desain yang menggambar kotak berlabel.
 */
export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  const slots = gallerySlots(block);
  if (slots.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Galeri</p>
        <h2 className="lp-tw-h2">Suasana kawasan</h2>
        <div className="lp-tw-gallery">
          {slots.map((slot) => (
            <div key={slot.key} className="lp-tw-gallery__item">
              <div className="lp-tw-gallery__media">
                <Img media={slot.media} alt={slot.caption} />
              </div>
              <div className="lp-tw-gallery__cap">{slot.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

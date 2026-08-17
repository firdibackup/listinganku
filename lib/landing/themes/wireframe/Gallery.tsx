import { PlaceholderBox } from './Hero';
import type { ResolvedBlock } from '../../resolve';

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Galeri</h2>
        <div className="lp__grid lp__grid--4" style={{ marginTop: 16 }}>
          {block.images.length > 0
            ? block.images.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.url} alt="" style={{ height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ))
            : Array.from({ length: 4 }, (_, i) => <PlaceholderBox key={i} label="Foto" height={140} />)}
        </div>
      </div>
    </section>
  );
}

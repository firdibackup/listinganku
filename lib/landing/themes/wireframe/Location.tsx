import type { ResolvedBlock } from '../../resolve';
import { PlaceholderBox } from './Hero';

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Lokasi</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>{block.address || '—'}</p>
        <div style={{ marginTop: 16 }}><PlaceholderBox label="Peta lokasi" height={220} /></div>
      </div>
    </section>
  );
}

import { Chip } from '@/components/ds';
import type { ResolvedBlock } from '../../resolve';

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Fasilitas</h2>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {block.items.map((item) => <Chip key={item} tone="outline" size="md">{item}</Chip>)}
        </div>
      </div>
    </section>
  );
}

import { Accordion } from '@/components/ui';
import type { ResolvedBlock } from '../../resolve';

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Pertanyaan yang sering diajukan</h2>
        <div style={{ marginTop: 16 }}>
          <Accordion items={block.items.map((item, i) => ({ id: `faq-${i}`, question: item.q, answer: item.a }))} />
        </div>
      </div>
    </section>
  );
}

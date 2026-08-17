// Form fungsional dipasang di Task 14.
import type { ResolvedBlock } from '../../resolve';

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section className="lp__section" data-form-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Minta info</h2>
      </div>
    </section>
  );
}
